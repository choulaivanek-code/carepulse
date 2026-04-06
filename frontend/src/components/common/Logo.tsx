import React from 'react';

interface LogoProps {
  variant?: 'light' | 'dark' | 'cyan';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ 
  variant = 'light', 
  size = 'md',
  showText = true 
}) => {
  const sizes = {
    sm: { box: 'w-[28px] h-[28px]', icon: 16, text: 'text-base' },
    md: { box: 'w-[36px] h-[36px]', icon: 20, text: 'text-xl' },
    lg: { box: 'w-[48px] h-[48px]', icon: 28, text: 'text-2xl' },
    xl: { box: 'w-[64px] h-[64px]', icon: 40, text: 'text-3xl' }
  };

  const currentSize = sizes[size];
  
  const getColors = () => {
    if (variant === 'cyan') return { box: 'bg-transparent', stroke: '#0891B2', text: 'text-[#0891B2]' };
    if (variant === 'dark') return { box: 'bg-cyan-600', stroke: 'white', text: 'text-white' };
    return { box: 'bg-cyan-600', stroke: 'white', text: 'text-slate-900' };
  };

  const colors = getColors();

  return (
    <div className="flex items-center gap-3">
      <div 
        className={`${currentSize.box} ${colors.box} rounded-[10px] flex items-center justify-center ${variant !== 'cyan' ? 'shadow-sm' : ''}`}
      >
        <svg 
          width={currentSize.icon} 
          height={currentSize.icon} 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke={colors.stroke} 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      </div>
      {showText && (
        <span className={`${currentSize.text} font-extrabold tracking-tight ${colors.text}`}>
          CarePulse
        </span>
      )}
    </div>
  );
};
