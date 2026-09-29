import { Router } from 'express';
import { authRouter } from './authRoutes.js';
import { userRouter } from './userRoutes.js';
import { providerRouter } from './providerRoutes.js';
import { serviceRouter, categoryRouter } from './serviceRoutes.js';
import { bookingRouter } from './bookingRoutes.js';
import { paymentRouter } from './paymentRoutes.js';
import { reviewRouter } from './reviewRoutes.js';
import { messageRouter } from './messageRoutes.js';
import { notificationRouter } from './notificationRoutes.js';
import { adminRouter } from './adminRoutes.js';
import { aiRouter } from './aiRoutes.js';

export const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/users', userRouter);
apiRouter.use('/providers', providerRouter);
apiRouter.use('/services', serviceRouter);
apiRouter.use('/categories', categoryRouter);
apiRouter.use('/bookings', bookingRouter);
apiRouter.use('/payments', paymentRouter);
apiRouter.use('/reviews', reviewRouter);
apiRouter.use('/messages', messageRouter);
apiRouter.use('/notifications', notificationRouter);
apiRouter.use('/admin', adminRouter);
apiRouter.use('/ai', aiRouter);

apiRouter.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'FixMate API',
    version: '1.0.0',
  });
});
