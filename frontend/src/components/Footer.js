import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">About AI Content Generator</h3>
            <p className="text-gray-300">
              AI-powered platform for generating and managing content using OpenAI's GPT-4 API.
              Create blog posts, social media content, product descriptions, and more with ease.
            </p>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/generate" className="text-gray-300 hover:text-white">
                  Generate Content
                </Link>
              </li>
              <li>
                <Link to="/templates" className="text-gray-300 hover:text-white">
                  Templates
                </Link>
              </li>
              <li>
                <Link to="/manage" className="text-gray-300 hover:text-white">
                  Manage Content
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <p className="text-gray-300 mb-2">
              Have questions or need help?
            </p>
            <p className="text-gray-300">
              Email: support@aicontentgen.example.com
            </p>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} AI Content Generation Platform. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
