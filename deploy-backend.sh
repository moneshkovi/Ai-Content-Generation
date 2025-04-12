#!/bin/bash

# AWS EC2 Backend Deployment Script for AI Content Generation Platform

# Exit on any error
set -e

echo "===== Starting Backend Deployment ====="

# Update system packages
echo "Updating system packages..."
sudo yum update -y

# Install Python dependencies
echo "Installing Python dependencies..."
sudo yum install -y python3 python3-pip python3-devel gcc

# Install Nginx if not already installed
if ! command -v nginx &> /dev/null; then
    echo "Installing Nginx..."
    sudo amazon-linux-extras install nginx1 -y
fi

# Install Gunicorn
echo "Installing Gunicorn..."
pip3 install --user gunicorn

# Install application dependencies
echo "Installing application dependencies..."
cd /home/ec2-user/Ai-Content-Generation/backend
pip3 install --user -r requirements.txt

# Copy the Nginx configuration
echo "Configuring Nginx..."
sudo cp /home/ec2-user/Ai-Content-Generation/nginx.conf /etc/nginx/conf.d/content-api.conf
sudo systemctl start nginx
sudo systemctl enable nginx

# Copy the Gunicorn service file
echo "Setting up Gunicorn service..."
sudo cp /home/ec2-user/Ai-Content-Generation/gunicorn.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl start gunicorn
sudo systemctl enable gunicorn

# Configure AWS CLI (if needed)
if [[ ! -f ~/.aws/credentials ]]; then
    echo "Configuring AWS CLI..."
    mkdir -p ~/.aws
    
    echo "AWS CLI configuration is needed to access S3."
    echo "Please run 'aws configure' manually after this script completes."
fi

# Set up SSL with Let's Encrypt (optional)
read -p "Do you want to set up SSL with Let's Encrypt? (y/n) " setup_ssl
if [[ "$setup_ssl" == "y" ]]; then
    echo "Installing certbot..."
    sudo amazon-linux-extras install epel -y
    sudo yum install -y certbot python-certbot-nginx
    
    echo "Setting up SSL certificates..."
    sudo certbot --nginx -d contentgeneration.com -d www.contentgeneration.com
    
    # Enable HTTPS redirect in Nginx config
    echo "Updating Nginx configuration for HTTPS..."
    sudo sed -i 's/# server {/server {/' /etc/nginx/conf.d/content-api.conf
    sudo sed -i 's/# }/}/' /etc/nginx/conf.d/content-api.conf
    sudo systemctl restart nginx
fi

echo "===== Backend Deployment Complete ====="
echo "API should be accessible at https://contentgeneration.com/api"
echo "Health check endpoint: https://contentgeneration.com/health"

# Final instructions
echo "===== Next Steps ====="
echo "1. Ensure your .env file is properly configured"
echo "2. Set up your domain in Route 53 pointing to this EC2 instance"
echo "3. Deploy the frontend with deploy-frontend.sh"
