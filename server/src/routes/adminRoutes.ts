import { Router, Response } from 'express';
import { db } from '../db/inMemoryStore.js';
import { protect, authorize, AuthenticatedRequest } from '../middleware/auth.js';

export const adminRouter = Router();

// Protect all admin routes with ADMIN role check
adminRouter.use(protect);
adminRouter.use(authorize('ADMIN'));

// GET /api/admin/metrics - Analytics KPIs and trends
adminRouter.get('/metrics', (req: AuthenticatedRequest, res: Response): void => {
  const totalCustomers = db.users.filter(u => u.role === 'CUSTOMER').length;
  const totalProviders = db.providers.length;
  const verifiedProviders = db.providers.filter(p => p.verificationStatus === 'APPROVED').length;
  const pendingVerifications = db.providers.filter(p => p.verificationStatus === 'PENDING').length;
  const totalBookings = db.bookings.length;
  const completedBookings = db.bookings.filter(b => b.status === 'COMPLETED').length;
  const activeBookings = db.bookings.filter(b => ['CONFIRMED', 'PROVIDER_ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS'].includes(b.status)).length;
  const totalRevenue = db.bookings.filter(b => b.paymentStatus === 'PAID').reduce((sum, b) => sum + b.amount, 0);

  // Category breakdown
  const categoryStats = db.categories.map(cat => {
    const bookingCount = db.bookings.filter(b => b.categorySlug === cat.slug).length;
    return {
      name: cat.name,
      bookings: bookingCount,
      revenue: bookingCount * cat.startingPrice,
    };
  });

  // Recent activity
  const recentBookings = db.bookings.slice(0, 5);

  res.json({
    success: true,
    data: {
      stats: {
        totalCustomers,
        totalProviders,
        verifiedProviders,
        pendingVerifications,
        totalBookings,
        completedBookings,
        activeBookings,
        totalRevenue,
      },
      categoryStats,
      recentBookings,
    },
  });
});

// GET /api/admin/providers - All providers with verification status
adminRouter.get('/providers', (req: AuthenticatedRequest, res: Response): void => {
  res.json({
    success: true,
    count: db.providers.length,
    data: db.providers,
  });
});

// PATCH /api/admin/providers/:id/verify - Approve, Reject, or Suspend
adminRouter.patch('/providers/:id/verify', (req: AuthenticatedRequest, res: Response): void => {
  const { status } = req.body; // 'APPROVED' | 'REJECTED' | 'SUSPENDED'
  const provider = db.providers.find(p => p._id === req.params.id);

  if (!provider) {
    res.status(404).json({ success: false, message: 'Provider not found' });
    return;
  }

  if (!['APPROVED', 'REJECTED', 'SUSPENDED', 'PENDING'].includes(status)) {
    res.status(400).json({ success: false, message: 'Invalid verification status' });
    return;
  }

  provider.verificationStatus = status;
  provider.isVerified = status === 'APPROVED';

  // Also update corresponding user isVerified flag
  const user = db.users.find(u => u._id === provider.userId);
  if (user) {
    user.isVerified = status === 'APPROVED';
  }

  res.json({
    success: true,
    message: `Provider status updated to ${status}`,
    data: provider,
  });
});

// GET /api/admin/users
adminRouter.get('/users', (req: AuthenticatedRequest, res: Response): void => {
  const safeUsers = db.users.map(({ password, ...rest }) => rest);
  res.json({
    success: true,
    count: safeUsers.length,
    data: safeUsers,
  });
});
