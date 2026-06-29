import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const NOTIFICATION_ICONS = {
  success: '✅',
  error: '❌',
  info: '📦',
  warning: '⚠️',
};

export function SocketProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const socketRef = useRef(null);
  const [unreadChat, setUnreadChat] = useState(0);

  // Fetch initial unread count
  const refreshUnreadCount = useCallback(async () => {
    if (!isAuthenticated) {
      setUnreadChat(0);
      return;
    }
    try {
      const { chatService } = await import('../services');
      const res = await chatService.getUnreadCount();
      setUnreadChat(res.data?.count || 0);
    } catch {
      // silent
    }
  }, [isAuthenticated]);

  useEffect(() => {
    let active = true;
    let socketInstance = null;

    if (!isAuthenticated || !user?.id) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setUnreadChat(0);
      return;
    }

    const connectSocket = async () => {
      const { io } = await import('socket.io-client');

      if (!active) return;

      const socket = io(SOCKET_URL, {
        transports: ['polling', 'websocket'],
        reconnectionAttempts: 3,
        reconnectionDelay: 2000,
      });

      socketInstance = socket;
      socketRef.current = socket;

      socket.on('connect', () => {
        socket.emit('join', user.id);
      });

      socket.on('notification', (payload) => {
        const { title, message, type = 'info' } = payload;
        const icon = NOTIFICATION_ICONS[type] || '🔔';
        const toastFn = type === 'error' ? toast.error : type === 'success' ? toast.success : toast;

        toastFn(
          <div>
            <p className="font-semibold text-sm">{icon} {title}</p>
            <p className="text-xs text-gray-500 mt-0.5">{message}</p>
          </div>,
          { duration: 5000, id: `notif-${Date.now()}` }
        );

        if (title === 'New Message') {
          setUnreadChat((prev) => prev + 1);
        }
      });

      socket.on('connect_error', () => {
        // Silent — notifications are non-critical
      });

      refreshUnreadCount();
    };

    connectSocket();

    return () => {
      active = false;
      socketInstance?.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, user?.id, refreshUnreadCount]);

  const joinChat = useCallback((conversationId) => {
    socketRef.current?.emit('chat:join', conversationId);
  }, []);

  const leaveChat = useCallback((conversationId) => {
    socketRef.current?.emit('chat:leave', conversationId);
  }, []);

  const emitTyping = useCallback((conversationId) => {
    socketRef.current?.emit('chat:typing', {
      conversationId,
      userId: user?.id,
      userName: user?.name,
    });
  }, [user]);

  const emitStopTyping = useCallback((conversationId) => {
    socketRef.current?.emit('chat:stop-typing', {
      conversationId,
      userId: user?.id,
    });
  }, [user]);

  return (
    <SocketContext.Provider value={{
      socket: socketRef.current,
      unreadChat,
      setUnreadChat,
      refreshUnreadCount,
      joinChat,
      leaveChat,
      emitTyping,
      emitStopTyping,
    }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
