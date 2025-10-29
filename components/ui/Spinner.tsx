
import React from 'react';

const Spinner: React.FC = () => {
    return (
        <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-brand-accent animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-3 h-3 rounded-full bg-brand-accent animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-3 h-3 rounded-full bg-brand-accent animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>
    );
};

export default Spinner;
