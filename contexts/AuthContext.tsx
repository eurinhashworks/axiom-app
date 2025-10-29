import React, { createContext, useContext, ReactNode } from 'react';

// This is a placeholder context to resolve module resolution errors.
const AuthContext = createContext<any>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    return <AuthContext.Provider value={null}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
