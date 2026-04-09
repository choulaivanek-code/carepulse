import React, { createContext, useContext, useState, useCallback } from 'react';

interface SidebarContextType {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType>({
  isCollapsed: false,
  toggleSidebar: () => {},
});

export const useSidebar = () => useContext(SidebarContext);

export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('sidebar-collapsed') === 'true';
  });

  const toggleSidebar = useCallback(() => {
    setIsCollapsed(prev => {
      const newState = !prev;
      localStorage.setItem('sidebar-collapsed', String(newState));
      return newState;
    });
  }, []);

  return (
    <SidebarContext.Provider value={{ isCollapsed, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
};
