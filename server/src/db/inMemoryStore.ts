import bcrypt from 'bcryptjs';

export interface UserDoc {
  _id: string;
  name: string;
  email: string;
  password?: string;
  role: 'CUSTOMER' | 'PROVIDER' | 'ADMIN';
  phone: string;
  avatar: string;
  addresses: AddressDoc[];
  createdAt: string;
  isVerified: boolean;
}

export interface AddressDoc {
  _id: string;
  title: string; // e.g. "Home", "Office"
  street: string;
  city: string;
  state: string;
  postalCode: string;
  landmark?: string;
  latitude: number;
  longitude: number;
  isDefault: boolean;
}

export interface ProviderDoc {
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
  serviceCategories: string[]; // Category slugs
  servicesOffered: Array<{
    serviceId: string;
    serviceName: string;
    categorySlug: string;
    price: number;
  }>;
  serviceAreas: string[]; // City names / regions
  workingHours: {
    start: string; // "09:00"
    end: string;   // "18:00"
    workingDays: string[]; // ["Monday", "Tuesday", ...]
    breaks: string[]; // ["13:00-14:00"]
  };
  documents: Array<{
    title: string;
    type: string;
    url: string;
    verified: boolean;
  }>;
  earnings: {
    total: number;
    pendingPayout: number;
  };
  createdAt: string;
}

export interface CategoryDoc {
  _id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  startingPrice: number;
  image: string;
  featured: boolean;
}

export interface ServiceDoc {
  _id: string;
  categoryId: string;
  categorySlug: string;
  name: string;
  description: string;
  basePrice: number;
  estimatedDuration: string; // e.g. "45 - 60 mins"
  included: string[];
  image: string;
}

export interface BookingDoc {
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
  status: 'PENDING' | 'CONFIRMED' | 'PROVIDER_ON_THE_WAY' | 'ARRIVED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'REJECTED';
  bookingDate: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "10:00 AM - 11:00 AM"
  address: AddressDoc;
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

export interface PaymentDoc {
  _id: string;
  bookingId: string;
  customerId: string;
  providerId: string;
  amount: number;
  currency: string;
  orderId: string;
  paymentId: string;
  status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  method: string;
  createdAt: string;
}

export interface ReviewDoc {
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

export interface MessageDoc {
  _id: string;
  conversationId: string;
  senderId: string;
  senderRole: 'CUSTOMER' | 'PROVIDER' | 'ADMIN';
  recipientId: string;
  text: string;
  read: boolean;
  createdAt: string;
}

export interface NotificationDoc {
  _id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  metadata?: any;
  createdAt: string;
}

export interface SupportTicketDoc {
  _id: string;
  userId: string;
  userName: string;
  userEmail: string;
  subject: string;
  category: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  messages: Array<{
    sender: string;
    text: string;
    time: string;
  }>;
  createdAt: string;
}

// In-Memory Database collections
class DocumentStore {
  users: UserDoc[] = [];
  providers: ProviderDoc[] = [];
  categories: CategoryDoc[] = [];
  services: ServiceDoc[] = [];
  bookings: BookingDoc[] = [];
  payments: PaymentDoc[] = [];
  reviews: ReviewDoc[] = [];
  messages: MessageDoc[] = [];
  notifications: NotificationDoc[] = [];
  supportTickets: SupportTicketDoc[] = [];

  constructor() {
    this.seedInitialData();
  }

