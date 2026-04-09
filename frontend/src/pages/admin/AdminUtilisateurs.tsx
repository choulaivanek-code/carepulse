import React, { useState } from 'react';
import { useSidebarMargin } from '../../hooks/useSidebarMargin';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  UserPlus, 
  Search, 
  Filter, 
  Download,
  Users,
  ShieldCheck,
  UserX,
  Mail
} from 'lucide-react';
import toast from 'react-hot-toast';
import { adminApi } from '../../api/adminApi';
import { Sidebar } from '../../components/common/Sidebar';
import { MobileNav } from '../../components/common/MobileNav';
import { UserTable } from '../../components/admin/UserTable';
import { UserFormModal } from '../../components/admin/UserFormModal';
import { ConfirmDeleteModal } from '../../components/admin/ConfirmDeleteModal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import type { User } from '../../types';

export const AdminUtilisateurs: React.FC = () => {
  const sidebarMargin = useSidebarMargin();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const { data: usersData, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => adminApi.getUsers(),
    refetchInterval: 60000,
  });

  const toggleMutation = useMutation({
    mutationFn: (id: number) => adminApi.toggleUser(id),
    onSuccess: () => {
      toast.success('Statut mis à jour');
      refetch();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erreur lors du changement de statut');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteUser(id),
    onSuccess: () => {
      toast.success('Utilisateur supprimé avec succès');
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
      refetch();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erreur lors de la suppression');
    }
  });

  const createUserMutation = useMutation({
    mutationFn: (data: any) => {
      if (data.role === 'MEDECIN') return adminApi.createMedecin(data);
      return adminApi.createAgent(data);
    },
    onSuccess: () => {
      toast.success('Utilisateur créé avec succès');
      setIsFormModalOpen(false);
      refetch();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erreur lors de la création');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: any }) => adminApi.updateUser(id, data),
    onSuccess: () => {
      toast.success('Utilisateur mis à jour');
      setIsFormModalOpen(false);
      setSelectedUser(null);
      refetch();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erreur lors de la modification');
    }
  });

  const users = usersData?.data?.data ?? [];
  const filteredUsers = users.filter((u: User) => {
    const fullName = `${u.prenom} ${u.nom}`.toLowerCase();
    const matchesSearch = fullName.includes(search.toLowerCase()) || 
                         u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleOpenAddModal = () => {
    setSelectedUser(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (user: User) => {
    setSelectedUser(user);
    setIsFormModalOpen(true);
  };

  const handleOpenDeleteModal = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleFormSubmit = (data: any) => {
    if (selectedUser) {
      updateMutation.mutate({ id: selectedUser.id, data: { ...data, active: selectedUser.active } });
    } else {
      createUserMutation.mutate(data);
    }
  };

  const stats = [
    { label: 'Utilisateurs', value: users.length, icon: Users, color: 'text-cyan-600' },
    { label: 'Actifs', value: users.filter((u: User) => u.active).length, icon: ShieldCheck, color: 'text-emerald-600' },
    { label: 'Désactivés', value: users.filter((u: User) => !u.active).length, icon: UserX, color: 'text-red-500' },
    { label: 'Invitations', value: 3, icon: Mail, color: 'text-amber-500' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <main className={`flex-1 ${sidebarMargin} p-6 lg:p-10 pb-28 lg:pb-10 transition-all duration-300`}>
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12 animate-fade-in">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight italic">Utilisateurs</h1>
            <p className="text-slate-500 font-medium mt-1">Gérez les comptes et les accès du personnel</p>
          </div>
          <div className="flex items-center gap-3">
             <button 
               onClick={handleOpenAddModal}
               className="bg-slate-900 text-white px-6 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-2 shadow-xl shadow-slate-900/20"
             >
                <UserPlus size={16} />
                Ajouter un membre
             </button>
             <button className="bg-white border border-slate-200 text-slate-400 p-3.5 rounded-2xl hover:text-cyan-600 transition-colors">
                <Download size={20} />
             </button>
          </div>
        </header>

        {/* User Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12 animate-fade-in">
           {stats.map((s, idx) => (
             <div key={idx} className="card-premium p-6 flex flex-col items-center text-center">
                <div className={`w-10 h-10 rounded-xl bg-slate-50 ${s.color} flex items-center justify-center mb-4`}>
                   <s.icon size={20} />
                </div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
                <p className="text-xl font-black text-slate-900">{s.value}</p>
             </div>
           ))}
        </div>

        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col lg:flex-row gap-4 items-end lg:items-center">
             <div className="relative flex-1 w-full lg:w-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Rechercher par nom, email..."
                  className="input-standard bg-white pl-12 h-12"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
             </div>
             <div className="flex gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-200">
                   <Filter size={14} className="text-slate-400" />
                   <select 
                     className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest text-slate-600 outline-none"
                     value={roleFilter}
                     onChange={e => setRoleFilter(e.target.value)}
                   >
                      <option value="ALL">Tous les rôles</option>
                      <option value="PATIENT">Patients</option>
                      <option value="MEDECIN">Médecins</option>
                      <option value="AGENT">Agents</option>
                   </select>
                </div>
             </div>
          </div>

          {isLoading ? (
            <div className="h-64 flex items-center justify-center"><LoadingSpinner /></div>
          ) : isError ? (
            <div className="h-64 flex flex-col items-center justify-center gap-4 text-slate-500">
               <p className="font-bold italic">Une erreur est survenue lors du chargement des utilisateurs</p>
               <button onClick={() => refetch()} className="text-xs font-black uppercase tracking-widest text-cyan-600 hover:underline">Réessayer</button>
            </div>
          ) : (
            <UserTable 
              users={filteredUsers} 
              onToggleStatus={(id) => toggleMutation.mutate(id)}
              onEdit={handleOpenEditModal}
              onDelete={handleOpenDeleteModal}
            />
          )}
        </div>
      </main>

      <UserFormModal 
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        user={selectedUser}
        isLoading={createUserMutation.isPending || updateMutation.isPending}
      />

      <ConfirmDeleteModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => selectedUser && deleteMutation.mutate(selectedUser.id)}
        title="Supprimer l'utilisateur"
        message={`Êtes-vous sûr de vouloir supprimer ${selectedUser?.prenom} ${selectedUser?.nom} ? Cette action est irréversible.`}
        isLoading={deleteMutation.isPending}
      />

      <MobileNav />
    </div>
  );
};
