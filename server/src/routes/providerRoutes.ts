import { Router, Request, Response } from 'express';
import { db, ProviderDoc } from '../db/inMemoryStore.js';
import { protect, AuthenticatedRequest } from '../middleware/auth.js';

export const providerRouter = Router();

// GET /api/providers - List & search providers with filters and sorting
providerRouter.get('/', (req: Request, res: Response): void => {
  const { category, search, minRating, maxPrice, sortBy, area } = req.query;

  let results = [...db.providers];

  // Only approved providers appear in public marketplace
  results = results.filter(p => p.isVerified && p.verificationStatus === 'APPROVED');

  if (category) {
    const catStr = String(category).toLowerCase();
    results = results.filter(p => p.serviceCategories.includes(catStr));
  }

  if (area) {
    const areaStr = String(area).toLowerCase();
    results = results.filter(p => p.serviceAreas.some(a => a.toLowerCase().includes(areaStr)));
  }

  if (search) {
    const s = String(search).toLowerCase();
    results = results.filter(p => 
      p.name.toLowerCase().includes(s) ||
      p.bio.toLowerCase().includes(s) ||
      p.serviceCategories.some(c => c.toLowerCase().includes(s)) ||
      p.servicesOffered.some(srv => srv.serviceName.toLowerCase().includes(s))
    );
  }

  if (minRating) {
    const ratingNum = parseFloat(String(minRating));
    if (!isNaN(ratingNum)) {
      results = results.filter(p => p.rating >= ratingNum);
    }
  }

  // Sorting
  if (sortBy === 'rating') {
    results.sort((a, b) => b.rating - a.rating);
  } else if (sortBy === 'experience') {
    results.sort((a, b) => b.experienceYears - a.experienceYears);
  } else if (sortBy === 'jobs') {
    results.sort((a, b) => b.completedJobsCount - a.completedJobsCount);
  }

  res.json({
    success: true,
    count: results.length,
    data: results,
  });
});

// GET /api/providers/:id - Get detailed profile
providerRouter.get('/:id', (req: Request, res: Response): void => {
  const provider = db.providers.find(p => p._id === req.params.id || p.userId === req.params.id);

  if (!provider) {
    res.status(404).json({ success: false, message: 'Service provider not found' });
    return;
  }

  const reviews = db.reviews.filter(r => r.providerId === provider._id);

  res.json({
    success: true,
    data: {
      ...provider,
      reviews,
    },
  });
});

// GET /api/providers/:id/availability - Get open time slots for a given date
providerRouter.get('/:id/availability', (req: Request, res: Response): void => {
  const { date } = req.query; // YYYY-MM-DD
  const provider = db.providers.find(p => p._id === req.params.id);

  if (!provider) {
    res.status(404).json({ success: false, message: 'Provider not found' });
    return;
  }

  // Default day slots
  const standardSlots = [
    '09:00 AM - 10:00 AM',
    '10:00 AM - 11:00 AM',
    '11:00 AM - 12:00 PM',
    '02:00 PM - 03:00 PM',
    '03:00 PM - 04:00 PM',
    '04:00 PM - 05:00 PM',
    '05:00 PM - 06:00 PM',
  ];

  // Check existing active bookings for this date to prevent double booking
  const bookedSlots = db.bookings
    .filter(b => b.providerId === provider._id && b.bookingDate === date && !['CANCELLED', 'REJECTED'].includes(b.status))
    .map(b => b.timeSlot);

  const availableSlots = standardSlots.filter(s => !bookedSlots.includes(s));

  res.json({
    success: true,
    data: {
      providerId: provider._id,
      date,
      workingHours: provider.workingHours,
      standardSlots,
      bookedSlots,
      availableSlots,
    },
  });
});

// PUT /api/providers/profile - Provider updates working hours, bio, service areas
providerRouter.put('/profile', protect, (req: AuthenticatedRequest, res: Response): void => {
  const provider = db.providers.find(p => p.userId === req.user?._id);
  if (!provider) {
    res.status(404).json({ success: false, message: 'Provider record not found' });
    return;
  }

  const { bio, experienceYears, serviceAreas, workingHours } = req.body;
  if (bio !== undefined) provider.bio = bio;
  if (experienceYears !== undefined) provider.experienceYears = Number(experienceYears);
  if (serviceAreas !== undefined) provider.serviceAreas = serviceAreas;
  if (workingHours !== undefined) provider.workingHours = workingHours;

  res.json({
    success: true,
    message: 'Provider profile updated successfully',
    data: provider,
  });
});
