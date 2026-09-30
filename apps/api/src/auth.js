import { betterAuth } from 'better-auth';
import { bearer } from 'better-auth/plugins';
import { pool } from './db.js';

export const auth = betterAuth({
  database: pool,
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      role: {
        type: 'string',
        defaultValue: 'customer',
        required: false,
        input: true,
      },
      encrypted_phone: {
        type: 'string',
        required: false,
        input: true,
      },
      encrypted_address: {
        type: 'string',
        required: false,
        input: true,
      },
    },
  },
  plugins: [
    bearer(),
  ],
  baseURL: process.env.BETTER_AUTH_URL || `http://localhost:${process.env.PORT || 8000}`,
  trustedOrigins: (request) => {
    const origin = request?.headers?.get('origin') || request?.headers?.get('referer');
    const origins = [
      'http://localhost:*',
      'http://127.0.0.1:*',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://localhost:5173',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      'http://127.0.0.1:3002',
      'http://127.0.0.1:5173',
      'http://localhost:8000',
      'http://127.0.0.1:8000',
      process.env.FRONTEND_URL,
      process.env.NEXT_PUBLIC_APP_URL,
      ...(process.env.BETTER_AUTH_TRUSTED_ORIGINS ? process.env.BETTER_AUTH_TRUSTED_ORIGINS.split(',') : []),
    ].filter(Boolean);

    if (origin) {
      try {
        const originUrl = new URL(origin).origin;
        if (!origins.includes(originUrl)) {
          origins.push(originUrl);
        }
      } catch {
        if (!origins.includes(origin)) {
          origins.push(origin);
        }
      }
    }
    return origins;
  },
  secret: process.env.BETTER_AUTH_SECRET || process.env.JWT_SECRET || 'amore-secret-key-2026-production-ready-32-chars',
});

export const betterAuthInstance = auth;
export { auth as betterAuth };
export default auth;
