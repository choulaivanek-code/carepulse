import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { notificationApi } from '../api/notificationApi';
import { useNotificationStore } from '../store/notificationStore';
import { useAuthStore } from '../store/authStore';

export const useNotifications = () => {
  const { isAuthenticated } = useAuthStore();
  const { setNotifications } = useNotificationStore();

  const { data, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationApi.getNotifications(),
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (data?.data?.data) {
      setNotifications(data.data.data);
    }
  }, [data, setNotifications]);

  return { notifications: data?.data?.data ?? [], refetch };
};
