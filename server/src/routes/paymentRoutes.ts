import { Router, Response } from 'express';
import { db, PaymentDoc } from '../db/inMemoryStore.js';
import { protect, AuthenticatedRequest } from '../middleware/auth.js';

export const paymentRouter = Router();

// POST /api/payments/create-order
paymentRouter.post('/create-order', protect, (req: AuthenticatedRequest, res: Response): void => {
  const { amount, serviceId, providerId } = req.body;

  const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  res.json({
    success: true,
    data: {
      orderId,
      amount: amount || 49,
      currency: 'USD',
      keyId: 'rzp_test_mock_fixmate',
      notes: { serviceId, providerId },
    },
  });
});

// POST /api/payments/verify
paymentRouter.post('/verify', protect, (req: AuthenticatedRequest, res: Response): void => {
  const { orderId, paymentId, bookingId, amount, providerId } = req.body;

  if (!orderId || !paymentId) {
    res.status(400).json({ success: false, message: 'Invalid payment parameters' });
    return;
  }

  // Server-side payment record
  const newPayment: PaymentDoc = {
    _id: `pay_${Date.now()}`,
    bookingId: bookingId || `bk_${Date.now()}`,
    customerId: req.user!._id,
    providerId: providerId || '',
    amount: Number(amount) || 49,
    currency: 'USD',
    orderId,
    paymentId,
    status: 'PAID',
    method: 'CARD',
    createdAt: new Date().toISOString(),
  };

  db.payments.unshift(newPayment);

  // If associated booking exists, update payment status
  if (bookingId) {
    const bk = db.bookings.find(b => b._id === bookingId);
    if (bk) {
      bk.paymentStatus = 'PAID';
      bk.paymentId = paymentId;
    }
  }

  res.json({
    success: true,
    message: 'Payment verified and confirmed successfully!',
    data: newPayment,
  });
});
