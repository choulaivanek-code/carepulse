import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarPlus,
  Clock,
  MessageCircle,
  Star,
  PlusCircle,
  Stethoscope,
  Users,
  BarChart3,
  LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { LogoutConfirmModal } from './LogoutConfirmModal';

interface BottomNavItem {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const navByRole: Record<string, BottomNavItem[]> = {
  PATIENT: [
    { to: '/patient', icon: <LayoutDashboard size={20} />, label: 'Accueil' },
    { to: '/patient/reservation', icon: <CalendarPlus size={20} />, label: 'Réserver' },
    { to: '/patient/historique', icon: <Clock size={20} />, label: 'Historique' },
    { to: '/patient/messagerie', icon: <MessageCircle size={20} />, label: 'Messages' },
    { to: '/patient/feedback', icon: <Star size={20} />, label: 'Feedback' },
  ],
  AGENT: [
    { to: '/agent', icon: <LayoutDashboard size={20} />, label: 'File' },
    { to: '/agent/creer-ticket', icon: <PlusCircle size={20} />, label: 'Ticket' },
    { to: '/agent/messagerie', icon: <MessageCircle size={20} />, label: 'Messages' },
  ],
  MEDECIN: [
    { to: '/medecin', icon: <Stethoscope size={20} />, label: 'Console' },
    { to: '/medecin/messagerie', icon: <MessageCircle size={20} />, label: 'Messages' },
  ],
  ADMIN: [
    { to: '/admin', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { to: '/admin/utilisateurs', icon: <Users size={20} />, label: 'Usagers' },
    { to: '/admin/rapports', icon: <BarChart3 size={20} />, label: 'Rapports' },
  ],
};

export const Navbar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = React.useState(false);

  const navItems = navByRole[user?.role ?? ''] ?? [];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-navy-deep border-t border-navy-light z-50 safe-area-pb shadow-[0_-4px_20px_rgba(0,0,0,0.4)]">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to.split('/').length <= 2}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all duration-200 ${
                isActive ? 'text-cyan-pulse bg-cyan-pulse/10' : 'text-gray-soft/40'
              }`
            }
          >
            {item.icon}
            <span className="text-[10px] font-bold uppercase tracking-tight">{item.label}</span>
          </NavLink>
        ))}
        <button
          onClick={() => setIsLogoutModalOpen(true)}
          className="flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all duration-200 text-gray-soft/40 hover:text-red-500 hover:bg-red-500/10"
        >
          <LogOut size={20} />
          <span className="text-[10px] font-bold uppercase tracking-tight">Quitter</span>
        </button>
      </div>

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
