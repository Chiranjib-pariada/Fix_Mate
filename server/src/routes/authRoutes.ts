import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db, UserDoc, ProviderDoc } from '../db/inMemoryStore.js';
import { ENV } from '../config/env.js';
import { protect, AuthenticatedRequest } from '../middleware/auth.js';

export const authRouter = Router();

function generateToken(user: UserDoc): string {
  return jwt.sign({ id: user._id, role: user.role }, ENV.JWT_SECRET, {
    expiresIn: '7d',
  });
}

// POST /api/auth/register
authRouter.post('/register', async (req: Request, res: Response): Promise<void> => {
  const { name, email, password, role = 'CUSTOMER', phone = '' } = req.body;

  if (!name || !email || !password) {
    res.status(400).json({
      success: false,
      message: 'Name, email, and password are required fields.',
    });
    return;
  }

  const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    res.status(400).json({
      success: false,
      message: 'An account with this email already exists.',
    });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser: UserDoc = {
    _id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
    role: role === 'PROVIDER' ? 'PROVIDER' : 'CUSTOMER',
    phone,
    avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80`,
    addresses: [],
    createdAt: new Date().toISOString(),
    isVerified: role === 'CUSTOMER',
  };

  db.users.push(newUser);

  // If registering as provider, create pending provider record
  if (newUser.role === 'PROVIDER') {
    const newProvider: ProviderDoc = {
      _id: `prov_${Date.now()}`,
      userId: newUser._id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      avatar: newUser.avatar,
      bio: 'Professional home service technician.',
      experienceYears: 1,
      rating: 5.0,
      reviewCount: 0,
      completedJobsCount: 0,
      verificationStatus: 'PENDING',
      isVerified: false,
      serviceCategories: ['electrician'],
      servicesOffered: [],
      serviceAreas: ['Metro City'],
      workingHours: {
        start: '09:00',
        end: '18:00',
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        breaks: ['13:00-14:00'],
      },
      documents: [
        { title: 'Identity Verification', type: 'ID_PROOF', url: '#', verified: false }
      ],
      earnings: { total: 0, pendingPayout: 0 },
      createdAt: new Date().toISOString(),
    };
    db.providers.push(newProvider);
  }

  const token = generateToken(newUser);
  const { password: _, ...userWithoutPassword } = newUser;

  res.status(201).json({
    success: true,
    message: 'Account created successfully',
    data: {
      user: userWithoutPassword,
      token,
    },
  });
});

// POST /api/auth/login
authRouter.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({
      success: false,
      message: 'Email and password are required',
    });
    return;
  }

  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user || !user.password) {
    res.status(401).json({
      success: false,
      message: 'Invalid email or password',
    });
    return;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    res.status(401).json({
      success: false,
      message: 'Invalid email or password',
    });
    return;
  }

  const token = generateToken(user);
  const { password: _, ...userWithoutPassword } = user;

  res.json({
    success: true,
    message: 'Logged in successfully',
    data: {
      user: userWithoutPassword,
      token,
    },
  });
});

// GET /api/auth/me
authRouter.get('/me', protect, (req: AuthenticatedRequest, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authenticated' });
    return;
  }
  const { password: _, ...userWithoutPassword } = req.user;
  
  // Attach provider info if provider
  let providerInfo = null;
  if (req.user.role === 'PROVIDER') {
    providerInfo = db.providers.find(p => p.userId === req.user?._id || p.email === req.user?.email);
  }

  res.json({
    success: true,
    data: {
      user: userWithoutPassword,
      provider: providerInfo,
    },
  });
});

// POST /api/auth/demo-switch - Switch user quickly to test CUSTOMER, PROVIDER, or ADMIN
authRouter.post('/demo-switch', (req: Request, res: Response): void => {
  const { role } = req.body;
  let targetUser: UserDoc | undefined;

  if (role === 'ADMIN') {
    targetUser = db.users.find(u => u.role === 'ADMIN');
  } else if (role === 'PROVIDER') {
    targetUser = db.users.find(u => u.role === 'PROVIDER');
  } else {
    targetUser = db.users.find(u => u.role === 'CUSTOMER');
  }

  if (!targetUser) {
    res.status(404).json({ success: false, message: `No demo account found for role ${role}` });
    return;
  }

  const token = generateToken(targetUser);
  const { password: _, ...userWithoutPassword } = targetUser;
  let providerInfo = null;
  if (targetUser.role === 'PROVIDER') {
    providerInfo = db.providers.find(p => p.userId === targetUser?._id || p.email === targetUser?.email);
  }

  res.json({
    success: true,
    message: `Switched session to ${targetUser.name} (${targetUser.role})`,
    data: {
      user: userWithoutPassword,
      provider: providerInfo,
      token,
    },
  });
});
