import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3000', 10),
  APP_URL: process.env.APP_URL || 'http://localhost:3000',
  JWT_SECRET: process.env.JWT_SECRET || 'fixmate_super_secret_jwt_key_2026',
  JWT_EXPIRES_IN: '7d',
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/fixmate',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || 'rzp_test_mock_fixmate',
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || 'rzp_test_mock_secret',
};
