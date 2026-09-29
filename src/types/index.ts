export type UserRole = 'CUSTOMER' | 'PROVIDER' | 'ADMIN';

export interface Address {
  _id: string;
  title: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  landmark?: string;
  latitude: number;
  longitude: number;
  isDefault: boolean;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  avatar: string;
  addresses: Address[];
  createdAt: string;
  isVerified: boolean;
}

export interface Provider {
  _id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  bio: string;
  experienceYears: number;
  rating: number;
  reviewCount: number;
  completedJobsCount: number;
  verificationStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  isVerified: boolean;
  serviceCategories: string[];
  servicesOffered: Array<{
    serviceId: string;
    serviceName: string;
    categorySlug: string;
    price: number;
  }>;
  serviceAreas: string[];
  workingHours: {
    start: string;
    end: string;
    workingDays: string[];
    breaks: string[];
  };
  earnings: {
    total: number;
    pendingPayout: number;
  };
  createdAt: string;
  reviews?: Review[];
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  startingPrice: number;
  image: string;
  featured: boolean;
}

export interface Service {
  _id: string;
  categoryId: string;
  categorySlug: string;
  name: string;
  description: string;
  basePrice: number;
  estimatedDuration: string;
  included: string[];
  image: string;
}

export type BookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROVIDER_ON_THE_WAY'
  | 'ARRIVED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REJECTED';

export interface Booking {
  _id: string;
  bookingNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  providerId: string;
  providerName: string;
  serviceId: string;
  serviceName: string;
  categorySlug: string;
  status: BookingStatus;
  bookingDate: string;
  timeSlot: string;
  address: Address;
  specialInstructions?: string;
  amount: number;
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  paymentId?: string;
  createdAt: string;
  updatedAt: string;
  timeline: Array<{
    status: string;
    timestamp: string;
    note: string;
  }>;
}

export interface Review {
  _id: string;
  bookingId: string;
  customerId: string;
  customerName: string;
  customerAvatar: string;
  providerId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Message {
  _id: string;
  conversationId: string;
  senderId: string;
  senderRole: UserRole;
  recipientId: string;
  text: string;
  read: boolean;
  createdAt: string;
}

export interface NotificationItem {
  _id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  metadata?: any;
  createdAt: string;
}
