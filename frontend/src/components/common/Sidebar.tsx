import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Ticket, 
  PlusCircle, 
  History, 
  MessageSquare, 
  Settings, 
  Users, 
  FileBarChart, 
  Cpu,
  Stethoscope,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Logo } from './Logo';
import { LogoutConfirmModal } from './LogoutConfirmModal';
import { useSidebar } from '../../context/SidebarContext';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { isCollapsed, toggleSidebar } = useSidebar();

  const navItemsByRole = {
    PATIENT: [
      { label: 'Tableau de bord', path: '/patient', icon: LayoutDashboard },
      { label: 'Mon ticket', path: '/patient/ticket', icon: Ticket },
      { label: 'Réserver', path: '/patient/reserver', icon: PlusCircle },
      { label: 'Historique', path: '/patient/historique', icon: History },
      { label: 'Messagerie', path: '/patient/messagerie', icon: MessageSquare },
    ],
    AGENT: [
      { label: 'Tableau de bord', path: '/agent', icon: LayoutDashboard },
      { label: 'Créer ticket', path: '/agent/creer-ticket', icon: PlusCircle },
      { label: 'Messagerie', path: '/agent/messagerie', icon: MessageSquare },
    ],
    MEDECIN: [
      { label: 'Console', path: '/medecin', icon: Stethoscope },
    ],
    ADMIN: [
      { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
      { label: 'Utilisateurs', path: '/admin/utilisateurs', icon: Users },
      { label: 'Configuration', path: '/admin/configuration', icon: Settings },
      { label: 'Rapports', path: '/admin/rapports', icon: FileBarChart },
      { label: 'Intelligence IA', path: '/admin/ml', icon: Cpu },
    ],
  };

  const navItems = user?.role ? navItemsByRole[user.role as keyof typeof navItemsByRole] : [];

  /* ── Sidebar content (shared between desktop & mobile drawer) ── */
  const sidebarContent = (isMobile: boolean) => {
    const collapsed = !isMobile && isCollapsed;

    return (
      <>
        {/* Header */}
        <div className={`border-b border-slate-50 flex items-center ${collapsed ? 'justify-center p-4' : 'justify-between p-6'}`}>
          <Logo size={collapsed ? 'sm' : 'md'} showText={!collapsed} />
          {/* Toggle button — desktop only */}
          {!isMobile && (
            <button
              onClick={toggleSidebar}
              className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-cyan-50 text-slate-400 hover:text-cyan-600 flex items-center justify-center transition-all duration-200 shrink-0"
              title={isCollapsed ? 'Déplier' : 'Replier'}
            >
              {isCollapsed ? <ChevronRight size={16} strokeWidth={2.5} /> : <ChevronLeft size={16} strokeWidth={2.5} />}
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => isMobile && setIsMobileOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 ${collapsed ? 'justify-center px-3' : 'px-6'} py-4 text-sm font-semibold transition-all relative group
                ${isActive 
                  ? `bg-cyan-50 text-cyan-600 ${collapsed ? '' : 'border-l-[3px] border-cyan-600'}` 
                  : 'text-slate-600 hover:bg-slate-50'
                }
              `}
            >
              {({ isActive }) => (
                <>
                  <item.icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-cyan-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                  {!collapsed && <span>{item.label}</span>}
                  {/* Tooltip on hover — collapsed only */}
                  {collapsed && (
                    <span className="absolute left-full ml-3 px-3 py-1.5 bg-slate-800 text-white text-xs font-bold rounded-lg shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-[9999]">
                      {item.label}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className={`border-t border-slate-100 bg-slate-50/30 ${collapsed ? 'p-3' : 'p-6'}`}>
          {!collapsed && (
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-cyan-600 text-white flex items-center justify-center font-bold shadow-sm shrink-0">
                {user?.prenom?.[0]}{user?.nom?.[0]}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-extrabold text-slate-900 truncate">
                  {user?.prenom} {user?.nom}
                </p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">
                  {user?.role}
                </p>
              </div>
            </div>
          )}
          <button 
            onClick={() => setIsLogoutModalOpen(true)}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-slate-200 text-slate-600 text-xs font-black uppercase tracking-widest hover:border-red-100 hover:bg-red-50 hover:text-red-500 transition-all duration-300 group relative ${collapsed ? 'px-0' : ''}`}
          >
            <LogOut size={14} />
            {!collapsed && 'Déconnexion'}
            {collapsed && (
              <span className="absolute left-full ml-3 px-3 py-1.5 bg-slate-800 text-white text-xs font-bold rounded-lg shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-[9999]">
                Déconnexion
              </span>
            )}
          </button>
        </div>
      </>
    );
  };

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside
        className={`fixed left-0 top-0 bottom-0 bg-white border-r border-slate-200 hidden lg:flex flex-col z-30 shadow-sm transition-all duration-300 ${
          isCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        {sidebarContent(false)}
      </aside>

      {/* ── Mobile hamburger button ── */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="fixed top-4 left-4 z-40 w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-md flex items-center justify-center text-slate-600 lg:hidden hover:bg-cyan-50 hover:text-cyan-600 transition-all"
        aria-label="Ouvrir le menu"
      >
        <Menu size={20} />
      </button>

      {/* ── Mobile overlay ── */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* ── Mobile drawer ── */}
      <aside
        className={`fixed left-0 top-0 bottom-0 w-72 bg-white border-r border-slate-200 flex flex-col z-50 shadow-2xl lg:hidden transition-transform duration-300 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Close button */}
        <button
          onClick={() => setIsMobileOpen(false)}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-500 flex items-center justify-center transition-all z-10"
        >
          <X size={16} />
        </button>
        {sidebarContent(true)}
      </aside>

      <LogoutConfirmModal 
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={() => {
          logout();
          navigate('/login');
        }}
      />
    </>
  );
};
