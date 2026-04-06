import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '../../api/authApi';
import { useAuthStore } from '../../store/authStore';
import { Logo } from '../../components/common/Logo';
import type { LoginRequest } from '../../types';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<LoginRequest>({
    email: '',
    password: '',
  });

  const mutation = useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (response) => {
      login(response.data.data);
      toast.success('Bon retour parmi nous !');
      
      const role = response.data.data.role;
      if (role === 'PATIENT') navigate('/patient');
      else if (role === 'AGENT') navigate('/agent');
      else if (role === 'MEDECIN') navigate('/medecin');
      else if (role === 'ADMIN') navigate('/admin');
    },
    onError: () => {
      toast.error('Email ou mot de passe incorrect');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }
    mutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col selection:bg-cyan-100 selection:text-cyan-900">
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-[448px] bg-white border border-[#E2E8F0] rounded-[16px] shadow-[0_10px_40px_rgba(0,0,0,0.03)] overflow-hidden relative z-10 animate-in fade-in zoom-in duration-500">
          <div className="p-[48px] pb-[32px]">
            {/* Brand Section */}
            <div className="flex flex-col items-center mb-[32px]">
              <div className="w-[84px] h-[84px] rounded-full bg-white border border-[#E2E8F0] shadow-sm flex items-center justify-center mb-4 transition-transform hover:scale-105">
                <Logo size="lg" showText={false} variant="cyan" />
              </div>
              <span className="text-[24px] font-[800] text-[#0891B2] tracking-tight">CarePulse</span>
              <div className="text-center mt-2">
                <h1 className="text-[20px] font-[700] text-[#0F172A]">Connexion</h1>
                <p className="text-[14px] text-[#64748B] mt-1">Accédez à votre espace CarePulse</p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-[24px]">
              <div className="space-y-[8px]">
                <label className="text-[13px] font-[600] text-[#475569]">Identifiant ou Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="nom@exemple.fr"
                  className="w-full h-[52px] border border-[#E2E8F0] rounded-[10px] px-[16px] bg-[#F8FAFC] text-[#1E293B] placeholder-[#94A3B8] focus:border-[#0891B2] focus:ring-[3px] focus:ring-[#0891B2]/10 outline-none transition-all"
                  required
                />
              </div>

              <div className="space-y-[8px]">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[13px] font-[600] text-[#475569]">Mot de passe</label>
                  <Link to="#" className="text-[12px] font-[600] text-[#0891B2] hover:underline transition-all">
                    Mot de passe oublié ?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••••••••••"
                    className={`w-full h-[52px] border border-[#E2E8F0] rounded-[10px] px-[16px] text-[#1E293B] placeholder-[#94A3B8] focus:border-[#0891B2] focus:ring-[3px] focus:ring-[#0891B2]/10 outline-none transition-all ${
                      formData.password ? 'bg-[#FFFBEB]' : 'bg-[#F8FAFC]'
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-[16px] top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B] transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={mutation.isPending}
                className="w-full h-[52px] bg-[#0891B2] hover:bg-[#0E7490] rounded-[10px] text-white font-[700] text-[15px] flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed group mt-[8px]"
              >
                {mutation.isPending ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Se connecter
                    <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>

            {/* Signup Link */}
            <div className="mt-8 pt-6 border-t border-[#F1F5F9] text-center">
              <p className="text-[14px] text-[#64748B]">
                Pas encore de compte ?{' '}
                <Link to="/register" className="text-[#0891B2] font-[700] hover:underline">
                  S'inscrire GRATUITEMENT
                </Link>
              </p>
            </div>
          </div>

          {/* Security Footer Section of the card */}
          <div className="bg-[#F8FAFC] border-t border-[#E2E8F0] py-[16px] flex items-center justify-center gap-2">
            <ShieldCheck size={14} className="text-[#94A3B8]" />
            <span className="text-[10px] font-[700] text-[#94A3B8] tracking-widest uppercase">
              Accés sécurisé par cryptage AES-256
            </span>
          </div>
        </div>
      </div>

      {/* Page Footer */}
      <footer className="w-full p-8 flex flex-col sm:flex-row justify-center items-center gap-6 z-20 pointer-events-none mt-auto border-t border-transparent">
        <div className="flex items-center gap-6 pointer-events-auto sm:ml-auto sm:mr-auto">
          <Link to="#" className="text-[13px] text-[#94A3B8] hover:text-[#64748B] transition-colors">Aide</Link>
          <Link to="#" className="text-[13px] text-[#94A3B8] hover:text-[#64748B] transition-colors">Confidentialité</Link>
          <Link to="#" className="text-[13px] text-[#94A3B8] hover:text-[#64748B] transition-colors">Conditions</Link>
        </div>
        
        <div className="flex items-center gap-2 pointer-events-auto sm:absolute sm:right-8">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          <span className="text-[11px] font-[700] text-[#94A3B8] tracking-wider uppercase">System Status: Operational</span>
        </div>
      </footer>
    </div>
  );
};
