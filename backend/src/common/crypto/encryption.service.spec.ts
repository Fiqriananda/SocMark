import { describe, it, expect } from 'vitest';
import { EncryptionService } from './encryption.service.js';

describe('EncryptionService', () => {
  const service = new EncryptionService();

  it('encrypts and decrypts sensitive KTP/NIK string properly', () => {
    const rawKtp = '3201234567890001';
    const encrypted = service.encrypt(rawKtp);

    expect(encrypted).not.toBe(rawKtp);
    expect(encrypted.split(':')).toHaveLength(3); // iv:authTag:ciphertext

    const decrypted = service.decrypt(encrypted);
    expect(decrypted).toBe(rawKtp);
  });

  it('encrypts and decrypts bank account JSON correctly', () => {
    const bankData = JSON.stringify({
      bankName: 'BCA',
      accountNumber: '1234567890',
      holderName: 'John Doe',
    });

    const encrypted = service.encrypt(bankData);
    const decrypted = service.decrypt(encrypted);
    expect(JSON.parse(decrypted)).toEqual({
      bankName: 'BCA',
      accountNumber: '1234567890',
      holderName: 'John Doe',
    });
  });
});
