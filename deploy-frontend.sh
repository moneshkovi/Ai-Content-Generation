#!/bin/bash

# AWS Frontend Deployment Script for AI Content Generation Platform

# Exit on any error
set -e

echo "===== Starting Frontend Deployment ====="

# Default deployment type is EC2
DEPLOY_TO="ec2"

# Parse command line arguments
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --s3) DEPLOY_TO="s3";;
        --bucket) S3_BUCKET="$2"; shift;;
        --region) AWS_REGION="$2"; shift;;
        *) echo "Unknown parameter: $1"; exit 1;;
    esac
    shift
done

# Set default values if not provided
S3_BUCKET=${S3_BUCKET:-"content-frontend"}
AWS_REGION=${AWS_REGION:-"us-east-2"}

# Install Node.js if not already installed
if ! command -v node &> /dev/null; then
    echo "Installing Node.js and npm..."
    curl -sL https://rpm.nodesource.com/setup_16.x | sudo bash -
    sudo yum install -y nodejs
fi

# Navigate to frontend directory
cd /home/ec2-user/Ai-Content-Generation/frontend

# Install dependencies
echo "Installing frontend dependencies..."
npm install

# Configure production API endpoint
echo "Configuring production API endpoint..."
if [[ "$DEPLOY_TO" == "s3" ]]; then
    # Update API endpoint for production when deployed to S3
    echo "REACT_APP_API_URL=https://content-api.contentgeneration.com" > .env.production
else
    # For EC2 deployment, API calls can be relative
    echo "REACT_APP_API_URL=" > .env.production
fi

# Build the application
echo "Building frontend application..."
npm run build

if [[ "$DEPLOY_TO" == "s3" ]]; then
    echo "Deploying frontend to S3 bucket: $S3_BUCKET"
    
    # Check if AWS CLI is installed
    if ! command -v aws &> /dev/null; then
        echo "Installing AWS CLI..."
        curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
        unzip awscliv2.zip
        sudo ./aws/install
    fi
    
    # Check if the S3 bucket exists, create if not
    if ! aws s3 ls s3://$S3_BUCKET &> /dev/null; then
        echo "Creating S3 bucket: $S3_BUCKET"
        aws s3api create-bucket \
            --bucket $S3_BUCKET \
            --region $AWS_REGION \
            --create-bucket-configuration LocationConstraint=$AWS_REGION
        
        # Configure bucket for static website hosting
        aws s3 website s3://$S3_BUCKET --index-document index.html --error-document index.html
        
        # Set bucket policy to allow public read access
        echo '{
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Sid": "PublicReadForGetBucketObjects",
                    "Effect": "Allow",
                    "Principal": "*",
                    "Action": "s3:GetObject",
                    "Resource": "arn:aws:s3:::'$S3_BUCKET'/*"
                }
            ]
        }' > bucket-policy.json
        
        aws s3api put-bucket-policy --bucket $S3_BUCKET --policy file://bucket-policy.json
        rm bucket-policy.json
    fi
    
    # Upload the build to S3
    echo "Uploading files to S3..."
    aws s3 sync build/ s3://$S3_BUCKET --delete
    
    # Optional: Configure CloudFront (uncomment if needed)
    # echo "Setting up CloudFront distribution..."
    # aws cloudfront create-distribution ...
    
    echo "===== Frontend Deployed to S3 ====="
    echo "Your website is now available at: http://$S3_BUCKET.s3-website.$AWS_REGION.amazonaws.com"
    echo "For custom domain, configure Route 53 to point to this endpoint or set up CloudFront"
else
    echo "Deploying frontend to EC2..."
    
    # Prepare Nginx to serve the frontend (should already be set up from backend deployment)
    # Uncomment the static files configuration in nginx.conf
    sudo sed -i 's/# location \/ {/location \/ {/' /etc/nginx/conf.d/content-api.conf
    sudo sed -i 's/#     root \/home\/ec2-user\/Ai-Content-Generation\/frontend\/build;/    root \/home\/ec2-user\/Ai-Content-Generation\/frontend\/build;/' /etc/nginx/conf.d/content-api.conf
    sudo sed -i 's/#     try_files \$uri \/index.html;/    try_files \$uri \/index.html;/' /etc/nginx/conf.d/content-api.conf
    sudo sed -i 's/# }/}/' /etc/nginx/conf.d/content-api.conf
    
    # Comment out the development server proxy
    sudo sed -i '/proxy_pass http:\/\/localhost:3000;/s/^/#/' /etc/nginx/conf.d/content-api.conf
    
    # Restart Nginx to apply changes
    sudo systemctl restart nginx
    
    echo "===== Frontend Deployed to EC2 ====="
    echo "Your website is now available at: https://contentgeneration.com"
fi

echo "===== Frontend Deployment Complete ====="
