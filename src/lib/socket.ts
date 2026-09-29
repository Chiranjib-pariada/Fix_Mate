import { io, Socket } from 'socket.io-client';

let socketInstance: Socket | null = null;

export function getSocket(userId?: string): Socket {
  if (!socketInstance) {
    socketInstance = io(window.location.origin, {
      query: userId ? { userId } : {},
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    socketInstance.on('connect', () => {
      console.log('⚡ FixMate Socket connected:', socketInstance?.id);
    });

    socketInstance.on('disconnect', () => {
      console.log('🔌 FixMate Socket disconnected');
    });
  }

  return socketInstance;
}
