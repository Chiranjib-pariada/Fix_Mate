import { Router, Response } from 'express';
import { db, BookingDoc } from '../db/inMemoryStore.js';
import { protect, AuthenticatedRequest } from '../middleware/auth.js';

export const bookingRouter = Router();

// Valid state machine transitions
const VALID_TRANSITIONS: Record<string, string[]> = {
  PENDING: ['CONFIRMED', 'REJECTED', 'CANCELLED'],
  CONFIRMED: ['PROVIDER_ON_THE_WAY', 'CANCELLED'],
  PROVIDER_ON_THE_WAY: ['ARRIVED', 'CANCELLED'],
  ARRIVED: ['IN_PROGRESS'],
  IN_PROGRESS: ['COMPLETED'],
  COMPLETED: [],
  CANCELLED: [],
  REJECTED: [],
};

// POST /api/bookings - Create new booking
bookingRouter.post('/', protect, (req: AuthenticatedRequest, res: Response): void => {
  const {
    providerId,
    serviceId,
    bookingDate,
    timeSlot,
    address,
    specialInstructions,
    amount,
  } = req.body;

  if (!providerId || !serviceId || !bookingDate || !timeSlot || !address) {
    res.status(400).json({
      success: false,
      message: 'Provider, service, date, time slot, and address are required.',
    });
    return;
  }

  const provider = db.providers.find(p => p._id === providerId);
  if (!provider) {
    res.status(404).json({ success: false, message: 'Service provider not found.' });
    return;
  }

  const service = db.services.find(s => s._id === serviceId);
  if (!service) {
    res.status(404).json({ success: false, message: 'Service not found.' });
    return;
  }

  // Double Booking Prevention: Check if slot is already occupied
  const existingSlot = db.bookings.find(
    b => b.providerId === providerId &&
         b.bookingDate === bookingDate &&
         b.timeSlot === timeSlot &&
         !['CANCELLED', 'REJECTED'].includes(b.status)
  );

  if (existingSlot) {
    res.status(409).json({
      success: false,
      message: 'This time slot is no longer available. Please select another slot.',
      code: 'SLOT_UNAVAILABLE',
    });
    return;
  }

  const bookingNumber = `FM-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const now = new Date().toISOString();

  const newBooking: BookingDoc = {
    _id: `bk_${Date.now()}`,
    bookingNumber,
    customerId: req.user!._id,
    customerName: req.user!.name,
    customerPhone: req.user!.phone,
    providerId: provider._id,
    providerName: provider.name,
    serviceId: service._id,
    serviceName: service.name,
    categorySlug: service.categorySlug,
    status: 'CONFIRMED', // Instant confirm for demo UX, or PENDING
    bookingDate,
    timeSlot,
    address,
    specialInstructions: specialInstructions || '',
    amount: amount || service.basePrice,
    paymentStatus: 'PAID', // Mock verified payment
    paymentId: `pay_${Date.now()}`,
    createdAt: now,
    updatedAt: now,
    timeline: [
      {
        status: 'PENDING',
        timestamp: now,
        note: 'Booking requested by customer',
      },
      {
        status: 'CONFIRMED',
        timestamp: now,
        note: `${provider.name} confirmed the booking slot`,
      },
    ],
  };

  db.bookings.unshift(newBooking);

  // Send Notification to Provider
  db.notifications.unshift({
    _id: `notif_${Date.now()}_prov`,
    userId: provider.userId,
    type: 'NEW_BOOKING_REQUEST',
    title: 'New Service Booking',
    message: `${req.user!.name} booked ${service.name} for ${bookingDate} at ${timeSlot}.`,
    read: false,
    metadata: { bookingId: newBooking._id },
    createdAt: now,
  });

  // Send Notification to Customer
  db.notifications.unshift({
    _id: `notif_${Date.now()}_cust`,
    userId: req.user!._id,
    type: 'BOOKING_CONFIRMED',
    title: 'Booking Confirmed!',
    message: `Your appointment with ${provider.name} is scheduled for ${bookingDate} (${timeSlot}).`,
    read: false,
    metadata: { bookingId: newBooking._id },
    createdAt: now,
  });

  res.status(201).json({
    success: true,
    message: 'Booking created and confirmed successfully!',
    data: newBooking,
  });
});

// GET /api/bookings/my - Get user's bookings (Customer or Provider)
bookingRouter.get('/my', protect, (req: AuthenticatedRequest, res: Response): void => {
  let userBookings: BookingDoc[] = [];

  if (req.user!.role === 'CUSTOMER') {
    userBookings = db.bookings.filter(b => b.customerId === req.user!._id);
  } else if (req.user!.role === 'PROVIDER') {
    const prov = db.providers.find(p => p.userId === req.user!._id || p.email === req.user!.email);
    const provId = prov ? prov._id : '';
    userBookings = db.bookings.filter(b => b.providerId === provId);
  } else {
    // Admin sees all
    userBookings = [...db.bookings];
  }

  res.json({
    success: true,
    count: userBookings.length,
    data: userBookings,
  });
});

// GET /api/bookings/:id - Single booking details
bookingRouter.get('/:id', protect, (req: AuthenticatedRequest, res: Response): void => {
  const booking = db.bookings.find(b => b._id === req.params.id || b.bookingNumber === req.params.id);

  if (!booking) {
    res.status(404).json({ success: false, message: 'Booking not found' });
    return;
  }

  // Authorization check (Customer, Provider, or Admin)
  const isCustomer = booking.customerId === req.user!._id;
  const isProvider = db.providers.some(p => p._id === booking.providerId && p.userId === req.user!._id);
  const isAdmin = req.user!.role === 'ADMIN';

  if (!isCustomer && !isProvider && !isAdmin) {
    res.status(403).json({ success: false, message: 'Access denied to this booking.' });
    return;
  }

  res.json({
    success: true,
    data: booking,
  });
});

// PATCH /api/bookings/:id/status - Update booking state with transition validation
bookingRouter.patch('/:id/status', protect, (req: AuthenticatedRequest, res: Response): void => {
  const { status, note } = req.body;
  const booking = db.bookings.find(b => b._id === req.params.id);

  if (!booking) {
    res.status(404).json({ success: false, message: 'Booking not found' });
    return;
  }

  const currentStatus = booking.status;
  const allowedTransitions = VALID_TRANSITIONS[currentStatus] || [];

  if (!allowedTransitions.includes(status)) {
    res.status(400).json({
      success: false,
      message: `Invalid state transition from '${currentStatus}' to '${status}'. Allowed next states: ${allowedTransitions.join(', ') || 'None (terminal state)'}`,
      code: 'INVALID_STATUS_TRANSITION',
    });
    return;
  }

  booking.status = status;
  booking.updatedAt = new Date().toISOString();
  booking.timeline.push({
    status,
    timestamp: booking.updatedAt,
    note: note || `Booking status changed to ${status.replace(/_/g, ' ')}`,
  });

  // If completed, update provider completed jobs count and earnings
  if (status === 'COMPLETED') {
    const prov = db.providers.find(p => p._id === booking.providerId);
    if (prov) {
      prov.completedJobsCount += 1;
      prov.earnings.total += booking.amount;
    }
  }

  // Send real-time notification to customer
  db.notifications.unshift({
    _id: `notif_${Date.now()}`,
    userId: booking.customerId,
    type: `BOOKING_${status}`,
    title: `Booking Update: ${status.replace(/_/g, ' ')}`,
    message: note || `Your service (${booking.serviceName}) status has been updated to ${status.replace(/_/g, ' ')}.`,
    read: false,
    metadata: { bookingId: booking._id },
    createdAt: new Date().toISOString(),
  });

  res.json({
    success: true,
    message: `Booking updated to ${status}`,
    data: booking,
  });
});
