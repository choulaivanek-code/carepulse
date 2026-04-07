import React from 'react';
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
  LogOut
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Logo } from './Logo';
import { LogoutConfirmModal } from './LogoutConfirmModal';
export const Sidebar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = React.useState(false);

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


  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-slate-200 hidden lg:flex flex-col z-30 shadow-sm">
      <div className="p-6 border-b border-slate-50">
        <Logo size="md" />
      </div>

      <nav className="flex-1 py-6">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-3 px-6 py-4 text-sm font-semibold transition-all relative group
              ${isActive 
                ? 'bg-cyan-50 text-cyan-600 border-l-[3px] border-cyan-600' 
                : 'text-slate-600 hover:bg-slate-50'
              }
            `}
          >
            {({ isActive }) => (
              <>
                <item.icon className={`w-5 h-5 ${isActive ? 'text-cyan-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-6 border-t border-slate-100 bg-slate-50/30">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-cyan-600 text-white flex items-center justify-center font-bold shadow-sm">
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
        <button 
          onClick={() => setIsLogoutModalOpen(true)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-slate-200 text-slate-600 text-xs font-black uppercase tracking-widest hover:border-red-100 hover:bg-red-50 hover:text-red-500 transition-all duration-300"
        >
          <LogOut size={14} />
          Déconnexion
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
    </aside>
  );
};
