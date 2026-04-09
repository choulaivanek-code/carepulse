import React, { useState } from 'react';
import { useSidebarMargin } from '../../hooks/useSidebarMargin';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  ChevronLeft, 
  Check, 
  FileText, 
  Hospital,
  Zap,
  Clock,
  ArrowRight,
  ChevronDown,
  User
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { fileAttenteApi } from '../../api/fileAttenteApi';
import { ticketApi } from '../../api/ticketApi';
import { medecinApi } from '../../api/medecinApi';
import { Sidebar } from '../../components/common/Sidebar';
import { MobileNav } from '../../components/common/MobileNav';
import type { FileAttente } from '../../types';

const FALLBACK_SERVICES: FileAttente[] = [
  { id: 1, nom: 'Médecine Générale', type: 'GENERALE', actif: true, capaciteMax: 50, nombreTicketsEnAttente: 0, tempsAttenteEstime: 0 },
  { id: 2, nom: 'Urgences', type: 'URGENCE', actif: true, capaciteMax: 30, nombreTicketsEnAttente: 0, tempsAttenteEstime: 0 },
  { id: 3, nom: 'Consultations Spécialisées', type: 'SPECIALISEE', actif: true, capaciteMax: 20, nombreTicketsEnAttente: 0, tempsAttenteEstime: 0 },
  { id: 4, nom: 'Suivi & Contrôle', type: 'SUIVI', actif: true, capaciteMax: 25, nombreTicketsEnAttente: 0, tempsAttenteEstime: 0 },
];

const SERVICE_ICONS: Record<string, string> = {
  GENERALE: '🏥',
  URGENCE: '🚨',
  SPECIALISEE: '🩺',
  SUIVI: '🔄',
};

const MOTIFS_PAR_SERVICE: Record<string, string[]> = {
  'Médecine Générale': [
    'Fièvre / Grippe', 'Douleurs abdominales', 'Maux de tête',
    'Toux / Rhume', 'Fatigue inexpliquée', 'Renouvellement ordonnance',
    'Bilan de santé', 'Autre'
  ],
  'Pédiatrie': [
    'Fièvre chez l\'enfant', 'Pleurs inexpliqués', 'Problèmes d\'alimentation',
    'Éruption cutanée', 'Toux / Difficultés respiratoires',
    'Contrôle de croissance', 'Vaccination', 'Autre'
  ],
  'Cardiologie': [
    'Douleurs thoraciques', 'Palpitations cardiaques', 'Essoufflement',
    'Hypertension', 'Contrôle post-opératoire', 'Bilan cardiaque', 'Autre'
  ],
  'Urgences': [
    'Douleur intense soudaine', 'Difficulté à respirer', 'Perte de connaissance',
    'Saignement abondant', 'Traumatisme / Chute', 'Réaction allergique', 'Autre'
  ]
};

const DEFAULT_MOTIFS = [
  'Consultation générale', 'Suivi médical', 'Renouvellement ordonnance', 'Douleur', 'Autre'
];

