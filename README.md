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
- **Local Storage**: Default configuration uses local file storage
- **Optional S3 Integration**: Can be configured to use AWS S3 for content storage

## Technical Architecture

### Backend (Flask)

- RESTful API built with Flask
- OpenAI API integration for content generation
- Flexible storage system supporting both local filesystem and S3
- Environment-based configuration

### Frontend (React)

- Modern React application with component-based architecture
- Tailwind CSS for responsive UI design
- Clean and intuitive user interface for content generation
- Content management capabilities

## Storage System

The application includes a flexible storage system that supports:

- **Local Storage**: Content is saved in the local filesystem under the `/storage` directory, organized by content type
- **AWS S3 Storage**: Optional integration with Amazon S3 (disabled by default)

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
- Boto3 (AWS SDK, optional for S3 storage)

### Frontend
- React (UI framework)
- Axios (API client)
- Tailwind CSS (Styling)
- React Router (Navigation)

## Deployment

The application can run completely locally or with AWS S3 integration for storage. By default, it uses local storage and doesn't require any AWS services to function.

## Configuration

Configuration is managed via environment variables (`.env` file), including:
- OpenAI API key
- Storage settings (local vs S3)
- Content generation parameters
