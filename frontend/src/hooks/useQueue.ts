import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ticketApi } from '../api/ticketApi';
import { useWebSocket } from './useWebSocket';
import type { Ticket } from '../types';

export const useQueue = (fileId?: number) => {
  const { subscribe, connected } = useWebSocket();
  const [realtimeTickets, setRealtimeTickets] = useState<Ticket[] | null>(null);

  const { data, refetch, isLoading } = useQuery({
    queryKey: ['queue', fileId],
    queryFn: () =>
      fileId ? ticketApi.getTicketsByFile(fileId) : ticketApi.getTousLesTicketsActifs(),
    refetchInterval: 30000,
  });

  useEffect(() => {
    if (!connected || !fileId) return;

    const sub = subscribe(`/topic/queue/${fileId}`, (body: string) => {
      try {
        const tickets = JSON.parse(body) as Ticket[];
        setRealtimeTickets(tickets);
      } catch {
        refetch();
      }
    });

    return () => {
      sub?.unsubscribe();
    };
  }, [connected, fileId, subscribe, refetch]);

  const tickets = realtimeTickets ?? data?.data ?? [];

  return {
    tickets,
    isLoading,
    refetch,
    connected,
  };
};
