import React from 'react';
import { FileText, ClipboardList, Pill, Activity, MessageSquare } from 'lucide-react';

interface ConsultationFormProps {
  formData: any;
  onChange: (data: any) => void;
}

export const ConsultationForm: React.FC<ConsultationFormProps> = ({ formData, onChange }) => {
  const sections = [
    { key: 'symptomes', label: 'Symptômes', icon: Activity, placeholder: 'Description des symptômes...' },
    { key: 'diagnostic', label: 'Diagnostic', icon: ClipboardList, placeholder: 'Conclusion médicale...' },
    { key: 'traitement', label: 'Traitement', icon: Pill, placeholder: 'Prescription, repos...' },
    { key: 'examens', label: 'Examens', icon: FileText, placeholder: 'Analyses, Radio...' },
    { key: 'notes', label: 'Notes internes', icon: MessageSquare, placeholder: 'Observations privées...' },
  ];

  return (
    <div className="space-y-6">
      {sections.map((section) => (
        <div key={section.key} className="card-premium p-8 group">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 group-focus-within:bg-cyan-50 group-focus-within:text-cyan-600 flex items-center justify-center transition-colors">
               <section.icon size={20} />
            </div>
            <h3 className="font-extrabold text-slate-900 uppercase tracking-[0.15em] text-xs">
              {section.label}
            </h3>
          </div>
          <textarea
            className="w-full text-sm font-medium text-slate-700 leading-relaxed placeholder-slate-300 border-none focus:ring-0 p-0 resize-none min-h-[80px] bg-transparent"
            placeholder={section.placeholder}
            value={formData[section.key] || ''}
            onChange={(e) => onChange({ ...formData, [section.key]: e.target.value })}
          />
        </div>
      ))}
    </div>
  );
};
