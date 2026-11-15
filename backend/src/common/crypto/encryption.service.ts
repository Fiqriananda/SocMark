import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly key: Buffer;

  constructor() {
    const secret = process.env.ENCRYPTION_KEY || 'socmark_secret_key_32_characters_long!';
    // Derive a 32-byte key from the secret
    this.key = crypto.createHash('sha256').update(secret).digest();
  }

  /**
   * Encrypt plaintext into a format: iv:authTag:ciphertext (hex encoded)
   */
  encrypt(plaintext: string): string {
    if (!plaintext) return plaintext;
    const iv = crypto.randomBytes(12); // 96-bit IV recommended for GCM
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
    
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag().toString('hex');
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  }

  /**
   * Decrypt ciphertext of format: iv:authTag:ciphertext
   */
  decrypt(ciphertextWithMeta: string): string {
    if (!ciphertextWithMeta || !ciphertextWithMeta.includes(':')) {
      return ciphertextWithMeta;
    }
    const parts = ciphertextWithMeta.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted format');
    }

    const [ivHex, authTagHex, encryptedText] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    
    const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}
