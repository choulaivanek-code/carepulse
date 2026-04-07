import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Ticket, 
  PlusCircle, 
  History, 
  MessageSquare,
  Stethoscope,
  Users,
  Settings,
  Cpu,
  LogOut
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { LogoutConfirmModal } from './LogoutConfirmModal';

export const MobileNav: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const navItemsByRole = {
    PATIENT: [
      { path: '/patient', icon: LayoutDashboard },
      { path: '/patient/ticket', icon: Ticket },
      { path: '/patient/reserver', icon: PlusCircle },
      { path: '/patient/messagerie', icon: MessageSquare },
      { path: '/patient/historique', icon: History },
    ],
    AGENT: [
      { path: '/agent', icon: LayoutDashboard },
      { path: '/agent/creer-ticket', icon: PlusCircle },
      { path: '/agent/messagerie', icon: MessageSquare },
    ],
    MEDECIN: [
      { path: '/medecin', icon: Stethoscope },
    ],
    ADMIN: [
      { path: '/admin', icon: LayoutDashboard },
      { path: '/admin/utilisateurs', icon: Users },
      { path: '/admin/ml', icon: Cpu },
      { path: '/admin/configuration', icon: Settings },
    ],
  };

  const navItems = user?.role ? navItemsByRole[user.role as keyof typeof navItemsByRole] : [];

  if (navItems.length === 0) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 lg:hidden flex justify-around items-center h-20 px-4 pb-4 z-40 shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) => `
            flex flex-col items-center justify-center w-12 h-12 rounded-2xl transition-all
            ${isActive ? 'text-cyan-600 bg-cyan-50' : 'text-slate-400'}
          `}
        >
          <item.icon className="w-6 h-6" />
        </NavLink>
      ))}
      <button
        onClick={() => setIsLogoutModalOpen(true)}
        className="flex flex-col items-center justify-center w-12 h-12 rounded-2xl transition-all text-slate-400 hover:text-red-500 hover:bg-red-50"
      >
        <LogOut className="w-6 h-6" />
      </button>

      <LogoutConfirmModal 
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={() => {
          logout();
          navigate('/login');
        }}
      />
    </nav>
  );
};
