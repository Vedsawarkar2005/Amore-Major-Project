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
  trustedOrigins: [
    'http://localhost:3000',
    process.env.FRONTEND_URL,
  ].filter(Boolean),
  secret: process.env.BETTER_AUTH_SECRET || process.env.JWT_SECRET || 'amore-secret-key-2026',
});

export const betterAuthInstance = auth;
export { auth as betterAuth };
export default auth;
