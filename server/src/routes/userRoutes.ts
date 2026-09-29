import { Router, Response } from 'express';
import { db, AddressDoc } from '../db/inMemoryStore.js';
import { protect, AuthenticatedRequest } from '../middleware/auth.js';

export const userRouter = Router();

// GET /api/users/profile
userRouter.get('/profile', protect, (req: AuthenticatedRequest, res: Response): void => {
  const { password: _, ...userWithoutPassword } = req.user!;
  res.json({
    success: true,
    data: userWithoutPassword,
  });
});

// PUT /api/users/profile
userRouter.put('/profile', protect, (req: AuthenticatedRequest, res: Response): void => {
  const { name, phone, avatar } = req.body;
  const user = db.users.find(u => u._id === req.user!._id);
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }

  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (avatar) user.avatar = avatar;

  const { password: _, ...userWithoutPassword } = user;
  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: userWithoutPassword,
  });
});

// POST /api/users/address - Add or update address
userRouter.post('/address', protect, (req: AuthenticatedRequest, res: Response): void => {
  const { title, street, city, state, postalCode, landmark, isDefault } = req.body;
  const user = db.users.find(u => u._id === req.user!._id);
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }

  if (!street || !city || !postalCode) {
    res.status(400).json({ success: false, message: 'Street, city, and postal code are required' });
    return;
  }

  if (isDefault) {
    user.addresses.forEach(a => a.isDefault = false);
  }

  const newAddress: AddressDoc = {
    _id: `addr_${Date.now()}`,
    title: title || 'Home',
    street,
    city,
    state: state || 'California',
    postalCode,
    landmark: landmark || '',
    latitude: 34.0522,
    longitude: -118.2437,
    isDefault: isDefault ?? (user.addresses.length === 0),
  };

  user.addresses.push(newAddress);

  res.status(201).json({
    success: true,
    message: 'Address added successfully',
    data: user.addresses,
  });
});

// DELETE /api/users/address/:id
userRouter.delete('/address/:id', protect, (req: AuthenticatedRequest, res: Response): void => {
  const user = db.users.find(u => u._id === req.user!._id);
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }

  user.addresses = user.addresses.filter(a => a._id !== req.params.id);

  res.json({
    success: true,
    message: 'Address removed successfully',
    data: user.addresses,
  });
});
