import { Server as SocketIOServer, Socket } from 'socket.io';
import { db } from '../db/inMemoryStore.js';

export function initializeSockets(io: SocketIOServer) {
  io.on('connection', (socket: Socket) => {
    const userId = socket.handshake.query.userId as string;

    if (userId) {
      socket.join(`user_${userId}`);
    }

    // Join conversation room
    socket.on('join_conversation', (conversationId: string) => {
      socket.join(`conv_${conversationId}`);
    });

    socket.on('leave_conversation', (conversationId: string) => {
      socket.leave(`conv_${conversationId}`);
    });

    // Chat message event
    socket.on('send_message', (payload: {
      conversationId: string;
      senderId: string;
      senderRole: 'CUSTOMER' | 'PROVIDER' | 'ADMIN';
      recipientId: string;
      text: string;
    }) => {
      const newMessage = {
        _id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        conversationId: payload.conversationId,
        senderId: payload.senderId,
        senderRole: payload.senderRole,
        recipientId: payload.recipientId,
        text: payload.text,
        read: false,
        createdAt: new Date().toISOString(),
      };

      db.messages.push(newMessage);

      // Emit to conversation room
      io.to(`conv_${payload.conversationId}`).emit('new_message', newMessage);

      // Also emit direct notification to recipient
      io.to(`user_${payload.recipientId}`).emit('message_received', newMessage);
    });

    // Typing indicators
    socket.on('typing', (data: { conversationId: string; userName: string }) => {
      socket.to(`conv_${data.conversationId}`).emit('user_typing', data);
    });

    socket.on('stop_typing', (data: { conversationId: string }) => {
      socket.to(`conv_${data.conversationId}`).emit('user_stopped_typing', data);
    });

    socket.on('disconnect', () => {
      // Clean disconnect
    });
  });
}
