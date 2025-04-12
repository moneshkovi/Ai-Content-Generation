import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';

// Import components
import Header from './components/Header';
import Footer from './components/Footer';

// Import pages
import HomePage from './pages/HomePage';
import ContentGenerationPage from './pages/ContentGenerationPage';
import TemplatesPage from './pages/TemplatesPage';
import ContentManagementPage from './pages/ContentManagementPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/generate" element={<ContentGenerationPage />} />
          <Route path="/templates" element={<TemplatesPage />} />
          <Route path="/manage" element={<ContentManagementPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
