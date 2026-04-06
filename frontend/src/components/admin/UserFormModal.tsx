import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Award, Briefcase, Shield, Clock } from 'lucide-react';
import { fileAttenteApi } from '../../api/fileAttenteApi';
import type { FileAttente, User as UserType } from '../../types';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  user?: UserType | null;
  isLoading: boolean;
}

export const UserFormModal: React.FC<UserFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  user,
  isLoading,
}) => {
  const [role, setRole] = useState<UserType['role']>(user?.role || 'MEDECIN');
  const [form, setForm] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    specialite: '',
    numeroOrdre: '',
    poste: '',
    joursTravail: [] as string[],
    heureDebut: '09:00',
    heureFin: '17:00',
    fileAttenteId: '' as string | number,
    disponible: true,
  });

  const isModeEdition = !!user;
  const isMedecin = role === 'MEDECIN';
  const isAgent = role === 'AGENT';

  const [files, setFiles] = useState<FileAttente[]>([]);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await fileAttenteApi.getFiles();
        if (response.data.success) {
          setFiles(response.data.data);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des files", error);
      }
    };
    fetchFiles();
  }, []);

  useEffect(() => {
    if (user) {
      setForm({
        nom: user.nom || '',
        prenom: user.prenom || '',
        email: user.email || '',
        telephone: user.telephone || '',
        specialite: user.specialite || '',
        numeroOrdre: user.numeroOrdre || '',
        poste: '',
        joursTravail: user.joursTravail ? user.joursTravail.split(',') : [],
        heureDebut: user.heureDebut || '09:00',
        heureFin: user.heureFin || '17:00',
        fileAttenteId: user.fileAttenteId || '',
        disponible: user.disponible !== undefined ? user.disponible : true,
      });
      setRole(user.role);
    } else {
      setForm({
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        specialite: '',
        numeroOrdre: '',
        poste: '',
        joursTravail: [],
        heureDebut: '09:00',
        heureFin: '17:00',
        fileAttenteId: '',
        disponible: true,
      });
      setRole('MEDECIN');
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { 
      ...form, 
      role,
      joursTravail: isMedecin ? form.joursTravail.join(',') : null,
      fileAttenteId: isMedecin && form.fileAttenteId !== '' ? Number(form.fileAttenteId) : null,
      disponible: isMedecin ? form.disponible : null
    };

    // Remove unnecessary fields based on role
    if (!isMedecin) {
      delete (data as any).specialite;
      delete (data as any).numeroOrdre;
      delete (data as any).joursTravail;
      delete (data as any).heureDebut;
      delete (data as any).heureFin;
      delete (data as any).fileAttenteId;
      delete (data as any).disponible;
    }
    
    if (!isAgent) {
      delete (data as any).poste;
    }

    onSubmit(data);
  };

  const DAYS = [
    { id: 'LUNDI', label: 'Lun' },
    { id: 'MARDI', label: 'Mar' },
    { id: 'MERCREDI', label: 'Mer' },
    { id: 'JEUDI', label: 'Jeu' },
    { id: 'VENDREDI', label: 'Ven' },
    { id: 'SAMEDI', label: 'Sam' },
    { id: 'DIMANCHE', label: 'Dim' },
  ];

  const toggleDay = (day: string) => {
    setForm(prev => ({
      ...prev,
      joursTravail: prev.joursTravail.includes(day)
        ? prev.joursTravail.filter(d => d !== day)
        : [...prev.joursTravail, day]
    }));
  };

  return (
    <div className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 animate-zoom-in">
        <div className="px-10 py-8 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
          <div>
            <h2 className="text-[10px] font-black text-cyan-600 uppercase tracking-[0.2em] mb-1">
              {isModeEdition ? 'Profil Utilisateur' : 'Nouveau Membre'}
            </h2>
            <p className="text-2xl font-black text-slate-900 tracking-tight italic">
              {isModeEdition ? `Modifier ${form.prenom}` : 'Ajouter un membre'}
            </p>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-red-500 rounded-2xl transition-all active:scale-95">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col max-h-[85vh]">
          {/* Scrollable Content */}
          <div className="p-10 overflow-y-auto space-y-10 custom-scrollbar">
            {!isModeEdition && (
            <div className="flex p-1 bg-slate-100 rounded-2xl mb-8">
              <button
                type="button"
                onClick={() => setRole('MEDECIN')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  role === 'MEDECIN' ? 'bg-white text-cyan-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Shield size={14} />
                Médecin
              </button>
              <button
                type="button"
                onClick={() => setRole('AGENT')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  role === 'AGENT' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Briefcase size={14} />
                Agent Accueil
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 italic">Prénom</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  value={form.prenom}
                  onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                  required
                  className="input-standard pl-12 h-14"
                  placeholder="Jean"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 italic">Nom</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  value={form.nom}
                  onChange={(e) => setForm({ ...form, nom: e.target.value })}
                  required
                  className="input-standard pl-12 h-14"
                  placeholder="Dupont"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 italic">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  disabled={!!user}
                  className="input-standard pl-12 h-14 disabled:bg-slate-50 disabled:text-slate-400"
                  placeholder="jean.dupont@carepulse.com"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 italic">Téléphone</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="tel"
                  value={form.telephone}
                  onChange={(e) => setForm({ ...form, telephone: e.target.value })}
                  className="input-standard pl-12 h-14"
                  placeholder="01 23 45 67 89"
                />
              </div>
            </div>

            {/* Role Specific Group */}
            {isMedecin && (
              <div className="pt-10 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 italic">Spécialité</label>
                  <div className="relative">
                    <Award className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="text"
                      value={form.specialite}
                      onChange={(e) => setForm({ ...form, specialite: e.target.value })}
                      required
                      className="input-standard pl-12 h-14"
                      placeholder="Cardiologie"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 italic">Numéro d'ordre</label>
                  <div className="relative">
                    <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="text"
                      value={form.numeroOrdre}
                      onChange={(e) => setForm({ ...form, numeroOrdre: e.target.value })}
                      required
                      className="input-standard pl-12 h-14"
                      placeholder="123456789"
                    />
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 italic">File d'attente (Service)</label>
                  <div className="relative">
                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <select
                      value={form.fileAttenteId}
                      onChange={(e) => setForm({ ...form, fileAttenteId: e.target.value })}
                      required
                      className="input-standard pl-12 h-14 bg-white appearance-none"
                    >
                      <option value="">Sélectionnez un service...</option>
                      {files.map((file) => (
                        <option key={file.id} value={file.id}>
                          {file.nom}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-4 md:col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 italic">Planning hebdomadaire</label>
                  <div className="flex flex-wrap gap-2">
                    {DAYS.map((day) => (
                      <button
                        key={day.id}
                        type="button"
                        onClick={() => toggleDay(day.id)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          form.joursTravail.includes(day.id)
                            ? 'bg-cyan-600 text-white shadow-md'
                            : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                        }`}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 italic">Heure Début</label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="time"
                      value={form.heureDebut}
                      onChange={(e) => setForm({ ...form, heureDebut: e.target.value })}
                      required
                      className="input-standard pl-12 h-14"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 italic">Heure Fin</label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="time"
                      value={form.heureFin}
                      onChange={(e) => setForm({ ...form, heureFin: e.target.value })}
                      required
                      className="input-standard pl-12 h-14"
                    />
                  </div>
                </div>

                <div className="md:col-span-2 pt-4">
                   <div className="flex items-center justify-between p-4 bg-slate-50 rounded-3xl border border-slate-100">
                      <div>
                         <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Disponibilité immédiate</p>
                         <p className="text-[10px] text-slate-400 font-medium">Permet d'apparaître dans les files d'attente</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, disponible: !form.disponible })}
                        className={`relative w-14 h-8 rounded-full transition-all duration-300 ${
                           form.disponible ? 'bg-emerald-500' : 'bg-slate-300'
                        }`}
                      >
                         <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-sm ${
                            form.disponible ? 'left-7' : 'left-1'
                         }`} />
                      </button>
                   </div>
                </div>
              </div>
            )}

            {isAgent && (
              <div className="pt-10 border-t border-slate-100 animate-fade-in">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 italic">Poste / Fonction</label>
                  <div className="relative">
                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="text"
                      value={form.poste}
                      onChange={(e) => setForm({ ...form, poste: e.target.value })}
                      required
                      className="input-standard pl-12 h-14"
                      placeholder="Accueil Urgences"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer fixe */}
          <div className="p-8 border-t border-slate-50 bg-slate-50/30 flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 rounded-2xl border-2 border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 hover:text-slate-900 transition-all active:scale-95"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary flex-1 py-4 h-14 text-[10px] tracking-[0.2em] italic"
            >
              {isLoading ? 'Traitement...' : isModeEdition ? 'Enregistrer les modifications' : (isMedecin ? 'Créer le médecin' : 'Créer l\'agent')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
