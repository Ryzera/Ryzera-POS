'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/auth.store';
import { toast } from 'react-hot-toast';

interface SyncSocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  activeNodesCount: number;
}

const SyncSocketContext = createContext<SyncSocketContextType>({
  socket: null,
  isConnected: false,
  activeNodesCount: 0,
});

export const useSyncSocket = () => useContext(SyncSocketContext);

export function SyncSocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [activeNodesCount, setActiveNodesCount] = useState(0);
  const { user } = useAuthStore();

  useEffect(() => {
    // Only connect if user is logged in
    if (!user) return;

    // The backend WebSocket runs on the /sync namespace
    const socketInstance = io('http://localhost:3000/sync', {
      transports: ['websocket'],
      autoConnect: true,
    });

    socketInstance.on('connect', () => {
      setIsConnected(true);
      // Register node (can add custom event in gateway later)
      socketInstance.emit('register_node', {
        branchId: String(user.branch_id || 'ADMIN'),
        deviceName: navigator.userAgent.substring(0, 20),
      });
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
    });

    socketInstance.on('active_nodes_count', (data: { count: number }) => {
      setActiveNodesCount(data.count);
    });

    socketInstance.on('new-notification', (data: { title: string; message: string; type: string }) => {
      toast(
        (t) => (
          <div className="flex flex-col gap-1">
            <span className="font-bold text-slate-900">{data.title}</span>
            <span className="text-sm text-slate-500">{data.message}</span>
          </div>
        ),
        { icon: data.type === 'WARNING' ? '⚠️' : data.type === 'CRITICAL' ? '🚨' : '📣', duration: 10000 }
      );
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [user]);

  return (
    <SyncSocketContext.Provider value={{ socket, isConnected, activeNodesCount }}>
      {children}
    </SyncSocketContext.Provider>
  );
}
