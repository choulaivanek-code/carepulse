import { useEffect, useCallback, useState, useRef } from 'react';
import SockJS from 'sockjs-client';
import { Client, type Message } from '@stomp/stompjs';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import { notificationApi } from '../api/notificationApi';

const POLLING_INTERVAL = 30000; // 30 seconds fallback

export const useWebSocket = () => {
  const { token, user } = useAuthStore();
  const { addNotification, setNotifications } = useNotificationStore();
  
  const [connected, setConnected] = useState(false);
  const clientRef = useRef<Client | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const getToastStyle = (type: string) => {
    switch (type) {
      case 'TICKET_CREE':
        return { icon: '🎫', style: { border: '1px solid #3b82f6', color: '#1d4ed8' } };
      case 'NOUVEAU_TICKET':
        return { icon: '🎫', style: { border: '1px solid #3b82f6', color: '#1d4ed8' } };
      case 'APPEL_PATIENT':
        return { icon: '📢', style: { border: '1px solid #f97316', color: '#c2410c', fontWeight: 'bold' } };
      case 'PATIENT_PRET':
        return { icon: '👤', style: { border: '1px solid #14b8a6', color: '#0f766e' } };
      case 'NOUVEAU_MESSAGE':
        return { icon: '💬', style: { border: '1px solid #8b5cf6', color: '#6d28d9' } };
      case 'CONSULTATION_DEMARREE':
        return { icon: '▶️', style: { border: '1px solid #22c55e', color: '#15803d' } };
      case 'CONSULTATION_TERMINEE':
        return { icon: '✅', style: { border: '1px solid #166534', color: '#064e3b' } };
      case 'ABSENCE_SIGNALEE':
        return { icon: '⚠️', style: { border: '1px solid #f97316', color: '#ea580c' } };
      case 'TICKET_ANNULE':
        return { icon: '🗑️', style: { border: '1px solid #ef4444', color: '#b91c1c' } };
      default:
        return { icon: '🔔', style: {} };
    }
  };

  const playNotificationSound = (type: string) => {
    if (type === 'APPEL_PATIENT') {
      try {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.play().catch(e => console.log('Audio play failed:', e));
      } catch (e) {
        console.error('Audio error:', e);
      }
    }
  };

  const handleNewNotification = useCallback((notification: any) => {
    addNotification(notification);
    const { icon, style } = getToastStyle(notification.type);
    toast(notification.message || notification.contenu, { icon, style });
    playNotificationSound(notification.type);
  }, [addNotification]);

  const startPolling = useCallback(() => {
    if (pollingRef.current) return;
    
    console.log('Starting fallback polling...');
    const poll = async () => {
      try {
        const response = await notificationApi.getNotifications();
        if (response.data) {
          // Note: In a real scenario, we'd need to diff or handle duplicates
          // For now, we just refresh the list
          setNotifications(response.data);
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    };

    poll(); // Initial call
    pollingRef.current = setInterval(poll, POLLING_INTERVAL);
  }, [setNotifications]);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!token || !user) {
      if (clientRef.current) {
        clientRef.current.deactivate();
        clientRef.current = null;
        setConnected(false);
      }
      stopPolling();
      return;
    }

    const client = new Client({
      webSocketFactory: () => new SockJS(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/ws`),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      onConnect: () => {
        console.log('WebSocket connected');
        setConnected(true);
        stopPolling();

        // Subscribe to personal notifications
        client.subscribe(`/user/${user.id}/queue/notifications`, (message: Message) => {
          handleNewNotification(JSON.parse(message.body));
        });

        // Optional: subscribe to other relevant channels based on role
        if (user.role === 'AGENT' || user.role === 'ADMIN') {
          client.subscribe('/topic/tickets', (message: Message) => {
             // Handle generic ticket updates if needed
          });
        }
      },
      onDisconnect: () => {
        console.log('WebSocket disconnected');
        setConnected(false);
        startPolling();
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame);
        setConnected(false);
        startPolling();
      },
      reconnectDelay: 5000,
    });

    client.activate();
    clientRef.current = client;

    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
        clientRef.current = null;
      }
      stopPolling();
    };
  }, [token, user, handleNewNotification, startPolling, stopPolling]);

  return { connected };
};