  seedInitialData() {
    const defaultPasswordHash = bcrypt.hashSync('user123', 10);
    const adminPasswordHash = bcrypt.hashSync('admin123', 10);

    // Categories
    this.categories = [
      {
        _id: 'cat_electrician',
        name: 'Electrician',
        slug: 'electrician',
        icon: 'Zap',
        description: 'Wiring, fixtures, switches, circuit breakers & lighting installations.',
        startingPrice: 39,
        image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80',
        featured: true,
      },
      {
        _id: 'cat_plumbing',
        name: 'Plumbing',
        slug: 'plumbing',
        icon: 'Wrench',
        description: 'Pipe leaks, taps, sink repairs, bathroom fittings & drainage unclogging.',
        startingPrice: 45,
        image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=600&q=80',
        featured: true,
      },
      {
        _id: 'cat_ac_repair',
        name: 'AC Repair',
        slug: 'ac-repair',
        icon: 'Wind',
        description: 'Deep AC servicing, gas refill, cooling diagnostics & installation.',
        startingPrice: 49,
        image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=600&q=80',
        featured: true,
      },
      {
        _id: 'cat_cleaning',
        name: 'Home Cleaning',
        slug: 'home-cleaning',
        icon: 'Sparkles',
        description: 'Full home deep sanitization, kitchen, bathroom & sofa shampooing.',
        startingPrice: 59,
        image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80',
        featured: true,
      },
      {
        _id: 'cat_carpenter',
        name: 'Carpenter',
        slug: 'carpenter',
        icon: 'Hammer',
        description: 'Furniture assembly, door latches, wardrobe hinges & custom woodwork.',
        startingPrice: 40,
        image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80',
        featured: false,
      },
      {
        _id: 'cat_painting',
        name: 'Painting',
        slug: 'painting',
        icon: 'Paintbrush',
        description: 'Interior wall painting, waterproof coating & texture finishes.',
        startingPrice: 99,
        image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=600&q=80',
        featured: false,
      },
      {
        _id: 'cat_appliance',
        name: 'Appliance Repair',
        slug: 'appliance-repair',
        icon: 'Tv',
        description: 'Washing machines, microwave ovens, refrigerators & induction repairs.',
        startingPrice: 45,
        image: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=600&q=80',
        featured: true,
      },
      {
        _id: 'cat_pest_control',
        name: 'Pest Control',
        slug: 'pest-control',
        icon: 'ShieldAlert',
        description: 'Eco-friendly cockroach, termite, bed bug & rodent treatment.',
        startingPrice: 55,
        image: 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&w=600&q=80',
        featured: false,
      },
      {
        _id: 'cat_ro_service',
        name: 'RO Service',
        slug: 'ro-service',
        icon: 'Droplets',
        description: 'Water purifier filter replacement, membrane check & installation.',
        startingPrice: 35,
        image: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=600&q=80',
        featured: false,
      },
      {
        _id: 'cat_cctv',
        name: 'CCTV Installation',
        slug: 'cctv-installation',
        icon: 'Camera',
        description: 'Smart surveillance camera setup, DVR wiring & mobile viewing config.',
        startingPrice: 65,
        image: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=600&q=80',
        featured: false,
      },
    ];

    // Services
    this.services = [
      {
        _id: 'srv_elec_1',
        categoryId: 'cat_electrician',
        categorySlug: 'electrician',
        name: 'Switch & Socket Repair/Install',
        description: 'Diagnosis and replacement of burned or faulty wall switches, sockets, and regulators.',
        basePrice: 39,
        estimatedDuration: '45 mins',
        included: ['Safety check', 'Wiring diagnostic', 'Replacement part testing'],
        image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=400&q=80',
      },
      {
        _id: 'srv_elec_2',
        categoryId: 'cat_electrician',
        categorySlug: 'electrician',
        name: 'Ceiling Fan Installation & Repair',
        description: 'Mounting new ceiling fans or fixing wobbling, noise, and regulator speed issues.',
        basePrice: 45,
        estimatedDuration: '60 mins',
        included: ['Downrod inspection', 'Capacitor testing', 'Speed calibration'],
        image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=400&q=80',
      },
      {
        _id: 'srv_plumb_1',
        categoryId: 'cat_plumbing',
        categorySlug: 'plumbing',
        name: 'Tap Repair & Leaking Pipe Fix',
        description: 'Repairing dripping kitchen taps, shower mixers, and sealing leaking copper or PVC pipe joints.',
        basePrice: 49,
        estimatedDuration: '60 mins',
        included: ['Washer replacement', 'Pressure check', 'Joint sealing tape'],
        image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=400&q=80',
      },
      {
        _id: 'srv_plumb_2',
        categoryId: 'cat_plumbing',
        categorySlug: 'plumbing',
        name: 'Blocked Drain Cleaning',
        description: 'Deep clog clearing for kitchen sinks, bathroom floor drains, and sewer traps.',
        basePrice: 59,
        estimatedDuration: '75 mins',
        included: ['Mechanical snake unclog', 'Debris removal', 'Disinfectant rinse'],
        image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=400&q=80',
      },
      {
        _id: 'srv_ac_1',
        categoryId: 'cat_ac_repair',
        categorySlug: 'ac-repair',
        name: 'Split AC Deep Jet Servicing',
        description: 'High-pressure water jet cleaning of indoor cooling coils, blower wheel, and outdoor condenser.',
        basePrice: 55,
        estimatedDuration: '90 mins',
        included: ['Jet spray foam cleaning', 'Filter wash', 'Cooling temp test'],
        image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=400&q=80',
      },
      {
        _id: 'srv_clean_1',
        categoryId: 'cat_cleaning',
        categorySlug: 'home-cleaning',
        name: 'Complete Home Deep Cleaning',
        description: 'Intensive scrubbing of floor tiles, bathroom grout, window frames, and kitchen grease.',
        basePrice: 119,
        estimatedDuration: '4 - 5 hrs',
        included: ['Eco chemicals', 'Machine scrubbing', 'Full sanitation'],
        image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=400&q=80',
      },
      {
        _id: 'srv_appliance_1',
        categoryId: 'cat_appliance',
        categorySlug: 'appliance-repair',
        name: 'Washing Machine Inspection & Repair',
        description: 'Troubleshooting spin cycle failure, drain pump blockage, and PCB motor errors.',
        basePrice: 50,
        estimatedDuration: '60 mins',
        included: ['Diagnostics scan', 'Belt check', 'Vibration test'],
        image: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=400&q=80',
      },
    ];

    // Seed Users
    this.users = [
      {
        _id: 'usr_admin_1',
        name: 'Admin FixMate',
        email: 'admin@fixmate.com',
        password: adminPasswordHash,
        role: 'ADMIN',
        phone: '+1 (555) 010-0001',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        addresses: [],
        createdAt: '2026-01-01T08:00:00.000Z',
        isVerified: true,
      },
      {
        _id: 'usr_cust_1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: defaultPasswordHash,
        role: 'CUSTOMER',
        phone: '+1 (555) 012-3456',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
        addresses: [
          {
            _id: 'addr_1',
            title: 'Home Apartment',
            street: '742 Evergreen Terrace, Apt 4B',
            city: 'Metro City',
            state: 'California',
            postalCode: '90001',
            landmark: 'Opposite City Center Mall',
            latitude: 34.0522,
            longitude: -118.2437,
            isDefault: true,
          },
          {
            _id: 'addr_2',
            title: 'Design Studio Office',
            street: '120 Market Street, Suite 300',
            city: 'Metro City',
            state: 'California',
            postalCode: '90012',
            landmark: 'Next to Starbucks',
            latitude: 34.0549,
            longitude: -118.2426,
            isDefault: false,
          },
        ],
        createdAt: '2026-01-10T10:00:00.000Z',
        isVerified: true,
      },
      {
        _id: 'usr_cust_2',
        name: 'Sarah Mitchell',
        email: 'sarah.m@example.com',
        password: defaultPasswordHash,
        role: 'CUSTOMER',
        phone: '+1 (555) 019-8765',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
        addresses: [
          {
            _id: 'addr_3',
            title: 'Townhouse',
            street: '450 Pine Valley Road',
            city: 'Metro City',
            state: 'California',
            postalCode: '90024',
            latitude: 34.0689,
            longitude: -118.4452,
            isDefault: true,
          }
        ],
        createdAt: '2026-02-01T12:00:00.000Z',
        isVerified: true,
      },
      {
        _id: 'usr_prov_1',
        name: 'Rajesh Kumar',
        email: 'rajesh.kumar@fixmate.pro',
        password: defaultPasswordHash,
        role: 'PROVIDER',
        phone: '+1 (555) 014-9988',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        addresses: [],
        createdAt: '2026-01-05T09:00:00.000Z',
        isVerified: true,
      },
      {
        _id: 'usr_prov_2',
        name: 'Michael Chen',
        email: 'michael.chen@fixmate.pro',
        password: defaultPasswordHash,
        role: 'PROVIDER',
        phone: '+1 (555) 018-2233',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
        addresses: [],
        createdAt: '2026-01-08T11:00:00.000Z',
        isVerified: true,
      },
      {
        _id: 'usr_prov_3',
        name: 'Elena Rostova',
        email: 'elena.rostova@fixmate.pro',
        password: defaultPasswordHash,
        role: 'PROVIDER',
        phone: '+1 (555) 016-5544',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
        addresses: [],
        createdAt: '2026-01-12T14:00:00.000Z',
        isVerified: true,
      },
      {
        _id: 'usr_prov_4',
        name: 'Priya Sharma',
        email: 'priya.sharma@fixmate.pro',
        password: defaultPasswordHash,
        role: 'PROVIDER',
        phone: '+1 (555) 011-7711',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
        addresses: [],
        createdAt: '2026-01-15T15:00:00.000Z',
        isVerified: true,
      },
    ];

    // Seed Providers
    this.providers = [
      {
        _id: 'prov_1',
        userId: 'usr_prov_1',
        name: 'Rajesh Kumar',
        email: 'rajesh.kumar@fixmate.pro',
        phone: '+1 (555) 014-9988',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        bio: 'Certified Master Electrician with 9+ years of commercial and residential rewiring, smart lighting, and fuse box troubleshooting experience.',
        experienceYears: 9,
        rating: 4.9,
        reviewCount: 124,
        completedJobsCount: 198,
        verificationStatus: 'APPROVED',
        isVerified: true,
        serviceCategories: ['electrician'],
        servicesOffered: [
          {
            serviceId: 'srv_elec_1',
            serviceName: 'Switch & Socket Repair/Install',
            categorySlug: 'electrician',
            price: 39,
          },
          {
            serviceId: 'srv_elec_2',
            serviceName: 'Ceiling Fan Installation & Repair',
            categorySlug: 'electrician',
            price: 45,
          },
        ],
        serviceAreas: ['Metro City', 'Downtown', 'Westwood', 'North Hills'],
        workingHours: {
          start: '08:30',
          end: '18:30',
          workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
          breaks: ['13:00-14:00'],
        },
        documents: [
          { title: 'Master Electrician License', type: 'LICENSE', url: '#', verified: true },
          { title: 'Commercial Liability Insurance', type: 'INSURANCE', url: '#', verified: true },
          { title: 'Government Photo ID', type: 'ID_PROOF', url: '#', verified: true },
        ],
        earnings: {
          total: 8450,
          pendingPayout: 620,
        },
        createdAt: '2026-01-05T09:00:00.000Z',
      },
      {
        _id: 'prov_2',
        userId: 'usr_prov_2',
        name: 'Michael Chen',
        email: 'michael.chen@fixmate.pro',
        phone: '+1 (555) 018-2233',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
        bio: 'Licensed Master Plumber specialized in emergency leak repairs, pressure balancing, drain clearing, and bathroom fixture installation.',
        experienceYears: 7,
        rating: 4.85,
        reviewCount: 98,
        completedJobsCount: 152,
        verificationStatus: 'APPROVED',
        isVerified: true,
        serviceCategories: ['plumbing'],
        servicesOffered: [
          {
            serviceId: 'srv_plumb_1',
            serviceName: 'Tap Repair & Leaking Pipe Fix',
            categorySlug: 'plumbing',
            price: 49,
          },
          {
            serviceId: 'srv_plumb_2',
            serviceName: 'Blocked Drain Cleaning',
            categorySlug: 'plumbing',
            price: 59,
          },
        ],
        serviceAreas: ['Metro City', 'East End', 'Suburbs', 'Westwood'],
        workingHours: {
          start: '09:00',
          end: '19:00',
          workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          breaks: ['13:00-14:00'],
        },
        documents: [
          { title: 'Journeyman Plumbing Certificate', type: 'LICENSE', url: '#', verified: true },
          { title: 'Background Check Verification', type: 'BACKGROUND_CHECK', url: '#', verified: true },
        ],
        earnings: {
          total: 6890,
          pendingPayout: 430,
        },
        createdAt: '2026-01-08T11:00:00.000Z',
      },
      {
        _id: 'prov_3',
        userId: 'usr_prov_3',
        name: 'Elena Rostova',
        email: 'elena.rostova@fixmate.pro',
        phone: '+1 (555) 016-5544',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
        bio: 'HVAC Specialist & AC Technician. Expert in inverter AC diagnostics, compressor recovery, refrigerant recharging, and sanitizing deep coil cleaning.',
        experienceYears: 6,
        rating: 4.95,
        reviewCount: 142,
        completedJobsCount: 220,
        verificationStatus: 'APPROVED',
        isVerified: true,
        serviceCategories: ['ac-repair'],
        servicesOffered: [
          {
            serviceId: 'srv_ac_1',
            serviceName: 'Split AC Deep Jet Servicing',
            categorySlug: 'ac-repair',
            price: 55,
          },
        ],
        serviceAreas: ['Metro City', 'North Hills', 'Downtown', 'Uptown'],
        workingHours: {
          start: '08:00',
          end: '18:00',
          workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
          breaks: ['12:30-13:30'],
        },
        documents: [
          { title: 'HVAC EPA Universal Certification', type: 'LICENSE', url: '#', verified: true },
          { title: 'FixMate Verified Badge', type: 'INTERNAL_CHECK', url: '#', verified: true },
        ],
        earnings: {
          total: 11200,
          pendingPayout: 890,
        },
        createdAt: '2026-01-12T14:00:00.000Z',
      },
      {
        _id: 'prov_4',
        userId: 'usr_prov_4',
        name: 'Priya Sharma',
        email: 'priya.sharma@fixmate.pro',
        phone: '+1 (555) 011-7711',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
        bio: 'Professional Home Deep Sanitization Lead. Utilizing hospital-grade steam tools and eco-friendly pet-safe sanitizers.',
        experienceYears: 5,
        rating: 4.88,
        reviewCount: 86,
        completedJobsCount: 115,
        verificationStatus: 'APPROVED',
        isVerified: true,
        serviceCategories: ['home-cleaning'],
        servicesOffered: [
          {
            serviceId: 'srv_clean_1',
            serviceName: 'Complete Home Deep Cleaning',
            categorySlug: 'home-cleaning',
            price: 119,
          },
        ],
        serviceAreas: ['Metro City', 'Downtown', 'Suburbs'],
        workingHours: {
          start: '09:00',
          end: '17:00',
          workingDays: ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          breaks: ['13:00-14:00'],
        },
        documents: [
          { title: 'Certified Cleaning Technician (IICRC)', type: 'CERTIFICATION', url: '#', verified: true },
        ],
        earnings: {
          total: 9240,
          pendingPayout: 750,
        },
        createdAt: '2026-01-15T15:00:00.000Z',
      },
    ];

    // Seed Bookings
    this.bookings = [
      {
        _id: 'bk_1001',
        bookingNumber: 'FM-2026-1001',
        customerId: 'usr_cust_1',
        customerName: 'John Doe',
        customerPhone: '+1 (555) 012-3456',
        providerId: 'prov_1',
        providerName: 'Rajesh Kumar',
        serviceId: 'srv_elec_1',
        serviceName: 'Switch & Socket Repair/Install',
        categorySlug: 'electrician',
        status: 'CONFIRMED',
        bookingDate: '2026-10-02',
        timeSlot: '10:00 AM - 11:00 AM',
        address: {
          _id: 'addr_1',
          title: 'Home Apartment',
          street: '742 Evergreen Terrace, Apt 4B',
          city: 'Metro City',
          state: 'California',
          postalCode: '90001',
          landmark: 'Opposite City Center Mall',
          latitude: 34.0522,
          longitude: -118.2437,
          isDefault: true,
        },
        specialInstructions: 'Two bedroom switches flicker occasionally when AC starts.',
        amount: 39,
        paymentStatus: 'PAID',
        paymentId: 'pay_mock_1001',
        createdAt: '2026-09-28T14:20:00.000Z',
        updatedAt: '2026-09-28T15:00:00.000Z',
        timeline: [
          {
            status: 'PENDING',
            timestamp: '2026-09-28T14:20:00.000Z',
            note: 'Booking requested by customer',
          },
          {
            status: 'CONFIRMED',
            timestamp: '2026-09-28T15:00:00.000Z',
            note: 'Rajesh Kumar accepted your appointment',
          },
        ],
      },
      {
        _id: 'bk_1002',
        bookingNumber: 'FM-2026-1002',
        customerId: 'usr_cust_1',
        customerName: 'John Doe',
        customerPhone: '+1 (555) 012-3456',
        providerId: 'prov_2',
        providerName: 'Michael Chen',
        serviceId: 'srv_plumb_1',
        serviceName: 'Tap Repair & Leaking Pipe Fix',
        categorySlug: 'plumbing',
        status: 'COMPLETED',
        bookingDate: '2026-09-25',
        timeSlot: '02:00 PM - 03:00 PM',
        address: {
          _id: 'addr_1',
          title: 'Home Apartment',
          street: '742 Evergreen Terrace, Apt 4B',
          city: 'Metro City',
          state: 'California',
          postalCode: '90001',
          latitude: 34.0522,
          longitude: -118.2437,
          isDefault: true,
        },
        specialInstructions: 'Main valve is under the kitchen sink.',
        amount: 49,
        paymentStatus: 'PAID',
        paymentId: 'pay_mock_1002',
        createdAt: '2026-09-24T10:00:00.000Z',
        updatedAt: '2026-09-25T15:30:00.000Z',
        timeline: [
          { status: 'PENDING', timestamp: '2026-09-24T10:00:00.000Z', note: 'Booking created' },
          { status: 'CONFIRMED', timestamp: '2026-09-24T10:30:00.000Z', note: 'Provider confirmed' },
          { status: 'PROVIDER_ON_THE_WAY', timestamp: '2026-09-25T13:40:00.000Z', note: 'Michael is on the way' },
          { status: 'ARRIVED', timestamp: '2026-09-25T14:02:00.000Z', note: 'Provider arrived at location' },
          { status: 'IN_PROGRESS', timestamp: '2026-09-25T14:10:00.000Z', note: 'Plumbing service started' },
          { status: 'COMPLETED', timestamp: '2026-09-25T15:30:00.000Z', note: 'Service successfully finished' },
        ],
      },
    ];

    // Seed Reviews
    this.reviews = [
      {
        _id: 'rev_1',
        bookingId: 'bk_1002',
        customerId: 'usr_cust_1',
        customerName: 'John Doe',
        customerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
        providerId: 'prov_2',
        rating: 5,
        comment: 'Michael arrived right on time, explained the issue with the mixer cartridge clearly, and replaced it cleanly. No more leaks!',
        createdAt: '2026-09-25T16:00:00.000Z',
      },
      {
        _id: 'rev_2',
        bookingId: 'bk_prev_99',
        customerId: 'usr_cust_2',
        customerName: 'Sarah Mitchell',
        customerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
        providerId: 'prov_1',
        rating: 5,
        comment: 'Rajesh is brilliant. He rewired our old breaker box with absolute professionalism and safety certification.',
        createdAt: '2026-09-20T11:00:00.000Z',
      },
      {
        _id: 'rev_3',
        bookingId: 'bk_prev_98',
        customerId: 'usr_cust_2',
        customerName: 'Sarah Mitchell',
        customerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
        providerId: 'prov_3',
        rating: 5,
        comment: 'Elena performed the split AC jet wash. The airflow is freezing cold now and completely silent. 10/10 recommend!',
        createdAt: '2026-09-18T17:15:00.000Z',
      },
    ];

    // Seed Messages
    this.messages = [
      {
        _id: 'msg_1',
        conversationId: 'usr_cust_1_prov_1',
        senderId: 'usr_cust_1',
        senderRole: 'CUSTOMER',
        recipientId: 'prov_1',
        text: 'Hi Rajesh! Just confirming if you need me to turn off the main circuit breaker before you arrive on Friday?',
        read: true,
        createdAt: '2026-09-28T15:05:00.000Z',
      },
      {
        _id: 'msg_2',
        conversationId: 'usr_cust_1_prov_1',
        senderId: 'prov_1',
        senderRole: 'PROVIDER',
        recipientId: 'usr_cust_1',
        text: 'Hello John! No worries at all, please leave it on. I have insulated diagnostic probes to test under load first. See you Friday at 10 AM!',
        read: true,
        createdAt: '2026-09-28T15:08:00.000Z',
      },
    ];

    // Seed Notifications
    this.notifications = [
      {
        _id: 'notif_1',
        userId: 'usr_cust_1',
        type: 'BOOKING_CONFIRMED',
        title: 'Booking Confirmed!',
        message: 'Rajesh Kumar confirmed your electrician booking for Oct 2, 10:00 AM.',
        read: false,
        metadata: { bookingId: 'bk_1001' },
        createdAt: '2026-09-28T15:00:00.000Z',
      },
      {
        _id: 'notif_2',
        userId: 'usr_prov_1',
        type: 'NEW_BOOKING_REQUEST',
        title: 'New Service Request',
        message: 'John Doe booked Switch & Socket Repair for Oct 2, 10:00 AM.',
        read: true,
        metadata: { bookingId: 'bk_1001' },
        createdAt: '2026-09-28T14:20:00.000Z',
      },
    ];
  }
}

// Singleton database instance
export const db = new DocumentStore();
