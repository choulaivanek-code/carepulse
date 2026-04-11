import React, { useState } from 'react';
import { Bell, CheckCheck, Loader2, Clock, Trash2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useNotificationStore } from '../../store/notificationStore';
import { notificationApi } from '../../api/notificationApi';

export const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { notifications, unreadCount, setNotifications, markAsRead, markAllAsRead } = useNotificationStore();

  const { data: notifData, isLoading, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationApi.getNotifications(),
    enabled: !!isOpen, // Fetch when opened
  });

  React.useEffect(() => {
    if (notifData?.data) {
      setNotifications(notifData.data);
    }
  }, [notifData, setNotifications]);

  const handleMarkAll = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await notificationApi.markAllAsRead();
      markAllAsRead();
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = async (n: any) => {
    try {
      if (!n.lue) {
        await notificationApi.markAsRead(n.id);
        markAsRead(n.id);
      }
      setIsOpen(false);

      // Redirection logic based on type or ticketId
      if (n.ticketId) {
        navigate(`/patient/ticket/${n.ticketId}`);
      } else if (n.type === 'NOUVEAU_MESSAGE') {
        navigate('/patient/messagerie');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInSec = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSec < 60) return `il y a ${diffInSec} sec`;
    const diffInMin = Math.floor(diffInSec / 60);
    if (diffInMin < 60) return `il y a ${diffInMin} min`;
    const diffInHrs = Math.floor(diffInMin / 60);
    if (diffInHrs < 24) return `il y a ${diffInHrs} h`;
    const diffInDays = Math.floor(diffInHrs / 24);
    return `il y a ${diffInDays} j`;
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-all group flex items-center justify-center"
        aria-label="Notifications"
      >
        <Bell className="w-6 h-6 text-gray-700 group-hover:animate-swing" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-5 h-5 px-1 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-white text-[10px] font-black animate-pulse-subtle shadow-sm">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold uppercase tracking-widest text-slate-900">Notifications</h3>
                {isLoading && <Loader2 size={12} className="animate-spin text-slate-400" />}
              </div>
              {unreadCount > 0 && (
                <button 
                  onClick={handleMarkAll}
                  className="text-cyan-600 text-[10px] font-black uppercase tracking-widest hover:text-cyan-700 transition-colors flex items-center gap-1"
                >
                  <CheckCheck size={12} />
                  Tout lire
                </button>
              )}
            </div>
            
            <div className="max-h-96 overflow-y-auto scrollbar-hide">
              {notifications.length === 0 ? (
                <div className="p-10 text-center">
                  <Bell size={40} className="mx-auto mb-3 text-slate-100" />
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Aucune alerte</p>
                </div>
              ) : (
                notifications.slice(0, 20).map((n) => (
                  <div 
                    key={n.id} 
                    onClick={() => handleNotificationClick(n)}
                    className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-all cursor-pointer relative group/item ${!n.lue ? 'bg-cyan-50/20' : ''}`}
                  >
                    {!n.lue && (
                      <div className="absolute top-5 left-1.5 w-1.5 h-1.5 bg-cyan-600 rounded-full shadow-[0_0_8px_rgba(8,145,178,0.5)]" />
                    )}
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1">
                        <h4 className="text-xs font-extrabold text-slate-800 leading-tight">{n.titre}</h4>
                        <p className="text-[11px] text-slate-500 mt-1 leading-snug line-clamp-2 font-medium">{n.message || n.contenu}</p>
                        <div className="flex items-center gap-1.5 mt-2.5">
                          <Clock size={10} className="text-slate-300" />
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                            {formatRelativeTime(n.dateCreation)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {notifications.length > 0 && (
              <div className="p-3 bg-slate-50 text-center border-t border-slate-100">
                <button 
                  className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Fermer
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
