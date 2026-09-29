import { Router, Response } from 'express';
import { db } from '../db/inMemoryStore.js';
import { protect, AuthenticatedRequest } from '../middleware/auth.js';

export const notificationRouter = Router();

// GET /api/notifications
notificationRouter.get('/', protect, (req: AuthenticatedRequest, res: Response): void => {
  const notifs = db.notifications.filter(n => n.userId === req.user!._id);
  const unreadCount = notifs.filter(n => !n.read).length;

  res.json({
    success: true,
    unreadCount,
    data: notifs,
  });
});

// PATCH /api/notifications/:id/read
notificationRouter.patch('/:id/read', protect, (req: AuthenticatedRequest, res: Response): void => {
  const notif = db.notifications.find(n => n._id === req.params.id && n.userId === req.user!._id);
  if (notif) {
    notif.read = true;
  }
  res.json({ success: true, message: 'Notification marked as read' });
});

// PATCH /api/notifications/read-all
notificationRouter.patch('/read-all', protect, (req: AuthenticatedRequest, res: Response): void => {
  db.notifications.forEach(n => {
    if (n.userId === req.user!._id) {
      n.read = true;
    }
  });
  res.json({ success: true, message: 'All notifications marked as read' });
});
