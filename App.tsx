import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { IdeasProvider } from './contexts/IdeasContext';
import { ToastProvider } from './contexts/ToastContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AppLayout from './components/layout/AppLayout';
import Login from './components/auth/Login';
import SessionPage from './pages/SessionPage';
import Spinner from './components/ui/Spinner';

// Component to handle protected routes
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Main App component with routing
const App: React.FC = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <IdeasProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route 
                path="/session"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <SessionPage />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              {/* Redirect root path to /session or /login based on auth state */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Navigate to="/session" replace />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Router>
        </IdeasProvider>
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;
