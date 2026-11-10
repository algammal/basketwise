import React, { createContext, useContext, useMemo, useState } from 'react';
import { CircularNavigation } from './CircularNavigation';

interface CircularNavigationContextValue {
  isWheelOpen: boolean;
  setIsWheelOpen: (open: boolean) => void;
}

const CircularNavigationContext = createContext<CircularNavigationContextValue | null>(null);

/**
 * Mounts the circular navigation exactly once near the app root so it
 * survives route changes without remounting. Screens never render their
 * own copy — they just render inside this provider.
 */
export function CircularNavigationProvider({ children }: { children: React.ReactNode }) {
  const [isWheelOpen, setIsWheelOpen] = useState(false);

  const contextValue = useMemo(() => ({ isWheelOpen, setIsWheelOpen }), [isWheelOpen]);

  return (
    <CircularNavigationContext.Provider value={contextValue}>
      {children}
      <CircularNavigation />
    </CircularNavigationContext.Provider>
  );
}

export function useCircularNavigationContext(): CircularNavigationContextValue {
  const context = useContext(CircularNavigationContext);
  if (!context) {
    throw new Error('useCircularNavigationContext must be used within a CircularNavigationProvider');
  }
  return context;
}
