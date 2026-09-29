import { Router, Response } from 'express';
import { db, ReviewDoc } from '../db/inMemoryStore.js';
import { protect, AuthenticatedRequest } from '../middleware/auth.js';

export const reviewRouter = Router();

// POST /api/reviews
reviewRouter.post('/', protect, (req: AuthenticatedRequest, res: Response): void => {
  const { bookingId, rating, comment } = req.body;

  if (!bookingId || !rating || !comment) {
    res.status(400).json({ success: false, message: 'Booking ID, rating, and comment are required.' });
    return;
  }

  const booking = db.bookings.find(b => b._id === bookingId);
  if (!booking) {
    res.status(404).json({ success: false, message: 'Booking not found.' });
    return;
  }

  // Enforce customer ownership
  if (booking.customerId !== req.user!._id) {
    res.status(403).json({ success: false, message: 'You can only review your own bookings.' });
    return;
  }

  // Enforce booking status === COMPLETED
  if (booking.status !== 'COMPLETED') {
    res.status(400).json({
      success: false,
      message: 'Reviews can only be submitted after the service has been marked COMPLETED.',
      code: 'BOOKING_NOT_COMPLETED',
    });
    return;
  }

  // Prevent duplicate reviews
  const existingReview = db.reviews.find(r => r.bookingId === bookingId);
  if (existingReview) {
    res.status(409).json({
      success: false,
      message: 'You have already submitted a review for this completed booking.',
      code: 'DUPLICATE_REVIEW',
    });
    return;
  }

  const newReview: ReviewDoc = {
    _id: `rev_${Date.now()}`,
    bookingId,
    customerId: req.user!._id,
    customerName: req.user!.name,
    customerAvatar: req.user!.avatar,
    providerId: booking.providerId,
    rating: Number(rating),
    comment,
    createdAt: new Date().toISOString(),
  };

  db.reviews.unshift(newReview);

  // Recalculate provider rating
  const providerReviews = db.reviews.filter(r => r.providerId === booking.providerId);
  const avgRating = providerReviews.reduce((sum, r) => sum + r.rating, 0) / providerReviews.length;
  const provider = db.providers.find(p => p._id === booking.providerId);
  if (provider) {
    provider.rating = parseFloat(avgRating.toFixed(2));
    provider.reviewCount = providerReviews.length;
  }

  // Notify Provider
  db.notifications.unshift({
    _id: `notif_${Date.now()}`,
    userId: provider ? provider.userId : '',
    type: 'NEW_REVIEW',
    title: `New ${rating}★ Review Received!`,
    message: `${req.user!.name} left a review: "${comment.substring(0, 60)}..."`,
    read: false,
    metadata: { reviewId: newReview._id },
    createdAt: new Date().toISOString(),
  });

  res.status(201).json({
    success: true,
    message: 'Thank you! Your review has been published.',
    data: newReview,
  });
});

// GET /api/reviews/provider/:providerId
reviewRouter.get('/provider/:providerId', (req, res): void => {
  const reviews = db.reviews.filter(r => r.providerId === req.params.providerId);
  res.json({
    success: true,
    count: reviews.length,
    data: reviews,
  });
});
