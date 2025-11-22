import React from 'react';
import Header from './Header';

interface AppLayoutProps {
  children: React.ReactNode;
}

/**
 * Layout principal de l'application - Simplifié
 * Affiche un en-tête et le contenu de la page.
 */
const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <Header />

      {/* Page Content */}
      <main className="flex-1">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AppLayout;

