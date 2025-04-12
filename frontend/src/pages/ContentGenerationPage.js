import React, { useState } from 'react';
import ApiService from '../services/api.service';
import { toast } from 'react-toastify';

const ContentGenerationPage = () => {
  const [formData, setFormData] = useState({
    contentType: 'blog',
    prompt: '',
    maxTokens: 1000,
    temperature: 0.7,
  });
  
  const [generatedContent, setGeneratedContent] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const contentTypes = [
    { id: 'blog', name: 'Blog Post' },
    { id: 'social', name: 'Social Media Post' },
    { id: 'product', name: 'Product Description' },
    { id: 'email', name: 'Email' },
    { id: 'ad', name: 'Advertisement Copy' },
  ];
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSliderChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: parseFloat(value)
    });
  };
  
  const handleGenerate = async (e) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      
      // Check if prompt is empty
      if (!formData.prompt.trim()) {
        toast.error('Please enter a prompt');
        setIsLoading(false);
        return;
      }
      
      const response = await ApiService.generateContent(
        formData.prompt,
        formData.contentType,
        {
          max_tokens: parseInt(formData.maxTokens),
          temperature: formData.temperature
        }
      );
      
      if (response.data.status === 'success') {
        setGeneratedContent(response.data.data);
        toast.success('Content generated successfully!');
      } else {
        throw new Error(response.data.error || 'Failed to generate content');
      }
      
    } catch (error) {
      toast.error(`Error: ${error.message || 'Failed to generate content'}`);
      console.error('Content Generation Error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSave = async () => {
    if (!generatedContent) return;
    
    try {
      setIsSaving(true);
      
      const response = await ApiService.saveContent(
        generatedContent,
        formData.contentType
      );
      
      if (response.data.status === 'success') {
        toast.success('Content saved successfully!');
      } else {
        throw new Error(response.data.error || 'Failed to save content');
      }
      
    } catch (error) {
      toast.error(`Error: ${error.message || 'Failed to save content'}`);
      console.error('Content Saving Error:', error);
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleCopy = () => {
    if (!generatedContent) return;
    
    navigator.clipboard.writeText(generatedContent.content)
      .then(() => toast.success('Content copied to clipboard!'))
      .catch((error) => toast.error('Failed to copy content'));
  };
  
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Generate Content</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left column - Generation Form */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Content Parameters</h2>
          
          <form onSubmit={handleGenerate}>
            <div className="form-group">
              <label className="form-label" htmlFor="contentType">Content Type</label>
              <select
                id="contentType"
                name="contentType"
                className="form-select"
                value={formData.contentType}
                onChange={handleInputChange}
              >
                {contentTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label" htmlFor="prompt">Prompt</label>
              <textarea
                id="prompt"
                name="prompt"
                className="form-textarea"
                value={formData.prompt}
                onChange={handleInputChange}
                rows={6}
                placeholder="Enter your content prompt here..."
              ></textarea>
              <div className="text-sm text-gray-500 mt-1">
                Be specific about the content you want to generate. Include key points, tone, style, etc.
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label" htmlFor="maxTokens">
                Maximum Length: {formData.maxTokens} tokens
              </label>
              <input
                type="range"
                id="maxTokens"
                name="maxTokens"
                min="100"
                max="4000"
                step="100"
                className="w-full"
                value={formData.maxTokens}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label" htmlFor="temperature">
                Creativity: {formData.temperature.toFixed(1)}
              </label>
              <input
                type="range"
                id="temperature"
                name="temperature"
                min="0.1"
                max="1.0"
                step="0.1"
                className="w-full"
                value={formData.temperature}
                onChange={handleSliderChange}
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>More focused</span>
                <span>More creative</span>
              </div>
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Generating...' : 'Generate Content'}
            </button>
          </form>
        </div>
        
        {/* Right column - Generated Content */}
        <div>
          <div className="card mb-4">
            <h2 className="text-xl font-semibold mb-4">Generated Content</h2>
            
            {generatedContent ? (
              <div>
                <div className="mb-4 p-4 bg-gray-50 rounded-md">
                  <pre className="whitespace-pre-wrap">{generatedContent.content}</pre>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <button 
                    className="btn btn-secondary" 
                    onClick={handleCopy}
                  >
                    Copy to Clipboard
                  </button>
                  <button 
                    className="btn btn-success" 
                    onClick={handleSave}
                    disabled={isSaving}
                  >
                    {isSaving ? 'Saving...' : 'Save Content'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <div className="mb-4">
                  <svg className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <p>Fill out the form and click "Generate Content" to see the result here.</p>
              </div>
            )}
          </div>
          
          {/* Metadata section (only shown when content is generated) */}
          {generatedContent && (
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Content Metadata</h2>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-sm text-gray-500">Content Type</div>
                  <div className="font-medium">
                    {contentTypes.find(t => t.id === formData.contentType)?.name || formData.contentType}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-500">Model</div>
                  <div className="font-medium">{generatedContent.metadata?.model || 'GPT-4'}</div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-500">Timestamp</div>
                  <div className="font-medium">
                    {generatedContent.metadata?.timestamp ? new Date(generatedContent.metadata.timestamp).toLocaleString() : '-'}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-500">Tokens Used</div>
                  <div className="font-medium">
                    {generatedContent.metadata?.tokens ? `${generatedContent.metadata.tokens.total} (${generatedContent.metadata.tokens.completion} generation)` : '-'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentGenerationPage;
