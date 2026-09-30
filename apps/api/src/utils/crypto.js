import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;

/**
 * Validates and retrieves the 32-byte encryption key from environment variables.
 */
function getEncryptionKey() {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error('ENCRYPTION_KEY environment variable is required');
  }

  // 64 hex characters = 32 bytes
  if (key.length === 64 && /^[0-9a-fA-F]+$/.test(key)) {
    return Buffer.from(key, 'hex');
  }

  // 32-byte string
  const buf = Buffer.from(key, 'utf8');
  if (buf.length === 32) {
    return buf;
  }

  try {
    const hexBuf = Buffer.from(key, 'hex');
    if (hexBuf.length === 32) {
      return hexBuf;
    }
  } catch (_) {}

  throw new Error('ENCRYPTION_KEY must be a 32-byte secret (64-character hex or 32-character string)');
}

/**
 * Encrypts plain text using AES-256-GCM.
 * @param {string} text - Plain text to encrypt.
 * @returns {string} Encrypted payload formatted as `iv:authTag:ciphertext`.
 */
export function encrypt(text) {
  if (text === null || text === undefined) {
    return text;
  }

  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let ciphertext = cipher.update(String(text), 'utf8', 'hex');
  ciphertext += cipher.final('hex');

  const authTag = cipher.getAuthTag().toString('hex');

  return `${iv.toString('hex')}:${authTag}:${ciphertext}`;
}

/**
 * Decrypts payload encrypted with AES-256-GCM.
 * @param {string} encryptedPayload - Encrypted string formatted as `iv:authTag:ciphertext`.
 * @returns {string} Plain text.
 */
export function decrypt(encryptedPayload) {
  if (encryptedPayload === null || encryptedPayload === undefined) {
    return encryptedPayload;
  }

  const key = getEncryptionKey();
  const parts = String(encryptedPayload).split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted payload format. Expected iv:authTag:ciphertext');
  }

  const [ivHex, authTagHex, ciphertextHex] = parts;
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(ciphertextHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

export default {
  encrypt,
  decrypt,
};
