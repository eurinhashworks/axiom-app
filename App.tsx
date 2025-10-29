import React from 'react';
import { IdeasProvider } from './contexts/IdeasContext';
import { ToastProvider } from './contexts/ToastContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AxiomFlow from './components/AxiomFlow';
import SimpleHeader from './components/layout/SimpleHeader';
import Login from './components/auth/Login';
import Spinner from './components/ui/Spinner';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Spinner />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <IdeasProvider>
      <div className="bg-background text-foreground min-h-screen flex flex-col transition-colors duration-300">
        <SimpleHeader />
        <div className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8">
          <AxiomFlow />
        </div>
      </div>
    </IdeasProvider>
  );
};

const App: React.FC = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;
