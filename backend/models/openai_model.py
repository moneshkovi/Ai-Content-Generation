import json
import openai
from flask import current_app
from datetime import datetime

class ContentGenerator:
    """Class responsible for generating content using OpenAI's GPT models."""
    
    def __init__(self, api_key=None):
        """Initialize with optional API key override."""
        self.api_key = api_key
    
    def setup_client(self):
        """Set up the OpenAI API client."""
        if self.api_key:
            api_key = self.api_key
        else:
            api_key = current_app.config['OPENAI_API_KEY']
            
        # Initialize the client only with required parameters to avoid proxy issues
        self.client = openai.OpenAI(
            api_key=api_key,
            # No additional parameters that might cause conflicts
        )
        
    def generate_content(self, prompt, content_type, options=None):
        """
        Generate content using OpenAI's API.
        
        Args:
            prompt (str): The prompt to send to the model
            content_type (str): Type of content being generated (blog, ad, etc.)
            options (dict): Additional generation options
            
        Returns:
            dict: Generated content with metadata
        """
        self.setup_client()
        
        # Default options
        default_options = {
            'model': 'gpt-4',
            'max_tokens': current_app.config.get('MAX_TOKENS', 1000),
            'temperature': current_app.config.get('TEMPERATURE', 0.7),
        }
        
        # Merge with provided options, if any
        if options:
            default_options.update(options)
        
        try:
            response = self.client.chat.completions.create(
                model=default_options['model'],
                messages=[
                    {"role": "system", "content": f"You are a professional content creator specializing in {content_type}."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=default_options['max_tokens'],
                temperature=default_options['temperature']
            )
            
            # Extract the generated content
            content = response.choices[0].message.content
            
            # Create response with metadata
            result = {
                'content': content,
                'metadata': {
                    'content_type': content_type,
                    'timestamp': datetime.now().isoformat(),
                    'model': default_options['model'],
                    'prompt': prompt,
                    'tokens': {
                        'prompt': response.usage.prompt_tokens,
                        'completion': response.usage.completion_tokens,
                        'total': response.usage.total_tokens
                    }
                }
            }
            
            return result
            
        except Exception as e:
            error_msg = str(e)
            current_app.logger.error(f"OpenAI API Error: {error_msg}")
            return {
                'error': error_msg,
                'metadata': {
                    'timestamp': datetime.now().isoformat(),
                    'prompt': prompt
                }
            }
    
    def generate_with_template(self, template_name, template_vars, content_type, options=None):
        """
        Generate content using a predefined template.
        
        Args:
            template_name (str): Name of the template to use
            template_vars (dict): Variables to inject into the template
            content_type (str): Type of content being generated
            options (dict): Additional generation options
            
        Returns:
            dict: Generated content with metadata
        """
        # In a real application, templates would be loaded from a database or file
        # For this example, we'll use some hardcoded templates
        templates = {
            'blog_post': "Write a blog post about {topic} with the following keywords: {keywords}. "
                         "The tone should be {tone} and the target audience is {audience}. "
                         "Include a catchy title, introduction, {num_sections} main sections, and a conclusion.",
            
            'social_media': "Create a {platform} post about {topic} that is engaging and shareable. "
                            "The post should be {tone} in tone and include relevant hashtags.",
            
            'product_description': "Write a compelling product description for {product_name}. "
                                  "Highlight the following features: {features}. "
                                  "The target audience is {audience} and the tone should be {tone}."
        }
        
        if template_name not in templates:
            return {
                'error': f"Template '{template_name}' not found",
                'metadata': {
                    'timestamp': datetime.now().isoformat()
                }
            }
        
        try:
            # Format the template with provided variables
            prompt = templates[template_name].format(**template_vars)
            
            # Generate content with the formatted prompt
            return self.generate_content(prompt, content_type, options)
            
        except KeyError as e:
            return {
                'error': f"Missing required template variable: {str(e)}",
                'metadata': {
                    'timestamp': datetime.now().isoformat(),
                    'template': template_name
                }
            }
