import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const SidebarContext = createContext(null);

const MOBILE_BREAKPOINT = 768;
const TABLET_BREAKPOINT = 1024;

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false
  );
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return isMobile;
}

export function useIsTabletOrSmaller() {
  const [isTabletOrSmaller, setIsTabletOrSmaller] = useState(
    typeof window !== 'undefined' ? window.innerWidth < TABLET_BREAKPOINT : false
  );
  useEffect(() => {
    const handleResize = () =>
      setIsTabletOrSmaller(window.innerWidth < TABLET_BREAKPOINT);
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return isTabletOrSmaller;
}

function getInitialSidebarOpen() {
  if (typeof window === 'undefined') return true;
  return window.innerWidth >= MOBILE_BREAKPOINT;
}

export function SidebarProvider({ children }) {
  const [isOpen, setIsOpen] = useState(getInitialSidebarOpen);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < MOBILE_BREAKPOINT) {
        setIsOpen(false);
      } else if (width >= TABLET_BREAKPOINT) {
        setIsOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setIsOpen(false);
  }, []);

  const value = { isOpen, toggleSidebar, closeSidebar };

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    return {
      isOpen: true,
      toggleSidebar: () => {},
      closeSidebar: () => {},
    };
  }
  return context;
}