export const PatientReservation: React.FC = () => {
  const sidebarMargin = useSidebarMargin();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [formData, setFormData] = useState({
    fileId: null as number | null,
    motif: '',
    motifPersonnalise: '',
    priorite: 'NORMALE',
    notes: '',
  });

  const { data: filesData, isLoading: isLoadingFiles, isError: isErrorFiles } = useQuery({
    queryKey: ['files'],
    queryFn: () => fileAttenteApi.getFiles(),
    retry: 1,
  });

  const { data: medecinsData } = useQuery({
    queryKey: ['medecins', formData.fileId],
    queryFn: () => medecinApi.getMedecinsByFile(formData.fileId!),
    enabled: !!formData.fileId,
  });

  const medecins = medecinsData?.data?.data ?? [];

  const files: FileAttente[] = (filesData?.data?.data && filesData.data.data.length > 0)
    ? filesData.data.data
    : FALLBACK_SERVICES;

  const selectedFile = files.find(f => f.id === formData.fileId);

  // Auto-select Urgences on CRITIQUE
  React.useEffect(() => {
    if (formData.priorite === 'CRITIQUE') {
      const urgencesFile = files.find(f => f.nom.toLowerCase().includes('urgence'));
      if (urgencesFile && formData.fileId !== urgencesFile.id) {
        setFormData(prev => ({ ...prev, fileId: urgencesFile.id, motif: '' }));
      }
    }
  }, [formData.priorite, files, formData.fileId]);

  const mutation = useMutation({
    mutationFn: (data: any) => ticketApi.creerTicket(data),
    onSuccess: () => {
      toast.success('Ticket réservé avec succès !');
      navigate('/patient');
    },
    onError: () => {
      toast.error('Erreur lors de la réservation');
    },
  });

  const handleNext = () => setStep(s => s + 1);
  const handlePrev = () => setStep(s => s - 1);

  const handleSelectFile = (file: FileAttente) => {
    setFormData({ ...formData, fileId: file.id });
    setIsDropdownOpen(false);
  };

  const handleSubmit = () => {
    if (!formData.fileId || !formData.motif || (formData.motif === 'Autre' && !formData.motifPersonnalise)) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    let prioriteBackend = 'NORMAL';
    if (formData.priorite === 'MODÉRÉE') prioriteBackend = 'MODERATE';
    if (formData.priorite === 'ÉLEVÉE') prioriteBackend = 'HIGH';
    if (formData.priorite === 'CRITIQUE') prioriteBackend = 'URGENT';

    mutation.mutate({
      fileAttenteId: formData.fileId,
      motif: formData.motif === 'Autre' ? formData.motifPersonnalise : formData.motif,
      priorite: prioriteBackend,
      estUrgence: formData.priorite === 'CRITIQUE',
      consultationType: 'GENERALE',    });
  };
  const formatSchedule = (days: string) => {
    if (!days) return '';
    const dayArray = days.split(',');
    const allDays = ['LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI', 'SAMEDI', 'DIMANCHE'];
    const shortDays: Record<string, string> = {
      LUNDI: 'Lun', MARDI: 'Mar', MERCREDI: 'Mer', JEUDI: 'Jeu', VENDREDI: 'Ven', SAMEDI: 'Sam', DIMANCHE: 'Dim'
    };

    // Check if it's a range (consecutive days)
    let isRange = true;
    if (dayArray.length >= 3) {
      const firstIdx = allDays.indexOf(dayArray[0]);
      for (let i = 1; i < dayArray.length; i++) {
        if (allDays.indexOf(dayArray[i]) !== firstIdx + i) {
          isRange = false;
          break;
        }
      }
    } else {
      isRange = false;
    }

    if (isRange) {
      return `${shortDays[dayArray[0]]} - ${shortDays[dayArray[dayArray.length - 1]]}`;
    }

    return dayArray.map(d => shortDays[d]).join(', ');
  };

  const steps = [
    { num: 1, label: 'Service', icon: Hospital },
    { num: 2, label: 'Détails', icon: FileText },
    { num: 3, label: 'Confirmer', icon: Check },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <main className={`flex-1 ${sidebarMargin} p-6 lg:p-10 pb-28 lg:pb-10 transition-all duration-300`}>
        <div className="max-w-4xl mx-auto animate-fade-in">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight italic mb-12">
            Réserver un ticket
          </h1>

          {/* Stepper */}
          <div className="flex items-center justify-between mb-16 relative">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -translate-y-1/2 z-0" />
            {steps.map((s) => (
              <div key={s.num} className="relative z-10 flex flex-col items-center gap-3">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 border-[3px] shadow-lg ${
                  step >= s.num 
                    ? 'bg-white border-cyan-600 text-cyan-600' 
                    : 'bg-slate-100 border-slate-200 text-slate-400'
                }`}>
                  <s.icon size={24} strokeWidth={step >= s.num ? 3 : 2} />
                </div>
                <p className={`text-[10px] font-black uppercase tracking-widest ${
                  step >= s.num ? 'text-cyan-600' : 'text-slate-400'
                }`}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-[40px] border border-slate-200 shadow-xl overflow-hidden mb-10 min-h-[500px] flex flex-col">
            <div className="flex-1 p-10 lg:p-14">
              {step === 1 && (
                <div className="animate-fade-in max-w-lg mx-auto">
                  <h2 className="text-xl font-black mb-2 tracking-tight">Sélectionnez un service</h2>
                  <p className="text-slate-400 text-sm mb-8">Choisissez le service de la clinique correspondant à votre besoin.</p>

                  {isLoadingFiles ? (
                    <div className="h-40 flex items-center justify-center"><LoadingSpinner /></div>
                  ) : (
                    <div className="space-y-4">
                      {/* Dropdown trigger */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setIsDropdownOpen(o => !o)}
                          className={`w-full flex items-center justify-between p-5 rounded-2xl border-2 text-left transition-all duration-200 focus:outline-none ${
                            isDropdownOpen
                              ? 'border-cyan-500 ring-4 ring-cyan-50 bg-white'
                              : selectedFile
                              ? 'border-cyan-500 bg-cyan-50/30'
                              : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            {selectedFile ? (
                              <>
                                <span className="text-2xl">{SERVICE_ICONS[selectedFile.type] ?? '🏥'}</span>
                                <div>
                                  <p className="font-black text-slate-900 text-base">{selectedFile.nom}</p>
                                  <p className="text-xs text-slate-400 font-medium mt-0.5 flex items-center gap-1">
                                    <Clock size={10} /> ~{selectedFile.tempsAttenteEstime} min d'attente estimée
                                  </p>
                                </div>
                              </>
                            ) : (
                              <span className="text-slate-400 font-medium">Sélectionnez un service...</span>
                            )}
                          </div>
                          <ChevronDown
                            size={20}
                            className={`text-slate-400 shrink-0 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180 text-cyan-600' : ''}`}
                          />
                        </button>

                        {/* Dropdown menu */}
                        {isDropdownOpen && (
                          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 overflow-hidden animate-fade-in">
                            {files.length === 0 ? (
                              <div className="p-6 text-center text-slate-400 text-sm">Aucun service disponible</div>
                            ) : (
                              files.map((file, idx) => (
                                <button
                                  key={file.id}
                                  type="button"
                                  onClick={() => handleSelectFile(file)}
                                  className={`w-full flex items-center gap-4 px-5 py-4 text-left transition-all hover:bg-cyan-50 ${
                                    formData.fileId === file.id ? 'bg-cyan-50' : ''
                                  } ${idx !== 0 ? 'border-t border-slate-100' : ''}`}
                                >
                                  <span className="text-2xl">{SERVICE_ICONS[file.type] ?? '🏥'}</span>
                                  <div className="flex-1 min-w-0">
                                    <p className={`font-bold text-sm truncate ${formData.fileId === file.id ? 'text-cyan-700' : 'text-slate-800'}`}>
                                      {file.nom}
                                    </p>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                      {file.nombreTicketsEnAttente} patient(s) en attente · ~{file.tempsAttenteEstime} min
                                    </p>
                                  </div>
                                  {formData.fileId === file.id && (
                                    <div className="w-6 h-6 rounded-full bg-cyan-600 flex items-center justify-center shrink-0">
                                      <Check size={12} className="text-white" strokeWidth={3} />
                                    </div>
                                  )}
                                </button>
                              ))
                            )}
                          </div>
                        )}
                      </div>

                      {/* Selected service info card */}
                      {selectedFile && (
                        <div className="space-y-6 animate-fade-in">
                          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-cyan-600/10 text-cyan-700 flex items-center justify-center text-xl">
                              {SERVICE_ICONS[selectedFile.type] ?? '🏥'}
                            </div>
                            <div>
                              <p className="font-black text-slate-800">{selectedFile.nom}</p>
                              <p className="text-[11px] text-emerald-600 font-bold uppercase tracking-widest mt-0.5">
                                Service sélectionné ✓
                              </p>
                            </div>
                          </div>

                          <div className="space-y-4">
                             <div className="flex items-center justify-between px-2">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Médecins rattachés</h3>
                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${medecins.length > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                   {medecins.length} disponible(s)
                                </span>
                             </div>

                             {medecins.length > 0 ? (
                               <div className="grid grid-cols-1 gap-3">
                                  {medecins.map((doc: any) => (
                                    <div key={doc.id} className="p-4 rounded-2xl border border-slate-100 bg-white shadow-sm flex items-center justify-between group hover:border-cyan-200 transition-all">
                                       <div className="flex items-center gap-3">
                                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-cyan-50 group-hover:text-cyan-600 transition-colors">
                                             <User size={18} />
                                          </div>
                                          <div>
                                             <p className="text-sm font-black text-slate-900">Dr. {doc.nom}</p>
                                             <p className="text-[10px] text-slate-500 font-medium">{doc.specialite}</p>
                                          </div>
                                       </div>
                                       <div className="text-right">
                                          <div className="flex items-center justify-end gap-1 text-cyan-600 text-[10px] font-black uppercase tracking-tight">
                                             <Clock size={10} />
                                             {doc.heureDebut.slice(0, 5)} - {doc.heureFin.slice(0, 5)}
                                          </div>
                                          <p className="text-[9px] text-slate-400 font-bold mt-0.5 italic">
                                             {formatSchedule(doc.joursTravail)}
                                          </p>
                                       </div>
                                    </div>
                                  ))}
                               </div>
                             ) : (
                               <div className="p-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 text-center">
                                  <p className="text-xs text-slate-400 font-medium italic">
                                     Les médecins seront assignés à votre arrivée
                                  </p>
                               </div>
                             )}
                          </div>
                        </div>
                      )}

                      {isErrorFiles && (
                        <p className="text-[10px] text-amber-500 font-bold text-center uppercase tracking-widest">
                          ⚠ Affichage des services par défaut (serveur indisponible)
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {step === 2 && (
                <div className="animate-fade-in space-y-8 max-w-2xl mx-auto">
                   <h2 className="text-xl font-black mb-4 tracking-tight">Précisez votre motif</h2>
                   <div className="space-y-8">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Objet de la visite</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {(selectedFile && MOTIFS_PAR_SERVICE[selectedFile.nom] ? MOTIFS_PAR_SERVICE[selectedFile.nom] : DEFAULT_MOTIFS).map(m => (
                            <button
                              key={m}
                              type="button"
                              onClick={() => setFormData({ ...formData, motif: m })}
                              className={`p-4 text-sm font-bold rounded-2xl border-2 transition-all text-left ${
                                formData.motif === m 
                                  ? 'border-cyan-600 bg-cyan-50 text-cyan-700 shadow-sm' 
                                  : 'border-slate-100 bg-white text-slate-600 hover:border-slate-200 hover:bg-slate-50'
                              }`}
                            >
                              {m}
                            </button>
                          ))}
                        </div>
                        {formData.motif === 'Autre' && (
                          <div className="pt-2 animate-fade-in">
                            <textarea
                              placeholder="Veuillez préciser votre motif..."
                              className="input-standard min-h-[100px] py-4 resize-none w-full"
                              value={formData.motifPersonnalise}
                              onChange={(e) => setFormData({ ...formData, motifPersonnalise: e.target.value })}
                              autoFocus
                            />
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-4 pt-4 border-t border-slate-100">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Niveau d'importance</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           {[
                             { id: 'NORMALE', label: 'NORMALE', desc: 'Consultation de routine', bg: 'bg-white', border: 'border-slate-200', text: 'text-slate-600', activeBg: 'bg-slate-100', activeBorder: 'border-slate-400', activeText: 'text-slate-800' },
                             { id: 'MODÉRÉE', label: 'MODÉRÉE', desc: 'Symptômes gênants', bg: 'bg-yellow-50/50', border: 'border-yellow-200', text: 'text-yellow-700', activeBg: 'bg-yellow-100', activeBorder: 'border-yellow-400', activeText: 'text-yellow-800' },
                             { id: 'ÉLEVÉE', label: 'ÉLEVÉE', desc: 'Nécessite attention rapide', bg: 'bg-orange-50/50', border: 'border-orange-200', text: 'text-orange-700', activeBg: 'bg-orange-100', activeBorder: 'border-orange-400', activeText: 'text-orange-800' },
                           ].map(p => (
                             <button
                               key={p.id}
                               type="button"
                               onClick={() => setFormData({ ...formData, priorite: p.id })}
                               className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-start ${
                                 formData.priorite === p.id 
                                   ? `${p.activeBg} ${p.activeBorder} ${p.activeText} shadow-sm scale-[1.02]` 
                                   : `${p.bg} ${p.border} ${p.text} hover:scale-[1.01]`
                               }`}
                             >
                               <span className="font-black text-sm uppercase tracking-widest mb-1">{p.label}</span>
                               <span className="text-xs opacity-80 text-left">{p.desc}</span>
                             </button>
                           ))}
                           
                           <button
                             type="button"
                             onClick={() => setFormData({ ...formData, priorite: 'CRITIQUE' })}
                             className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-start md:col-span-1 ${
                               formData.priorite === 'CRITIQUE'
                                 ? `bg-red-600 border-red-700 text-white shadow-md scale-[1.04]` 
                                 : `bg-red-50 border-red-200 text-red-700 hover:bg-red-100 hover:border-red-300 hover:scale-[1.02]`
                             }`}
                           >
                             <span className="font-black text-sm uppercase tracking-widest mb-1 flex items-center gap-2">
                               {formData.priorite === 'CRITIQUE' ? '⚠️' : ''} CRITIQUE
                             </span>
                             <span className="text-xs opacity-90 text-left font-medium">🚨 Prise en charge immédiate</span>
                           </button>
                        </div>
                        
                        {formData.priorite === 'CRITIQUE' && (
                          <div className="mt-4 p-5 bg-red-50 border border-red-200 rounded-2xl animate-fade-in flex items-start gap-4">
                            <span className="text-2xl">⚠️</span>
                            <div>
                              <p className="font-bold text-red-800 text-sm">Urgence vitale possible</p>
                              <p className="text-xs text-red-600 font-medium mt-1">
                                Si vous êtes en danger immédiat, appelez le 911 ou rendez-vous directement aux urgences les plus proches. 
                                (Le service Urgences a été automatiquement sélectionné)
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                   </div>
                </div>
              )}

              {step === 3 && (
                <div className="animate-fade-in max-w-md mx-auto">
                   <div className="text-center mb-10">
                      <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-6">
                        <Check size={40} strokeWidth={3} />
                      </div>
                      <h2 className="text-2xl font-black tracking-tight">Récapitulatif</h2>
                      <p className="text-slate-500 font-medium">Vérifiez vos informations avant de valider</p>
                   </div>

                   <div className="card-premium p-8 space-y-6 bg-slate-50 border-none shadow-none mb-10">
                      <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Service</p>
                        <p className="text-sm font-black text-slate-900">{selectedFile?.nom}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Motif</p>
                        <p className="text-sm font-medium text-slate-700 leading-relaxed italic">"{formData.motif}"</p>
                      </div>
                      <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Priorité</p>
                        <p className={`text-[10px] font-black uppercase tracking-widest py-1 px-3 rounded-full ${
                          formData.priorite === 'CRITIQUE' ? 'bg-red-100 text-red-700' : 
                          formData.priorite === 'ÉLEVÉE' ? 'bg-orange-100 text-orange-700' :
                          formData.priorite === 'MODÉRÉE' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {formData.priorite}
                        </p>
                      </div>
                   </div>

                   <div className="flex items-center gap-3 p-6 bg-cyan-50 border border-cyan-100 rounded-3xl text-cyan-700 mb-8">
                      <Zap size={24} className="fill-cyan-600 shrink-0" />
                      <p className="text-xs font-bold leading-relaxed italic">
                        Votre position estimée sera calculée instantanément après la validation.
                      </p>
                   </div>
                </div>
              )}
            </div>

            <div className="p-8 lg:p-10 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center gap-6">
               {step > 1 && (
                 <button 
                  onClick={handlePrev}
                  className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
                 >
                   <ChevronLeft size={16} /> Précédent
                 </button>
               )}
               <div className="flex-1" />
               <button 
                onClick={step === 3 ? handleSubmit : handleNext}
                disabled={mutation.isPending || (step === 1 && !formData.fileId)}
                className="btn-primary"
               >
                 {step === 3 ? (mutation.isPending ? 'Finalisation...' : 'Confirmer') : 'Suivant'}
                 <ArrowRight size={18} />
               </button>
            </div>
          </div>
        </div>
      </main>
      <MobileNav />
    </div>
  );
};
