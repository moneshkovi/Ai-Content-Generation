import os
import json
import uuid
import boto3
from datetime import datetime
from flask import current_app
from pathlib import Path

class StorageManager:
    """Manager for content storage, supporting both local filesystem and S3 storage."""
    
    def __init__(self, use_s3=False):
        """
        Initialize the storage manager.
        
        Args:
            use_s3 (bool): Whether to use S3 for storage (defaults to local file system)
        """
        self.use_s3 = use_s3
        
    def _ensure_directory_exists(self, directory):
        """Ensure that the specified directory exists."""
        Path(directory).mkdir(parents=True, exist_ok=True)
    
    def _get_s3_client(self):
        """Get an S3 client using the configured credentials."""
        # In production, this would use boto3's default credential chain,
        # relying on environment variables, IAM roles, or AWS config files
        return boto3.client('s3')
    
    def _generate_filepath(self, content_type):
        """Generate a filepath for content storage based on content type and date."""
        now = datetime.now()
        date_path = now.strftime("%Y/%m/%d")
        filename = f"{uuid.uuid4()}.json"
        return f"{content_type}/{date_path}/{filename}"
    
    def save_content(self, content_data, content_type):
        """
        Save content to storage.
        
        Args:
            content_data (dict): Content data to save
            content_type (str): Type of content (blog, social, etc.)
            
        Returns:
            dict: Information about the saved content
        """
        filepath = self._generate_filepath(content_type)
        content_with_metadata = {
            **content_data,
            'storage_metadata': {
                'filepath': filepath,
                'timestamp': datetime.now().isoformat(),
                'version': '1.0'
            }
        }
        
        # Convert to JSON
        content_json = json.dumps(content_with_metadata, indent=2)
        
        if self.use_s3:
            # S3 storage implementation
            try:
                s3 = self._get_s3_client()
                s3_bucket = current_app.config['S3_BUCKET']
                
                s3.put_object(
                    Bucket=s3_bucket,
                    Key=filepath,
                    Body=content_json,
                    ContentType='application/json'
                )
                
                return {
                    'status': 'success',
                    'storage_type': 's3',
                    'location': f"s3://{s3_bucket}/{filepath}",
                    'metadata': content_with_metadata['storage_metadata']
                }
                
            except Exception as e:
                current_app.logger.error(f"S3 Storage Error: {str(e)}")
                return {
                    'status': 'error',
                    'error': str(e)
                }
        else:
            # Local file system storage implementation
            try:
                # Default to 'storage' directory in the current working directory
                storage_dir = os.path.join(os.getcwd(), 'storage')
                full_path = os.path.join(storage_dir, filepath)
                
                # Ensure directory exists
                os.makedirs(os.path.dirname(full_path), exist_ok=True)
                
                # Write the content to file
                with open(full_path, 'w') as f:
                    f.write(content_json)
                
                return {
                    'status': 'success',
                    'storage_type': 'local',
                    'location': full_path,
                    'metadata': content_with_metadata['storage_metadata']
                }
                
            except Exception as e:
                current_app.logger.error(f"Local Storage Error: {str(e)}")
                return {
                    'status': 'error', 
                    'error': str(e)
                }
    
    def retrieve_content(self, filepath, is_s3_path=None):
        """
        Retrieve content from storage.
        
        Args:
            filepath (str): Path to the content file
            is_s3_path (bool): Whether the filepath is an S3 path (auto-detected if None)
            
        Returns:
            dict: Retrieved content or error information
        """
        # Auto-detect if the path is an S3 path if not specified
        if is_s3_path is None:
            is_s3_path = filepath.startswith('s3://')
        
        if is_s3_path or self.use_s3:
            # S3 retrieval implementation
            try:
                s3 = self._get_s3_client()
                
                # Extract bucket and key from S3 path
                if filepath.startswith('s3://'):
                    parts = filepath.replace('s3://', '').split('/', 1)
                    bucket = parts[0]
                    key = parts[1] if len(parts) > 1 else ''
                else:
                    bucket = current_app.config['S3_BUCKET']
                    key = filepath
                
                response = s3.get_object(Bucket=bucket, Key=key)
                content = response['Body'].read().decode('utf-8')
                
                return {
                    'status': 'success',
                    'content': json.loads(content),
                    'metadata': {
                        'last_modified': response['LastModified'].isoformat(),
                        'size': response['ContentLength']
                    }
                }
                
            except Exception as e:
                current_app.logger.error(f"S3 Retrieval Error: {str(e)}")
                return {
                    'status': 'error',
                    'error': str(e)
                }
        else:
            # Local file retrieval implementation
            try:
                # If it's an absolute path, use it directly
                if os.path.isabs(filepath):
                    full_path = filepath
                else:
                    # Otherwise, treat it as relative to the storage directory
                    storage_dir = os.path.join(os.getcwd(), 'storage')
                    full_path = os.path.join(storage_dir, filepath)
                
                with open(full_path, 'r') as f:
                    content = json.load(f)
                
                return {
                    'status': 'success',
                    'content': content,
                    'metadata': {
                        'last_modified': datetime.fromtimestamp(os.path.getmtime(full_path)).isoformat(),
                        'size': os.path.getsize(full_path)
                    }
                }
                
            except Exception as e:
                current_app.logger.error(f"Local Retrieval Error: {str(e)}")
                return {
                    'status': 'error',
                    'error': str(e)
                }
    
    def list_content(self, content_type=None, start_date=None, end_date=None, limit=100):
        """
        List available content, optionally filtered by type and date range.
        
        Args:
            content_type (str): Type of content to filter by
            start_date (str): ISO date string for start date filter
            end_date (str): ISO date string for end date filter
            limit (int): Maximum number of items to return
            
        Returns:
            dict: List of content items or error information
        """
        if self.use_s3:
            # S3 listing implementation
            try:
                s3 = self._get_s3_client()
                bucket = current_app.config['S3_BUCKET']
                
                # Build prefix based on content type
                prefix = f"{content_type}/" if content_type else ""
                
                response = s3.list_objects_v2(
                    Bucket=bucket,
                    Prefix=prefix,
                    MaxKeys=limit
                )
                
                items = []
                for obj in response.get('Contents', []):
                    # Filtering by date would require retrieving each object's metadata
                    # For efficiency, this is simplified for now
                    items.append({
                        'key': obj['Key'],
                        'location': f"s3://{bucket}/{obj['Key']}",
                        'last_modified': obj['LastModified'].isoformat(),
                        'size': obj['Size']
                    })
                
                return {
                    'status': 'success',
                    'items': items,
                    'count': len(items)
                }
                
            except Exception as e:
                current_app.logger.error(f"S3 Listing Error: {str(e)}")
                return {
                    'status': 'error',
                    'error': str(e)
                }
        else:
            # Local file system listing implementation
            try:
                storage_dir = os.path.join(os.getcwd(), 'storage')
                
                # Build directory path based on content type
                if content_type:
                    dir_path = os.path.join(storage_dir, content_type)
                else:
                    dir_path = storage_dir
                
                # Check if directory exists
                if not os.path.exists(dir_path):
                    return {
                        'status': 'success',
                        'items': [],
                        'count': 0
                    }
                
                items = []
                count = 0
                
                # Walk the directory tree
                for root, _, files in os.walk(dir_path):
                    for file in files:
                        if file.endswith('.json'):
                            file_path = os.path.join(root, file)
                            rel_path = os.path.relpath(file_path, storage_dir)
                            
                            # Get file metadata
                            mtime = os.path.getmtime(file_path)
                            file_date = datetime.fromtimestamp(mtime)
                            
                            # Apply date filters if specified
                            if start_date and file_date.isoformat() < start_date:
                                continue
                            if end_date and file_date.isoformat() > end_date:
                                continue
                            
                            items.append({
                                'key': rel_path,
                                'location': file_path,
                                'last_modified': file_date.isoformat(),
                                'size': os.path.getsize(file_path)
                            })
                            
                            count += 1
                            if count >= limit:
                                break
                    
                    if count >= limit:
                        break
                
                return {
                    'status': 'success',
                    'items': items,
                    'count': len(items)
                }
                
            except Exception as e:
                current_app.logger.error(f"Local Listing Error: {str(e)}")
                return {
                    'status': 'error',
                    'error': str(e)
                }
