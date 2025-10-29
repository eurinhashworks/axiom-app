import React from 'react';
import { IdeasProvider } from './contexts/IdeasContext';
import { ToastProvider } from './contexts/ToastContext';
import AxiomFlow from './components/AxiomFlow';
import SimpleHeader from './components/layout/SimpleHeader';

const App: React.FC = () => {
    return (
        <ToastProvider>
            <IdeasProvider>
                <div className="bg-background text-foreground min-h-screen flex flex-col transition-colors duration-300">
                    <SimpleHeader />
                    <div className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8">
                        <AxiomFlow />
                    </div>
                </div>
            </IdeasProvider>
        </ToastProvider>
    );
};

export default App;
