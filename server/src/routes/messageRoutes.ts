import { Router, Response } from 'express';
import { db, MessageDoc } from '../db/inMemoryStore.js';
import { protect, AuthenticatedRequest } from '../middleware/auth.js';

export const messageRouter = Router();

// GET /api/messages/:conversationId - Get message history
messageRouter.get('/:conversationId', protect, (req: AuthenticatedRequest, res: Response): void => {
  const { conversationId } = req.params;
  const history = db.messages.filter(m => m.conversationId === conversationId);

  // Mark messages sent to this user as read
  history.forEach(m => {
    if (m.recipientId === req.user!._id) {
      m.read = true;
    }
  });

  res.json({
    success: true,
    data: history,
  });
});

// POST /api/messages - Send message via REST (fallback or complementary to socket)
messageRouter.post('/', protect, (req: AuthenticatedRequest, res: Response): void => {
  const { conversationId, recipientId, text } = req.body;

  if (!conversationId || !recipientId || !text) {
    res.status(400).json({ success: false, message: 'Missing message parameters.' });
    return;
  }

  const newMessage: MessageDoc = {
    _id: `msg_${Date.now()}`,
    conversationId,
    senderId: req.user!._id,
    senderRole: req.user!.role,
    recipientId,
    text,
    read: false,
    createdAt: new Date().toISOString(),
  };

  db.messages.push(newMessage);

  res.status(201).json({
    success: true,
    data: newMessage,
  });
});
