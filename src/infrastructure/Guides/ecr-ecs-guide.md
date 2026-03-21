# ECR + ECS/Fargate Deployment Guide

## Overview

CertStack runs three services locally via Docker Compose: `client` (Next.js), `server` (FastAPI + Uvicorn), and `redis`. To deploy this on AWS, each service gets its own container image stored in **Elastic Container Registry (ECR)** and orchestrated by **Elastic Container Service (ECS)** using the **Fargate** launch type (serverless — no EC2 instances to manage).

---

## Architecture Mapping

| Local (Docker Compose) | AWS Equivalent |
|---|---|
| `client` container | ECS Task — Fargate, ECR image |
| `server` container | ECS Task — Fargate, ECR image |
| `redis` container | Amazon ElastiCache (Redis) |
| `docker compose up` | ECS Service (desired count ≥ 1) |
| `.env.dev` file | AWS Secrets Manager / SSM Parameter Store |
| `localhost` networking | ECS Service Discovery / ALB |

---

## Step 1 — Create ECR Repositories

You need one ECR repo per service image (`client` and `server`). Redis is replaced by ElastiCache in production and does not need an ECR repo.

```bash
# Authenticate Docker to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com

# Create repos
aws ecr create-repository --repository-name certstack/client --region us-east-1
aws ecr create-repository --repository-name certstack/server --region us-east-1
```

---

## Step 2 — Build and Push Images

Each Dockerfile lives in `src/infrastructure/`. Build them targeting the production stage (if multi-stage) and tag them for ECR.

```bash
# Build server image
docker build \
  -f src/infrastructure/Dockerfile.server \
  -t certstack/server:latest \
  src/server

# Tag for ECR
docker tag certstack/server:latest \
  <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/certstack/server:latest

# Push
docker push <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/certstack/server:latest

# Repeat for client
docker build \
  -f src/infrastructure/Dockerfile.client \
  -t certstack/client:latest \
  src/client/certstack

docker tag certstack/client:latest \
  <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/certstack/client:latest

docker push <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/certstack/client:latest
```

> **Tip:** Automate this in a CI/CD pipeline (GitHub Actions) so every merge to `testing` or `prod` triggers a rebuild and push.

---

## Step 3 — ECS Cluster Setup

Create a cluster. With Fargate, the cluster is just a logical grouping — no servers to provision.

```bash
aws ecs create-cluster --cluster-name certstack-cluster --region us-east-1
```

---

## Step 4 — Task Definitions

A **Task Definition** is the ECS equivalent of a `docker-compose` service block. It defines the image, CPU/memory, port mappings, environment variables, and log configuration.

### Server Task Definition (`certstack-server-task.json`)

```json
{
  "family": "certstack-server",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::<ACCOUNT_ID>:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::<ACCOUNT_ID>:role/certstack-task-role",
  "containerDefinitions": [
    {
      "name": "server",
      "image": "<ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/certstack/server:latest",
      "portMappings": [
        { "containerPort": 8000, "protocol": "tcp" }
      ],
      "environment": [
        { "name": "REDIS_URL", "value": "redis://<ELASTICACHE_ENDPOINT>:6379" }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:<ACCOUNT_ID>:secret:certstack/db-url"
        },
        {
          "name": "JWT_SECRET",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:<ACCOUNT_ID>:secret:certstack/jwt-secret"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/certstack-server",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

> The `secrets` block pulls values from **AWS Secrets Manager** at container start — this replaces your local `.env.dev` file. Never bake secrets into the image.

Register the task definition:

```bash
aws ecs register-task-definition \
  --cli-input-json file://certstack-server-task.json \
  --region us-east-1
```

---

## Step 5 — ECS Services

An ECS **Service** keeps a desired number of task instances running. It integrates with an **Application Load Balancer (ALB)** for public traffic.

```bash
aws ecs create-service \
  --cluster certstack-cluster \
  --service-name certstack-server \
  --task-definition certstack-server \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={
    subnets=[subnet-xxxxxx,subnet-yyyyyy],
    securityGroups=[sg-xxxxxxxx],
    assignPublicIp=ENABLED
  }" \
  --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:...,containerName=server,containerPort=8000" \
  --region us-east-1
```

---

## Step 6 — Networking (VPC, Subnets, Security Groups)

| Resource | Purpose |
|---|---|
| VPC | Isolated network for all CertStack resources |
| Public Subnets (×2) | ALB lives here |
| Private Subnets (×2) | ECS tasks and ElastiCache live here |
| Security Group — ALB | Allow 80/443 inbound from internet |
| Security Group — ECS | Allow 8000 from ALB SG only |
| Security Group — Redis | Allow 6379 from ECS SG only |

This layered SG design means the FastAPI server is never directly reachable from the internet — all traffic flows through the ALB.

---

## Common Deployment Bugs and Fixes

| Symptom | Likely Cause | Fix |
|---|---|---|
| Task exits immediately | Missing env var or bad secret ARN | Check CloudWatch logs under `/ecs/certstack-server` |
| `Connection refused` to Redis | ECS task using `localhost` for Redis | Set `REDIS_URL` to ElastiCache endpoint |
| `ImagePullBackoff` equivalent | ECR image not found | Verify tag, region, and `ecsTaskExecutionRole` has `ecr:GetAuthorizationToken` |
| ALB returns 502 | Container not healthy on port 8000 | Check health check path matches `/` FastAPI health route |

---

## Local vs. Production Environment Variable Mapping

| `.env.dev` Key | Production Source |
|---|---|
| `DATABASE_URL` | Secrets Manager |
| `JWT_SECRET` | Secrets Manager |
| `REDIS_URL` | Env var pointing to ElastiCache |
| `OPENAI_API_KEY` | Secrets Manager |
| `NEXT_PUBLIC_API_URL` | ALB DNS name (set at build time or runtime) |