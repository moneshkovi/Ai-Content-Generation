import React from 'react';
import { Link, NavLink } from 'react-router-dom';

const Header = () => {
  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-blue-600">
              AI Content Generator
            </Link>
          </div>
          
          <nav className="hidden md:block">
            <ul className="flex space-x-6">
              <li>
                <NavLink 
                  to="/" 
                  className={({ isActive }) => 
                    isActive ? "text-blue-600 font-medium" : "text-gray-600 hover:text-blue-600"
                  }
                  end
                >
                  Home
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/generate" 
                  className={({ isActive }) => 
                    isActive ? "text-blue-600 font-medium" : "text-gray-600 hover:text-blue-600"
                  }
                >
                  Generate Content
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/templates" 
                  className={({ isActive }) => 
                    isActive ? "text-blue-600 font-medium" : "text-gray-600 hover:text-blue-600"
                  }
                >
                  Templates
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/manage" 
                  className={({ isActive }) => 
                    isActive ? "text-blue-600 font-medium" : "text-gray-600 hover:text-blue-600"
                  }
                >
                  Manage Content
                </NavLink>
              </li>
            </ul>
          </nav>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button 
              className="text-gray-500 hover:text-blue-600 focus:outline-none"
              aria-label="Toggle menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Mobile menu (hidden by default) */}
        <div className="md:hidden hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <NavLink 
              to="/" 
              className={({ isActive }) => 
                isActive 
                  ? "block px-3 py-2 rounded-md text-base font-medium text-white bg-blue-600" 
                  : "block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-white hover:bg-blue-600"
              }
              end
            >
              Home
            </NavLink>
            <NavLink 
              to="/generate" 
              className={({ isActive }) => 
                isActive 
                  ? "block px-3 py-2 rounded-md text-base font-medium text-white bg-blue-600" 
                  : "block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-white hover:bg-blue-600"
              }
            >
              Generate Content
            </NavLink>
            <NavLink 
              to="/templates" 
              className={({ isActive }) => 
                isActive 
                  ? "block px-3 py-2 rounded-md text-base font-medium text-white bg-blue-600" 
                  : "block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-white hover:bg-blue-600"
              }
            >
              Templates
            </NavLink>
            <NavLink 
              to="/manage" 
              className={({ isActive }) => 
                isActive 
                  ? "block px-3 py-2 rounded-md text-base font-medium text-white bg-blue-600" 
                  : "block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-white hover:bg-blue-600"
              }
            >
              Manage Content
            </NavLink>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
