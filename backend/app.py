import os
from flask import Flask, jsonify
from flask_cors import CORS
from api.routes import register_routes
from config.config import init_config

def create_app():
    """Create and configure the Flask application."""
    app = Flask(__name__, static_folder='static')
    
    # Initialize configuration
    init_config(app)
    
    # Enable CORS
    CORS(app)
    
    # Register API routes
    register_routes(app)
    
    @app.route('/health', methods=['GET'])
    def health_check():
        """Endpoint for health checks."""
        return jsonify({"status": "healthy"})
    
    return app

if __name__ == '__main__':
    app = create_app()
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
