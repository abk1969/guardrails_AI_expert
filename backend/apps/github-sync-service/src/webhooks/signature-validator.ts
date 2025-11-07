import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class SignatureValidator {
  private readonly secret: string;

  constructor() {
    this.secret = process.env.GITHUB_WEBHOOK_SECRET;

    if (!this.secret) {
      throw new Error('GITHUB_WEBHOOK_SECRET environment variable is required');
    }
  }

  /**
   * Validate GitHub webhook signature
   * @param payload - Raw request body (string)
   * @param signature - GitHub signature header (x-hub-signature-256)
   * @returns true if signature is valid
   */
  validate(payload: string, signature: string): boolean {
    if (!signature) {
      return false;
    }

    // GitHub sends signature as "sha256=<hash>"
    const parts = signature.split('=');
    if (parts.length !== 2 || parts[0] !== 'sha256') {
      return false;
    }

    const receivedHash = parts[1];

    // Compute expected signature
    const hmac = crypto.createHmac('sha256', this.secret);
    hmac.update(payload);
    const expectedHash = hmac.digest('hex');

    // Use timing-safe comparison
    return crypto.timingSafeEqual(
      Buffer.from(receivedHash, 'hex'),
      Buffer.from(expectedHash, 'hex'),
    );
  }
}
