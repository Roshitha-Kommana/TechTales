import React, { createContext, useState, ReactNode } from 'react';

interface ServerWakingContextType {
  isWakingUp: boolean;
  setIsWakingUp: (isWaking: boolean) => void;
}

export const ServerWakingContext = createContext<ServerWakingContextType | undefined>(
  undefined
);

export const ServerWakingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isWakingUp, setIsWakingUp] = useState(false);

  return (
    <ServerWakingContext.Provider value={{ isWakingUp, setIsWakingUp }}>
      {children}
    </ServerWakingContext.Provider>
  );
};

/**
 * Hook to use server waking status
 */
export const useServerWaking = () => {
  const context = React.useContext(ServerWakingContext);
  if (!context) {
    throw new Error('useServerWaking must be used within ServerWakingProvider');
  }
  return context;
};
