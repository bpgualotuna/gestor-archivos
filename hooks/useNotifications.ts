import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Notification } from '@/types/notification.types';

export function useNotifications(unreadOnly: boolean = false) {
  return useQuery<Notification[]>({
    queryKey: ['notifications', unreadOnly],
    queryFn: async () => {
      const response = await fetch(`/api/notifications?unreadOnly=${unreadOnly}`);
      if (!response.ok) throw new Error('Error al cargar notificaciones');
      const data = await response.json();
      return data.data;
    },
    refetchInterval: 30000, // Refrescar cada 30 segundos
  });
}

export function useUnreadCount() {
  return useQuery<number>({
    queryKey: ['notifications-unread-count'],
    queryFn: async () => {
      const response = await fetch('/api/notifications/unread-count');
      if (!response.ok) throw new Error('Error al cargar contador');
      const data = await response.json();
      return data.data.count;
    },
    refetchInterval: 30000, // Refrescar cada 30 segundos
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PATCH',
      });
      if (!response.ok) throw new Error('Error al marcar notificación');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
      });
      if (!response.ok) throw new Error('Error al marcar todas las notificaciones');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });
}
