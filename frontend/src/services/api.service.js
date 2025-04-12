import axios from 'axios';

/**
 * API Service for handling all backend API interactions
 */
class ApiService {
  /**
   * Generate content using the provided prompt and options
   * @param {string} prompt - The prompt for content generation
   * @param {string} contentType - Type of content (blog, social, product, etc.)
   * @param {Object} options - Optional parameters for generation
   * @returns {Promise} - Promise with the API response
   */
  static generateContent(prompt, contentType = 'general', options = {}) {
    return axios.post('/api/content/generate', {
      prompt,
      content_type: contentType,
      options
    });
  }

  /**
   * Generate content using a predefined template
   * @param {string} templateName - Name of the template to use
   * @param {Object} templateVars - Variables to inject into the template
   * @param {string} contentType - Type of content being generated
   * @param {Object} options - Optional parameters for generation
   * @returns {Promise} - Promise with the API response
   */
  static generateFromTemplate(templateName, templateVars, contentType, options = {}) {
    return axios.post('/api/content/generate-from-template', {
      template_name: templateName,
      template_vars: templateVars,
      content_type: contentType,
      options
    });
  }

  /**
   * Save content to storage
   * @param {Object} contentData - Content data to save
   * @param {string} contentType - Type of content (blog, social, product, etc.)
   * @returns {Promise} - Promise with the API response
   */
  static saveContent(contentData, contentType = 'general') {
    return axios.post('/api/storage/save', {
      content: contentData,
      content_type: contentType
    });
  }

  /**
   * Retrieve content from storage
   * @param {string} filepath - Path to the content file
   * @param {boolean} isS3Path - Whether the filepath is an S3 path
   * @returns {Promise} - Promise with the API response
   */
  static retrieveContent(filepath, isS3Path = false) {
    return axios.get(`/api/storage/retrieve/${filepath}`, {
      params: { is_s3_path: isS3Path }
    });
  }

  /**
   * List available content with optional filters
   * @param {string} contentType - Type of content to filter by
   * @param {string} startDate - ISO date string for start date filter
   * @param {string} endDate - ISO date string for end date filter
   * @param {number} limit - Maximum number of items to return
   * @returns {Promise} - Promise with the API response
   */
  static listContent(contentType = null, startDate = null, endDate = null, limit = 100) {
    const params = new URLSearchParams();
    if (contentType) params.append('content_type', contentType);
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    if (limit !== 100) params.append('limit', limit.toString());
    
    return axios.get(`/api/storage/list?${params.toString()}`);
  }
}

export default ApiService;
