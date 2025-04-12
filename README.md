# AI Content Generation Platform

A full-stack application that leverages OpenAI's GPT models to generate various types of content, with capabilities for storage, management, and template-based generation.

## Overview

This platform allows users to generate, save, and manage different types of content using AI. It provides a user-friendly interface for crafting prompts, adjusting generation parameters, and organizing generated content.

## Features

- **AI-Powered Content Generation**: Generate high-quality content using OpenAI's GPT models
- **Multiple Content Types**: Support for various content formats including:
  - Blog posts
  - Social media posts
  - Product descriptions
  - Email content
  - Advertisement copy
- **Template System**: Use pre-defined templates to quickly generate specific content formats
- **Content Management**: Save, retrieve, and organize generated content
- **AWS Integration**: Deployed on AWS with EC2, API Gateway, and S3 storage

## Technical Architecture

### Backend (Flask)

- RESTful API built with Flask
- OpenAI API integration for content generation
- AWS S3 for content storage
- Environment-based configuration
- Deployed on AWS EC2

### Frontend (React)

- Modern React application with component-based architecture
- Tailwind CSS for responsive UI design
- Clean and intuitive user interface for content generation
- Content management capabilities
- Deployed on AWS EC2 or S3 static website hosting

## AWS Architecture

The application is designed to be fully deployable on AWS:

- **EC2 Instance**: Hosts the backend Flask application
- **API Gateway**: Manages the API endpoints at `content-api.contentgeneration.com`
- **S3 Bucket**: `content` bucket for storing generated content
- **Route 53**: DNS configuration for `contentgeneration.com`
- **CloudFront** (Optional): Content delivery for the frontend

## Project Structure

```
.
├── README.md
├── start-app.sh             # Script to start the application
├── backend/                 # Flask backend
│   ├── app.py               # Main application entry point
│   ├── requirements.txt     # Python dependencies
│   ├── api/                 # API routes and controllers
│   ├── config/              # Application configuration
│   ├── models/              # Business logic models
│   └── static/              # Static assets
└── frontend/               # React frontend
    ├── package.json        # Node dependencies
    ├── public/             # Static public assets
    └── src/                # React source code
        ├── components/     # Reusable UI components
        ├── pages/          # Page components
        └── services/       # API services
```

## Dependencies

### Backend
- Flask (Web framework)
- OpenAI (AI model access)
- Boto3 (AWS SDK for S3 storage)

### Frontend
- React (UI framework)
- Axios (API client)
- Tailwind CSS (Styling)
- React Router (Navigation)

## AWS Migration Guide

### 1. AWS Account Configuration

- Create an AWS account if you don't have one
- Configure IAM roles and permissions
  - Create a role for EC2 with S3 and API Gateway permissions
  - Set up IAM user with programmatic access for deployments

### 2. S3 Bucket Setup

- Create S3 bucket named `content` in region `us-east-2`
- Enable CORS on the bucket to allow API access
- Configure bucket policy for secure access

```bash
# AWS CLI command to create the bucket
aws s3api create-bucket --bucket content --region us-east-2 --create-bucket-configuration LocationConstraint=us-east-2
```

### 3. Code Changes for S3 Integration

**Backend Code Updates:**

1. Update `backend/models/storage_model.py`:
   - Change `use_s3=False` to `use_s3=True` in the StorageManager initialization
   - Update `_get_s3_client()` method to use the following configuration:

```python
def _get_s3_client(self):
    """Get an S3 client using the configured credentials."""
    return boto3.client(
        's3',
        region_name='us-east-2',
        # AWS credentials will be handled by IAM role when deployed to EC2
    )
```

2. Update `backend/config/config.py`:
   - Change S3 bucket configuration to:

```python
# S3 configuration for production
S3_BUCKET=os.environ.get("S3_BUCKET", "content"),
```

3. Update `.env` file with production settings:

```
OPENAI_API_KEY=your_openai_api_key
S3_BUCKET=content
USE_S3=true
```

**Frontend Code Updates:**

Update `frontend/src/services/api.service.js` to point to the API Gateway endpoint:

```javascript
// Base URL configuration
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://content-api.contentgeneration.com'
  : '';

// Update axios configuration
axios.defaults.baseURL = API_BASE_URL;
```

### 4. API Gateway Setup

- Create a new API in API Gateway named `content-api`
- Configure routes to match the Flask application endpoints
- Set up custom domain `content-api.contentgeneration.com`
- Create a stage for production deployment

### 5. EC2 Deployment

- Launch an EC2 instance with Amazon Linux 2
- Configure security groups to allow traffic on port 80, 443, and 5000
- Install dependencies:

```bash
# Update system
sudo yum update -y

# Install Python and pip
sudo yum install python3 python3-pip -y

# Install Node.js and npm
curl -sL https://rpm.nodesource.com/setup_14.x | sudo bash -
sudo yum install nodejs -y

# Install Nginx
sudo amazon-linux-extras install nginx1 -y
```

- Set up Nginx as a reverse proxy to the Flask application

### 6. Domain Configuration

- Register domain `contentgeneration.com` if not already owned
- Use Route 53 to configure DNS:
  - Create A records for `contentgeneration.com` pointing to EC2 or CloudFront
  - Create CNAME for `content-api.contentgeneration.com` pointing to API Gateway

### 7. Deployment Script

Create a deployment script for the backend:

```bash
#!/bin/bash

# Deploy backend to EC2
echo "Deploying backend..."
cd backend
pip install -r requirements.txt
sudo systemctl restart gunicorn

# Configure Nginx
echo "Configuring Nginx..."
sudo cp nginx.conf /etc/nginx/conf.d/content-api.conf
sudo systemctl restart nginx

echo "Deployment completed successfully!"
```

Create a deployment script for the frontend:

```bash
#!/bin/bash

# Build and deploy frontend
echo "Building frontend..."
cd frontend
npm install
npm run build

# Deploy to S3 (optional for static hosting)
echo "Deploying to S3..."
aws s3 sync build/ s3://content-frontend

echo "Frontend deployment completed successfully!"
```

## Configuration

Environment variables in `.env` file for AWS deployment:

```
# OpenAI API
OPENAI_API_KEY=your_openai_api_key

# AWS Configuration
AWS_REGION=us-east-2
S3_BUCKET=content
USE_S3=true

# Application Settings
PORT=5000
NODE_ENV=production

# Security
SECRET_KEY=your_secret_key
```

## CI/CD (Optional)

- Set up GitHub Actions or AWS CodePipeline for automated deployments
- Configure deployment workflows for frontend and backend
- Implement automated testing before deployment
