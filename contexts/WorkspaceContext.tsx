import React, { createContext, useContext, ReactNode } from 'react';

// This is a placeholder context to resolve module resolution errors.
const WorkspaceContext = createContext<any>(null);

export const WorkspaceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    return <WorkspaceContext.Provider value={null}>{children}</WorkspaceContext.Provider>;
};

export const useWorkspace = () => useContext(WorkspaceContext);
