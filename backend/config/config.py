import os
from dotenv import load_dotenv

def init_config(app):
    """Initialize application configuration from environment variables."""
    # Load environment variables from .env file
    load_dotenv()
    
    # Check if the necessary environment variables are set
    required_vars = ["OPENAI_API_KEY"]
    missing_vars = [var for var in required_vars if not os.environ.get(var)]
    
    if missing_vars:
        raise ValueError(f"Missing required environment variables: {', '.join(missing_vars)}")
    
    # Set configuration values
    app.config.update(
        # OpenAI API configuration
        OPENAI_API_KEY=os.environ.get("OPENAI_API_KEY"),
        
        # S3 configuration (for local development, this can be mocked)
        S3_BUCKET=os.environ.get("S3_BUCKET", "content-generation-local"),
        
        # Content generation settings
        MAX_TOKENS=int(os.environ.get("MAX_TOKENS", 1000)),
        TEMPERATURE=float(os.environ.get("TEMPERATURE", 0.7)),
        
        # Security settings
        SECRET_KEY=os.environ.get("SECRET_KEY", os.urandom(24).hex())
    )

    return app.config
