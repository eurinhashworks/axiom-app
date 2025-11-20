import React, { useState } from 'react';
import { useIdeas } from '../../contexts/IdeasContext';
import Sidebar from './Sidebar';
import Header from './Header';
import { DashboardPage } from '../../pages/DashboardPage';
import SessionPage from '../../pages/SessionPage';

/**
 * Layout principal de l'application
 * Phase 1: Foundation - Structure de base avec sidebar et header
 */
const AppLayout: React.FC = () => {
  const { activeIdea } = useIdeas();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar - Toujours visible sur desktop, toggle sur mobile */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <Header 
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
            {activeIdea ? (
              <SessionPage />
            ) : (
              <DashboardPage />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;

