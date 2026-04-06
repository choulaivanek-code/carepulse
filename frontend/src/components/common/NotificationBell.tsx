import React, { useState } from 'react';
import { Bell, CheckCheck, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useNotificationStore } from '../../store/notificationStore';
import { notificationApi } from '../../api/notificationApi';

export const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, setNotifications, markAsRead, markAllAsRead } = useNotificationStore();

  const { data: notifData, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationApi.getNotifications(),
    refetchInterval: 30000,
  });

  React.useEffect(() => {
    if (notifData?.data?.data) {
      setNotifications(notifData.data.data);
    }
  }, [notifData, setNotifications]);

  const handleMarkAll = async () => {
    try {
      await notificationApi.markAllAsRead();
      markAllAsRead();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRead = async (id: number) => {
    try {
      await notificationApi.markAsRead(id);
      markAsRead(id);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-all relative"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-white text-[10px] font-black">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-fade-in">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold uppercase tracking-widest text-slate-900">Notifications</h3>
                {isLoading && <Loader2 size={12} className="animate-spin text-slate-400" />}
              </div>
              <button 
                onClick={handleMarkAll}
                className="text-cyan-600 text-[10px] font-black uppercase tracking-widest hover:underline flex items-center gap-1"
              >
                <CheckCheck size={12} />
                Tout lire
              </button>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-10 text-center">
                  <Bell size={40} className="mx-auto mb-3 text-slate-200" />
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Aucune notification</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div 
                    key={n.id} 
                    onClick={() => handleRead(n.id)}
                    className={`p-5 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer relative ${!n.lue ? 'bg-cyan-50/30' : ''}`}
                  >
                    {!n.lue && (
                      <div className="absolute top-6 left-2 w-1.5 h-1.5 bg-cyan-600 rounded-full" />
                    )}
                    <h4 className="text-sm font-bold text-slate-900">{n.titre}</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{n.contenu}</p>
                    <span className="text-[9px] font-bold text-slate-400 mt-2 block uppercase tracking-tighter">
                      {new Date(n.dateCreation).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
