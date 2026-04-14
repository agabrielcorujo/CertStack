# IAM — Roles, Policies, and Team Access

## Overview

AWS Identity and Access Management (IAM) controls *who* can do *what* in your AWS account. For CertStack, there are two distinct IAM concerns:

1. **Human users** — Your team members who interact with the AWS console or CLI.
2. **Service roles** — Permissions that AWS services (ECS, Fargate tasks) use when acting on your behalf at runtime.

Mixing these up is a common mistake. A developer should never hard-code their personal credentials into application code. Instead, ECS tasks assume a **role** with only the permissions they need.

---

## Part 1 — Team IAM Users

### Principle of Least Privilege

Every IAM user should have only the permissions required for their role on the project. Avoid attaching `AdministratorAccess` to anyone who doesn't need full control.

### Suggested Team Roles and Policies

#### Role: Infrastructure / DevOps

Needs full access to ECS, ECR, CloudFormation, VPC, and IAM (to create service roles).

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "InfrastructureAccess",
      "Effect": "Allow",
      "Action": [
        "ecs:*",
        "ecr:*",
        "cloudformation:*",
        "ec2:*",
        "elasticloadbalancing:*",
        "elasticache:*",
        "iam:PassRole",
        "iam:CreateRole",
        "iam:AttachRolePolicy",
        "iam:GetRole",
        "iam:ListRoles",
        "logs:*"
      ],
      "Resource": "*"
    }
  ]
}
```

#### Role: Backend Developer

Needs to push images to ECR, view ECS logs, and read Secrets Manager. Does not need to modify VPC or IAM.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ECRAccess",
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:PutImage",
        "ecr:InitiateLayerUpload",
        "ecr:UploadLayerPart",
        "ecr:CompleteLayerUpload",
        "ecr:DescribeRepositories",
        "ecr:ListImages"
      ],
      "Resource": "*"
    },
    {
      "Sid": "ECSReadOnly",
      "Effect": "Allow",
      "Action": [
        "ecs:DescribeServices",
        "ecs:DescribeTasks",
        "ecs:ListTasks",
        "logs:GetLogEvents",
        "logs:FilterLogEvents",
        "logs:DescribeLogStreams"
      ],
      "Resource": "*"
    },
    {
      "Sid": "SecretsReadOnly",
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue",
        "secretsmanager:DescribeSecret"
      ],
      "Resource": "arn:aws:secretsmanager:us-east-1:*:secret:certstack/*"
    }
  ]
}
```

#### Role: Database / Data Team

Needs access to Secrets Manager (for DB credentials), RDS/Supabase connection info, and S3 (if used for data files). No ECS or ECR access needed.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "SecretsAccess",
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue",
        "secretsmanager:PutSecretValue",
        "secretsmanager:DescribeSecret",
        "secretsmanager:ListSecrets"
      ],
      "Resource": "arn:aws:secretsmanager:us-east-1:*:secret:certstack/*"
    },
    {
      "Sid": "S3DataAccess",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::certstack-data-*",
        "arn:aws:s3:::certstack-data-*/*"
      ]
    }
  ]
}
```

### How to Create a Team Member User

```bash
# 1. Create the user
aws iam create-user --user-name alice-backend

# 2. Create a policy file (backend-policy.json) from the JSON above
# 3. Create the policy in AWS
aws iam create-policy \
  --policy-name CertStackBackendDeveloper \
  --policy-document file://backend-policy.json

# 4. Attach to the user
aws iam attach-user-policy \
  --user-name alice-backend \
  --policy-arn arn:aws:iam::<ACCOUNT_ID>:policy/CertStackBackendDeveloper

# 5. Create access keys for CLI access
aws iam create-access-key --user-name alice-backend
```

> Optionally, group users into **IAM Groups** (e.g., `certstack-backend-team`, `certstack-infra-team`) and attach policies to the group instead of individual users. This makes onboarding/offboarding cleaner.

---

## Part 2 — ECS Service Roles

When your FastAPI server runs on Fargate, it needs permission to:
- Pull secrets from Secrets Manager
- Write logs to CloudWatch
- Pull its image from ECR (this is the execution role, not the task role)

These are granted via two IAM roles that ECS assumes — not your personal credentials.

### ECS Task Execution Role

Used by the **ECS agent** to set up the container: pull the ECR image, inject secrets, create log streams.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage",
        "logs:CreateLogStream",
        "logs:PutLogEvents",
        "logs:CreateLogGroup",
        "secretsmanager:GetSecretValue",
        "ssm:GetParameters"
      ],
      "Resource": "*"
    }
  ]
}
```

The trust policy (who can assume this role) should allow `ecs-tasks.amazonaws.com`:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": { "Service": "ecs-tasks.amazonaws.com" },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

### ECS Task Role

Used by the **running application code** itself (your FastAPI server). If your server ever calls AWS APIs directly (S3, Bedrock, Secrets Manager via SDK, etc.), those permissions go here — not in the execution role.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject"
      ],
      "Resource": "arn:aws:s3:::certstack-exam-data/*"
    }
  ]
}
```

### CloudFormation — Creating Both Roles

In your CloudFormation template, add these under `Resources`:

```yaml
  ECSExecutionRole:
    Type: AWS::IAM::Role
    Properties:
      RoleName: !Sub "certstack-${Environment}-execution-role"
      AssumeRolePolicyDocument:
        Version: "2012-10-17"
        Statement:
          - Effect: Allow
            Principal:
              Service: ecs-tasks.amazonaws.com
            Action: sts:AssumeRole
      ManagedPolicyArns:
        - arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy
      Policies:
        - PolicyName: SecretsAccess
          PolicyDocument:
            Version: "2012-10-17"
            Statement:
              - Effect: Allow
                Action:
                  - secretsmanager:GetSecretValue
                Resource: !Sub "arn:aws:secretsmanager:${AWS::Region}:${AWS::AccountId}:secret:certstack/*"

  ECSTaskRole:
    Type: AWS::IAM::Role
    Properties:
      RoleName: !Sub "certstack-${Environment}-task-role"
      AssumeRolePolicyDocument:
        Version: "2012-10-17"
        Statement:
          - Effect: Allow
            Principal:
              Service: ecs-tasks.amazonaws.com
            Action: sts:AssumeRole
      Policies:
        - PolicyName: AppPermissions
          PolicyDocument:
            Version: "2012-10-17"
            Statement:
              - Effect: Allow
                Action:
                  - s3:GetObject
                  - s3:PutObject
                Resource: !Sub "arn:aws:s3:::certstack-data-${Environment}/*"
```

---

## IAM Checklist

- [ ] Each team member has their own IAM user (no shared credentials)
- [ ] Users are assigned role-specific policies, not `AdministratorAccess`
- [ ] ECS Task Execution Role exists and can pull from ECR + read Secrets Manager
- [ ] ECS Task Role exists for runtime app permissions
- [ ] No secrets or access keys are committed to the Git repository
- [ ] MFA is enabled for all IAM users with console access
- [ ] Access keys are rotated regularly (every 90 days recommended)