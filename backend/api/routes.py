from flask import Blueprint, request, jsonify, current_app
import json
from models.openai_model import ContentGenerator
from models.storage_model import StorageManager

# Create blueprints for API routes
content_api = Blueprint('content_api', __name__)
storage_api = Blueprint('storage_api', __name__)

# Initialize models
content_generator = ContentGenerator()
storage_manager = StorageManager(use_s3=False)  # Use local storage for development

@content_api.route('/generate', methods=['POST'])
def generate_content():
    """Generate content using the OpenAI API."""
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data:
            return jsonify({
                'error': 'Request body is empty',
                'status': 'error'
            }), 400
            
        prompt = data.get('prompt')
        content_type = data.get('content_type', 'general')
        options = data.get('options')
        
        if not prompt:
            return jsonify({
                'error': 'Prompt is required',
                'status': 'error'
            }), 400
            
        # Generate content
        result = content_generator.generate_content(prompt, content_type, options)
        
        # Check for errors
        if 'error' in result:
            return jsonify({
                'error': result['error'],
                'status': 'error'
            }), 500
            
        return jsonify({
            'status': 'success',
            'data': result
        })
        
    except Exception as e:
        current_app.logger.error(f"Content Generation Error: {str(e)}")
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 500

@content_api.route('/generate-from-template', methods=['POST'])
def generate_from_template():
    """Generate content using a template."""
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data:
            return jsonify({
                'error': 'Request body is empty',
                'status': 'error'
            }), 400
            
        template_name = data.get('template_name')
        template_vars = data.get('template_vars')
        content_type = data.get('content_type', 'general')
        options = data.get('options')
        
        if not template_name or not template_vars:
            return jsonify({
                'error': 'Template name and variables are required',
                'status': 'error'
            }), 400
            
        # Generate content using template
        result = content_generator.generate_with_template(
            template_name, template_vars, content_type, options
        )
        
        # Check for errors
        if 'error' in result:
            return jsonify({
                'error': result['error'],
                'status': 'error'
            }), 500
            
        return jsonify({
            'status': 'success',
            'data': result
        })
        
    except Exception as e:
        current_app.logger.error(f"Template Generation Error: {str(e)}")
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 500

@storage_api.route('/save', methods=['POST'])
def save_content():
    """Save content to storage."""
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data:
            return jsonify({
                'error': 'Request body is empty',
                'status': 'error'
            }), 400
            
        content_data = data.get('content')
        content_type = data.get('content_type', 'general')
        
        if not content_data:
            return jsonify({
                'error': 'Content data is required',
                'status': 'error'
            }), 400
            
        # Save content to storage
        result = storage_manager.save_content(content_data, content_type)
        
        # Check for errors
        if result.get('status') == 'error':
            return jsonify({
                'error': result.get('error', 'Unknown error'),
                'status': 'error'
            }), 500
            
        return jsonify({
            'status': 'success',
            'data': result
        })
        
    except Exception as e:
        current_app.logger.error(f"Content Saving Error: {str(e)}")
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 500

@storage_api.route('/retrieve/<path:filepath>', methods=['GET'])
def retrieve_content(filepath):
    """Retrieve content from storage."""
    try:
        is_s3_path = request.args.get('is_s3_path', 'false').lower() == 'true'
        
        # Retrieve content from storage
        result = storage_manager.retrieve_content(filepath, is_s3_path)
        
        # Check for errors
        if result.get('status') == 'error':
            return jsonify({
                'error': result.get('error', 'Unknown error'),
                'status': 'error'
            }), 500
            
        return jsonify({
            'status': 'success',
            'data': result
        })
        
    except Exception as e:
        current_app.logger.error(f"Content Retrieval Error: {str(e)}")
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 500

@storage_api.route('/list', methods=['GET'])
def list_content():
    """List available content."""
    try:
        # Get query parameters
        content_type = request.args.get('content_type')
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        limit = request.args.get('limit', 100, type=int)
        
        # List content from storage
        result = storage_manager.list_content(content_type, start_date, end_date, limit)
        
        # Check for errors
        if result.get('status') == 'error':
            return jsonify({
                'error': result.get('error', 'Unknown error'),
                'status': 'error'
            }), 500
            
        return jsonify({
            'status': 'success',
            'data': result
        })
        
    except Exception as e:
        current_app.logger.error(f"Content Listing Error: {str(e)}")
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 500

def register_routes(app):
    """Register all API routes with the Flask app."""
    app.register_blueprint(content_api, url_prefix='/api/content')
    app.register_blueprint(storage_api, url_prefix='/api/storage')
    
    # Add API documentation route
    @app.route('/api', methods=['GET'])
    def api_documentation():
        """Return API documentation."""
        return jsonify({
            'name': 'AI Content Generation API',
            'version': '1.0',
            'endpoints': {
                '/api/content/generate': {
                    'methods': ['POST'],
                    'description': 'Generate content using OpenAI API'
                },
                '/api/content/generate-from-template': {
                    'methods': ['POST'],
                    'description': 'Generate content using a template'
                },
                '/api/storage/save': {
                    'methods': ['POST'],
                    'description': 'Save content to storage'
                },
                '/api/storage/retrieve/<filepath>': {
                    'methods': ['GET'],
                    'description': 'Retrieve content from storage'
                },
                '/api/storage/list': {
                    'methods': ['GET'],
                    'description': 'List available content'
                }
            }
        })
