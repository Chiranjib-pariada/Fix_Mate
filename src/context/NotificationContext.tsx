import React, { createContext, useContext, useState, useEffect } from 'react';
import { NotificationItem } from '../types';
import { apiRequest } from '../lib/api';
import { useAuth } from './AuthContext';
import { getSocket } from '../lib/socket';

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  toastMessage: { title: string; message: string } | null;
  clearToast: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<{ title: string; message: string } | null>(null);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await apiRequest<NotificationItem[]>('/notifications');
      setNotifications(res.data);
      setUnreadCount(res.unreadCount || 0);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();

    if (user) {
      const socket = getSocket(user._id);

      socket.on('notification_received', (notif: NotificationItem) => {
        setNotifications(prev => [notif, ...prev]);
        setUnreadCount(prev => prev + 1);
        setToastMessage({ title: notif.title, message: notif.message });
      });

      socket.on('message_received', (msg: any) => {
        setToastMessage({
          title: 'New Chat Message',
          message: msg.text.length > 50 ? `${msg.text.substring(0, 50)}...` : msg.text,
        });
      });

      return () => {
        socket.off('notification_received');
        socket.off('message_received');
      };
    }
  }, [user]);

  const markAsRead = async (id: string) => {
    await apiRequest(`/notifications/${id}/read`, { method: 'PATCH' });
    setNotifications(prev =>
      prev.map(n => (n._id === id ? { ...n, read: true } : n))
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    await apiRequest('/notifications/read-all', { method: 'PATCH' });
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const clearToast = () => setToastMessage(null);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        toastMessage,
        clearToast,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
