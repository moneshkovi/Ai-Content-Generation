import React, { useState } from 'react';
import ApiService from '../services/api.service';
import { toast } from 'react-toastify';

const TemplatesPage = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templateVars, setTemplateVars] = useState({});
  const [generatedContent, setGeneratedContent] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Define available templates
  const templates = [
    {
      id: 'blog_post',
      name: 'Blog Post',
      description: 'Generate a structured blog post with title, introduction, main sections, and conclusion.',
      contentType: 'blog',
      fields: [
        { name: 'topic', label: 'Topic', type: 'text', placeholder: 'e.g., Remote Work Benefits', required: true },
        { name: 'keywords', label: 'Keywords (comma separated)', type: 'text', placeholder: 'e.g., productivity, work-life balance, flexibility', required: true },
        { name: 'tone', label: 'Tone', type: 'select', options: ['professional', 'conversational', 'educational', 'persuasive'], required: true },
        { name: 'audience', label: 'Target Audience', type: 'text', placeholder: 'e.g., HR professionals, business owners', required: true },
        { name: 'num_sections', label: 'Number of Sections', type: 'number', min: 2, max: 6, defaultValue: 3, required: true },
      ]
    },
    {
      id: 'social_media',
      name: 'Social Media Post',
      description: 'Create engaging social media content optimized for the platform of your choice.',
      contentType: 'social',
      fields: [
        { name: 'platform', label: 'Platform', type: 'select', options: ['Twitter', 'LinkedIn', 'Facebook', 'Instagram'], required: true },
        { name: 'topic', label: 'Topic', type: 'text', placeholder: 'e.g., Product Launch, Industry News', required: true },
        { name: 'tone', label: 'Tone', type: 'select', options: ['professional', 'casual', 'enthusiastic', 'informative'], required: true },
      ]
    },
    {
      id: 'product_description',
      name: 'Product Description',
      description: 'Generate compelling product descriptions for your e-commerce store or marketing materials.',
      contentType: 'product',
      fields: [
        { name: 'product_name', label: 'Product Name', type: 'text', placeholder: 'e.g., Ultra Comfort Wireless Headphones', required: true },
        { name: 'features', label: 'Key Features (comma separated)', type: 'text', placeholder: 'e.g., noise cancellation, 30-hour battery, water-resistant', required: true },
        { name: 'audience', label: 'Target Audience', type: 'text', placeholder: 'e.g., music enthusiasts, professionals', required: true },
        { name: 'tone', label: 'Tone', type: 'select', options: ['professional', 'persuasive', 'enthusiastic', 'technical'], required: true },
      ]
    }
  ];
  
  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    
    // Initialize form values with defaults
    const initialVars = {};
    template.fields.forEach(field => {
      if (field.hasOwnProperty('defaultValue')) {
        initialVars[field.name] = field.defaultValue;
      } else if (field.type === 'select' && field.options.length > 0) {
        initialVars[field.name] = field.options[0];
      } else {
        initialVars[field.name] = '';
      }
    });
    
    setTemplateVars(initialVars);
    setGeneratedContent(null);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTemplateVars({
      ...templateVars,
      [name]: value
    });
  };
  
  const handleGenerate = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    const missingFields = selectedTemplate.fields
      .filter(field => field.required && !templateVars[field.name])
      .map(field => field.label);
      
    if (missingFields.length > 0) {
      toast.error(`Please fill in the following fields: ${missingFields.join(', ')}`);
      return;
    }
    
    try {
      setIsLoading(true);
      
      const response = await ApiService.generateFromTemplate(
        selectedTemplate.id,
        templateVars,
        selectedTemplate.contentType
      );
      
      if (response.data.status === 'success') {
        setGeneratedContent(response.data.data);
        toast.success('Content generated successfully!');
      } else {
        throw new Error(response.data.error || 'Failed to generate content');
      }
      
    } catch (error) {
      toast.error(`Error: ${error.message || 'Failed to generate content'}`);
      console.error('Template Generation Error:', error);
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
        selectedTemplate.contentType
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
  
  const handleBack = () => {
    setSelectedTemplate(null);
    setTemplateVars({});
    setGeneratedContent(null);
  };
  
  // Render template selection screen
  if (!selectedTemplate) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-6">Content Templates</h1>
        <p className="text-gray-600 mb-8">
          Choose a template below to quickly generate specific types of content.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div key={template.id} className="card hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleTemplateSelect(template)}>
              <div className="text-blue-600 mb-4">
                <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-2">{template.name}</h2>
              <p className="text-gray-600 mb-4">{template.description}</p>
              <div className="flex items-center text-blue-600">
                <span>Use Template</span>
                <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  // Render template form and results
  return (
    <div>
      <button 
        className="flex items-center text-blue-600 mb-6" 
        onClick={handleBack}
      >
        <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span>Back to Templates</span>
      </button>
      
      <h1 className="text-3xl font-bold mb-2">{selectedTemplate.name}</h1>
      <p className="text-gray-600 mb-6">{selectedTemplate.description}</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left column - Template Form */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Fill Template Details</h2>
          
          <form onSubmit={handleGenerate}>
            {selectedTemplate.fields.map((field) => (
              <div key={field.name} className="form-group">
                <label className="form-label" htmlFor={field.name}>
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </label>
                
                {field.type === 'select' ? (
                  <select
                    id={field.name}
                    name={field.name}
                    className="form-select"
                    value={templateVars[field.name] || ''}
                    onChange={handleInputChange}
                    required={field.required}
                  >
                    {field.options.map(option => (
                      <option key={option} value={option}>
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                      </option>
                    ))}
                  </select>
                ) : field.type === 'number' ? (
                  <input
                    type="number"
                    id={field.name}
                    name={field.name}
                    className="form-input"
                    value={templateVars[field.name] || ''}
                    onChange={handleInputChange}
                    min={field.min}
                    max={field.max}
                    required={field.required}
                  />
                ) : (
                  <input
                    type="text"
                    id={field.name}
                    name={field.name}
                    className="form-input"
                    value={templateVars[field.name] || ''}
                    onChange={handleInputChange}
                    placeholder={field.placeholder}
                    required={field.required}
                  />
                )}
              </div>
            ))}
            
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p>Fill out the template form and click "Generate Content" to see the result here.</p>
              </div>
            )}
          </div>
          
          {/* Template Info (always shown) */}
          <div className="card bg-blue-50">
            <h2 className="text-xl font-semibold mb-4">Template Tips</h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li>Be as specific as possible in your template details for better results.</li>
              <li>For best results, fill in all fields, even if they're not marked as required.</li>
              <li>You can edit the generated content before saving if you need to make adjustments.</li>
              <li>This template is optimized for {selectedTemplate.name.toLowerCase()} content.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplatesPage;
