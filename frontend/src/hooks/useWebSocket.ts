import { useEffect, useCallback, useState } from 'react';
import SockJS from 'sockjs-client';
import { Client, type Message, type StompSubscription } from '@stomp/stompjs';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';

export const useWebSocket = () => {
  const { token, user } = useAuthStore();
  const { addNotification } = useNotificationStore();
  
  const [connected, setConnected] = useState(false);
  const [client, setClient] = useState<Client | null>(null);

  const onMessageReceived = useCallback((payload: Message) => {
    const notification = JSON.parse(payload.body);
    addNotification(notification);
  }, [addNotification]);

  useEffect(() => {
    if (!token || !user) return;

    const socket = new SockJS('http://localhost:8080/ws');
    const stompClient = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      onConnect: () => {
        setConnected(true);
        // Subscribe to user specific notifications
        stompClient.subscribe(`/user/${user.id}/queue/notifications`, onMessageReceived);
        
        // Subscribe to general topic if needed
        stompClient.subscribe('/topic/global', onMessageReceived);
        
        if (user.role === 'AGENT' || user.role === 'ADMIN') {
          stompClient.subscribe('/topic/tickets', onMessageReceived);
        }
      },
      onDisconnect: () => {
        setConnected(false);
      },
      onStompError: (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
        console.error('Additional details: ' + frame.body);
      },
    });

    stompClient.activate();
    setClient(stompClient);

    return () => {
      stompClient.deactivate();
      setConnected(false);
      setClient(null);
    };
  }, [token, user, onMessageReceived]);

  const subscribe = useCallback((destination: string, callback: (body: string) => void): StompSubscription | null => {
    if (client && connected) {
      return client.subscribe(destination, (message: Message) => {
        callback(message.body);
      });
    }
    return null;
  }, [client, connected]);

  return { connected, subscribe, client };
};
