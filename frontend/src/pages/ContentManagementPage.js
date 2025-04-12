import React, { useState, useEffect } from 'react';
import ApiService from '../services/api.service';
import { toast } from 'react-toastify';

const ContentManagementPage = () => {
  const [contentItems, setContentItems] = useState([]);
  const [selectedContent, setSelectedContent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    contentType: '',
    startDate: '',
    endDate: ''
  });
  
  // Fetch content when the component mounts or filters change
  useEffect(() => {
    fetchContent();
  }, [filters]); // Re-fetch when filters change
  
  const fetchContent = async () => {
    try {
      setIsLoading(true);
      
      const response = await ApiService.listContent(
        filters.contentType || null,
        filters.startDate || null,
        filters.endDate || null
      );
      
      if (response.data.status === 'success') {
        setContentItems(response.data.data.items || []);
      } else {
        throw new Error(response.data.error || 'Failed to fetch content');
      }
      
    } catch (error) {
      toast.error(`Error: ${error.message || 'Failed to fetch content'}`);
      console.error('Content Fetch Error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };
  
  const handleContentSelect = async (item) => {
    try {
      const response = await ApiService.retrieveContent(item.key);
      
      if (response.data.status === 'success') {
        setSelectedContent(response.data.data.content);
        
      } else {
        throw new Error(response.data.error || 'Failed to retrieve content');
      }
      
    } catch (error) {
      toast.error(`Error: ${error.message || 'Failed to retrieve content'}`);
      console.error('Content Retrieval Error:', error);
    }
  };
  
  const handleCopy = () => {
    if (!selectedContent) return;
    
    navigator.clipboard.writeText(selectedContent.content)
      .then(() => toast.success('Content copied to clipboard!'))
      .catch((error) => toast.error('Failed to copy content'));
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString();
  };
  
  const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };
  
  // Helper function to get content type display name
  const getContentTypeDisplay = (type) => {
    const contentTypes = {
      'blog': 'Blog Post',
      'social': 'Social Media Post',
      'product': 'Product Description',
      'email': 'Email',
      'ad': 'Advertisement'
    };
    
    return contentTypes[type] || type;
  };
  
  // Extract the content type from a filepath
  // e.g., "blog/2023/04/12/abc123.json" -> "blog"
  const extractContentType = (filepath) => {
    if (!filepath) return 'unknown';
    const parts = filepath.split('/');
    return parts[0];
  };
  
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Content Management</h1>
      
      {/* Filters */}
      <div className="card mb-8">
        <h2 className="text-xl font-semibold mb-4">Filters</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="form-group">
            <label className="form-label" htmlFor="contentType">Content Type</label>
            <select
              id="contentType"
              name="contentType"
              className="form-select"
              value={filters.contentType}
              onChange={handleFilterChange}
            >
              <option value="">All Types</option>
              <option value="blog">Blog Posts</option>
              <option value="social">Social Media Posts</option>
              <option value="product">Product Descriptions</option>
              <option value="email">Emails</option>
              <option value="ad">Advertisements</option>
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="startDate">From Date</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              className="form-input"
              value={filters.startDate}
              onChange={handleFilterChange}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="endDate">To Date</label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              className="form-input"
              value={filters.endDate}
              onChange={handleFilterChange}
            />
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Content List */}
        <div className="md:col-span-1">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Saved Content</h2>
            
            {isLoading ? (
              <div className="text-center py-8">
                <svg className="animate-spin h-8 w-8 mx-auto text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="mt-2 text-gray-600">Loading content...</p>
              </div>
            ) : contentItems.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <div className="mb-4">
                  <svg className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <p className="mb-2">No content found</p>
                <p className="text-sm">Generate and save some content to see it here.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {contentItems.map((item, index) => {
                  const contentType = extractContentType(item.key);
                  return (
                    <div 
                      key={index} 
                      className={`p-3 border rounded-md cursor-pointer transition-colors ${selectedContent && item.key === selectedContent.storage_metadata?.filepath ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50 border-gray-200'}`}
                      onClick={() => handleContentSelect(item)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium truncate">
                            {/* Fallback to filename if we can't extract a title */}
                            {item.key.split('/').pop().replace('.json', '')}
                          </div>
                          <div className="text-sm text-gray-500">
                            {getContentTypeDisplay(contentType)}
                          </div>
                        </div>
                        <div>
                          <span className={`badge ${contentType === 'blog' ? 'badge-blue' : contentType === 'social' ? 'badge-green' : 'badge-gray'}`}>
                            {contentType}
                          </span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {formatDate(item.last_modified)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        
        {/* Content Preview */}
        <div className="md:col-span-2">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Content Preview</h2>
            
            {selectedContent ? (
              <div>
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-2">
                    {selectedContent.metadata?.content_type && getContentTypeDisplay(selectedContent.metadata.content_type)}
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                    <div>
                      <span className="text-gray-500">Created: </span>
                      {formatDate(selectedContent.metadata?.timestamp || selectedContent.storage_metadata?.timestamp)}
                    </div>
                    
                    {selectedContent.metadata?.model && (
                      <div>
                        <span className="text-gray-500">Model: </span>
                        {selectedContent.metadata.model}
                      </div>
                    )}
                    
                    {selectedContent.metadata?.tokens && (
                      <div>
                        <span className="text-gray-500">Tokens: </span>
                        {selectedContent.metadata.tokens.total}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mb-4 p-4 bg-gray-50 rounded-md">
                  <pre className="whitespace-pre-wrap">{selectedContent.content}</pre>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <button 
                    className="btn btn-secondary" 
                    onClick={handleCopy}
                  >
                    Copy to Clipboard
                  </button>
                </div>
                
                {/* Prompt used (if available) */}
                {selectedContent.metadata?.prompt && (
                  <div className="mt-6 border-t pt-4">
                    <h3 className="text-md font-medium mb-2">Original Prompt</h3>
                    <div className="p-3 bg-gray-50 rounded-md text-gray-700 text-sm">
                      {selectedContent.metadata.prompt}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <div className="mb-4">
                  <svg className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <p>Select a content item from the list to preview it here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentManagementPage;
