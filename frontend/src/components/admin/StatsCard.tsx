import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  color: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendUp, 
  color 
}) => {
  return (
    <div className="card-premium p-8 group hover:border-cyan-200 transition-all duration-300">
      <div className="flex justify-between items-start mb-6">
        <div className={`w-12 h-12 rounded-2xl bg-${color}-50 text-${color}-600 flex items-center justify-center transition-transform group-hover:scale-110`}>
          <Icon size={24} />
        </div>
        {trend && (
          <div className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
            trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
          }`}>
            {trend}
          </div>
        )}
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{title}</p>
      <p className="text-3xl font-black text-slate-900 tracking-tighter italic">{value}</p>
    </div>
  );
};
