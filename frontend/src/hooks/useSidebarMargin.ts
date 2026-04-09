import { useSidebar } from '../context/SidebarContext';

/**
 * Returns the dynamic margin-left class for the main content area,
 * synchronized with the sidebar collapsed/expanded state.
 */
export const useSidebarMargin = () => {
  const { isCollapsed } = useSidebar();
  return isCollapsed ? 'lg:ml-16' : 'lg:ml-64';
};
