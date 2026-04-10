# CloudFormation — Automating the AWS Environment

## Why CloudFormation?

Most coding environments:

1. **It's not reproducible.** If you need to spin up a fresh environment (new region, disaster recovery, onboarding a new team member), you have to remember every click.
2. **It's not reviewable.** Infrastructure changes can't be code-reviewed or rolled back the way application code can.

CloudFormation solves this with **Infrastructure as Code (IaC)** — you describe your entire AWS environment in a YAML/JSON template, and AWS builds (or tears down) everything from it.

---

## Template Structure

A CloudFormation template has these top-level sections:

```yaml
AWSTemplateFormatVersion: "2010-09-09"
Description: "CertStack production infrastructure"

Parameters:       # Inputs (image tags, env names, etc.)
  ...

Resources:        # The actual AWS resources to create
  ...

Outputs:          # Values to export (ALB DNS, ECR repo URLs, etc.)
  ...
```

Everything below is a working starting template you can evolve incrementally.

---

## Parameters Block

Parameters let you reuse one template across `dev`, `testing`, and `prod` environments by passing different values.

```yaml
Parameters:
  Environment:
    Type: String
    Default: dev
    AllowedValues: [dev, testing, prod]
    Description: Deployment environment

  ServerImageTag:
    Type: String
    Default: latest
    Description: ECR image tag for the server service

  ClientImageTag:
    Type: String
    Default: latest
    Description: ECR image tag for the client service

  DBPasswordSecretArn:
    Type: String
    Description: ARN of the Secrets Manager secret holding the DB password
```

---

## Core Resources

### VPC and Networking

```yaml
Resources:

  CertStackVPC:
    Type: AWS::EC2::VPC
    Properties:
      CidrBlock: 10.0.0.0/16
      EnableDnsHostnames: true
      Tags:
        - Key: Name
          Value: !Sub "certstack-${Environment}-vpc"

  PublicSubnetA:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId: !Ref CertStackVPC
      CidrBlock: 10.0.1.0/24
      AvailabilityZone: !Select [0, !GetAZs ""]
      MapPublicIpOnLaunch: true

  PublicSubnetB:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId: !Ref CertStackVPC
      CidrBlock: 10.0.2.0/24
      AvailabilityZone: !Select [1, !GetAZs ""]
      MapPublicIpOnLaunch: true

  PrivateSubnetA:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId: !Ref CertStackVPC
      CidrBlock: 10.0.3.0/24
      AvailabilityZone: !Select [0, !GetAZs ""]

  PrivateSubnetB:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId: !Ref CertStackVPC
      CidrBlock: 10.0.4.0/24
      AvailabilityZone: !Select [1, !GetAZs ""]
```

### ECR Repositories

```yaml
  ServerRepository:
    Type: AWS::ECR::Repository
    Properties:
      RepositoryName: !Sub "certstack/${Environment}/server"
      ImageScanningConfiguration:
        ScanOnPush: true
      LifecyclePolicy:
        LifecyclePolicyText: |
          {
            "rules": [{
              "rulePriority": 1,
              "description": "Keep last 5 images",
              "selection": {
                "tagStatus": "any",
                "countType": "imageCountMoreThan",
                "countNumber": 5
              },
              "action": { "type": "expire" }
            }]
          }

  ClientRepository:
    Type: AWS::ECR::Repository
    Properties:
      RepositoryName: !Sub "certstack/${Environment}/client"
      ImageScanningConfiguration:
        ScanOnPush: true
```

### ECS Cluster

```yaml
  ECSCluster:
    Type: AWS::ECS::Cluster
    Properties:
      ClusterName: !Sub "certstack-${Environment}"
      ClusterSettings:
        - Name: containerInsights
          Value: enabled
```

### Application Load Balancer

```yaml
  ALBSecurityGroup:
    Type: AWS::EC2::SecurityGroup
    Properties:
      GroupDescription: Allow HTTP/HTTPS from internet
      VpcId: !Ref CertStackVPC
      SecurityGroupIngress:
        - IpProtocol: tcp
          FromPort: 80
          ToPort: 80
          CidrIp: 0.0.0.0/0
        - IpProtocol: tcp
          FromPort: 443
          ToPort: 443
          CidrIp: 0.0.0.0/0

  ApplicationLoadBalancer:
    Type: AWS::ElasticLoadBalancingV2::LoadBalancer
    Properties:
      Name: !Sub "certstack-${Environment}-alb"
      Subnets:
        - !Ref PublicSubnetA
        - !Ref PublicSubnetB
      SecurityGroups:
        - !Ref ALBSecurityGroup
      Scheme: internet-facing

  ServerTargetGroup:
    Type: AWS::ElasticLoadBalancingV2::TargetGroup
    Properties:
      Port: 8000
      Protocol: HTTP
      TargetType: ip
      VpcId: !Ref CertStackVPC
      HealthCheckPath: /
      HealthCheckIntervalSeconds: 30

  ALBListener:
    Type: AWS::ElasticLoadBalancingV2::Listener
    Properties:
      LoadBalancerArn: !Ref ApplicationLoadBalancer
      Port: 80
      Protocol: HTTP
      DefaultActions:
        - Type: forward
          TargetGroupArn: !Ref ServerTargetGroup
```

