import { createContext, useContext, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
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

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      // Disconnect if user logs out
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    // Create socket connection
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      // Join personal notification room
      socket.emit('join', user.id);
    });

    // Listen for notifications from server
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
    });

    socket.on('connect_error', () => {
      // Silent — notifications are non-critical
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, user?.id]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