### ECS Task Definition and Service (Server)

```yaml
  ServerTaskDefinition:
    Type: AWS::ECS::TaskDefinition
    Properties:
      Family: !Sub "certstack-${Environment}-server"
      NetworkMode: awsvpc
      RequiresCompatibilities: [FARGATE]
      Cpu: "512"
      Memory: "1024"
      ExecutionRoleArn: !GetAtt ECSExecutionRole.Arn
      TaskRoleArn: !GetAtt ECSTaskRole.Arn
      ContainerDefinitions:
        - Name: server
          Image: !Sub "${AWS::AccountId}.dkr.ecr.${AWS::Region}.amazonaws.com/certstack/${Environment}/server:${ServerImageTag}"
          PortMappings:
            - ContainerPort: 8000
          Secrets:
            - Name: DATABASE_URL
              ValueFrom: !Ref DBPasswordSecretArn
          LogConfiguration:
            LogDriver: awslogs
            Options:
              awslogs-group: !Sub "/ecs/certstack-${Environment}-server"
              awslogs-region: !Ref AWS::Region
              awslogs-stream-prefix: ecs

  ServerService:
    Type: AWS::ECS::Service
    DependsOn: ALBListener
    Properties:
      Cluster: !Ref ECSCluster
      TaskDefinition: !Ref ServerTaskDefinition
      DesiredCount: 1
      LaunchType: FARGATE
      NetworkConfiguration:
        AwsvpcConfiguration:
          Subnets:
            - !Ref PrivateSubnetA
            - !Ref PrivateSubnetB
          SecurityGroups:
            - !Ref ECSSecurityGroup
          AssignPublicIp: DISABLED
      LoadBalancers:
        - ContainerName: server
          ContainerPort: 8000
          TargetGroupArn: !Ref ServerTargetGroup
```

---

## Outputs Block

```yaml
Outputs:
  LoadBalancerDNS:
    Description: Public DNS of the Application Load Balancer
    Value: !GetAtt ApplicationLoadBalancer.DNSName
    Export:
      Name: !Sub "certstack-${Environment}-alb-dns"

  ServerRepositoryURI:
    Description: ECR URI for the server image
    Value: !GetAtt ServerRepository.RepositoryUri

  ClientRepositoryURI:
    Description: ECR URI for the client image
    Value: !GetAtt ClientRepository.RepositoryUri
```

---

## Deploying the Stack

```bash
# Create (first time)
aws cloudformation create-stack \
  --stack-name certstack-dev \
  --template-body file://infrastructure/certstack-stack.yaml \
  --parameters \
    ParameterKey=Environment,ParameterValue=dev \
    ParameterKey=ServerImageTag,ParameterValue=latest \
  --capabilities CAPABILITY_NAMED_IAM \
  --region us-east-1

# Update (subsequent changes)
aws cloudformation update-stack \
  --stack-name certstack-dev \
  --template-body file://infrastructure/certstack-stack.yaml \
  --parameters \
    ParameterKey=Environment,ParameterValue=dev \
    ParameterKey=ServerImageTag,ParameterValue=abc1234 \
  --capabilities CAPABILITY_NAMED_IAM \
  --region us-east-1

# Tear down completely
aws cloudformation delete-stack --stack-name certstack-dev
```

---

## Recommended File Structure

```
src/infrastructure/
├── docker-compose.yml          # Local dev only
├── Dockerfile.client
├── Dockerfile.server
└── cloudformation/
    ├── certstack-stack.yaml    # Main template
    ├── parameters/
    │   ├── dev.json
    │   ├── testing.json
    │   └── prod.json
    └── README.md               # (this doc or a summary)
```

`parameters/dev.json` example:

```json
[
  { "ParameterKey": "Environment", "ParameterValue": "dev" },
  { "ParameterKey": "ServerImageTag", "ParameterValue": "latest" },
  { "ParameterKey": "DBPasswordSecretArn", "ParameterValue": "arn:aws:secretsmanager:us-east-1:..." }
]
```

---

## Branching to CloudFormation Workflow

Aligning CloudFormation deployments with your Git branching model:

| Git Branch | CloudFormation Stack | Notes |
|---|---|---|
| `feature/*` | No auto-deploy | Test locally via Docker Compose |
| `testing` | `certstack-testing` | Auto-deploy on merge via GitHub Actions |
| `prod` | `certstack-prod` | Auto-deploy only after CI passes |

This makes your infrastructure changes go through the same PR review process as your application code.