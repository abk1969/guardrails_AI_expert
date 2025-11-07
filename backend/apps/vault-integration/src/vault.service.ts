import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as vault from 'node-vault';

interface VaultConfig {
  apiVersion: string;
  endpoint: string;
  token?: string;
  namespace?: string;
}

interface Secret {
  [key: string]: any;
}

@Injectable()
export class VaultService implements OnModuleInit {
  private readonly logger = new Logger(VaultService.name);
  private client: any;
  private readonly enabled: boolean;
  private readonly mountPath: string;

  constructor() {
    this.enabled = process.env.VAULT_ENABLED === 'true';
    this.mountPath = process.env.VAULT_MOUNT_PATH || 'secret';

    if (this.enabled) {
      const config: VaultConfig = {
        apiVersion: 'v1',
        endpoint: process.env.VAULT_ADDR || 'http://vault:8200',
        token: process.env.VAULT_TOKEN,
        namespace: process.env.VAULT_NAMESPACE,
      };

      this.client = vault(config);
      this.logger.log('✅ Vault client initialized');
    } else {
      this.logger.warn('⚠️ Vault integration disabled - using environment variables');
    }
  }

  async onModuleInit() {
    if (this.enabled) {
      try {
        // Test Vault connection
        const health = await this.client.health();
        this.logger.log(`✅ Vault connection successful - Status: ${health.initialized ? 'Initialized' : 'Not Initialized'}`);
      } catch (error) {
        this.logger.error(`❌ Failed to connect to Vault: ${error.message}`);
        this.logger.warn('⚠️ Falling back to environment variables');
        // Don't throw - fallback to env vars
      }
    }
  }

  /**
   * Read a secret from Vault
   * Falls back to environment variable if Vault is disabled or fails
   */
  async getSecret(path: string, key?: string): Promise<any> {
    if (!this.enabled) {
      return this.getFromEnv(path, key);
    }

    try {
      const fullPath = `${this.mountPath}/data/${path}`;
      const response = await this.client.read(fullPath);

      if (!response || !response.data || !response.data.data) {
        throw new Error(`Secret not found at path: ${path}`);
      }

      const secretData = response.data.data;

      // If key specified, return specific key
      if (key) {
        if (!(key in secretData)) {
          throw new Error(`Key '${key}' not found in secret at path: ${path}`);
        }
        return secretData[key];
      }

      // Return all secret data
      return secretData;
    } catch (error) {
      this.logger.error(`Failed to read secret from Vault: ${error.message}`);
      this.logger.warn(`Falling back to environment variable for: ${path}`);
      return this.getFromEnv(path, key);
    }
  }

  /**
   * Write a secret to Vault
   */
  async setSecret(path: string, data: Secret): Promise<void> {
    if (!this.enabled) {
      this.logger.warn('Vault disabled - secret not stored');
      return;
    }

    try {
      const fullPath = `${this.mountPath}/data/${path}`;
      await this.client.write(fullPath, { data });
      this.logger.log(`✅ Secret written to Vault: ${path}`);
    } catch (error) {
      this.logger.error(`Failed to write secret to Vault: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete a secret from Vault
   */
  async deleteSecret(path: string): Promise<void> {
    if (!this.enabled) {
      this.logger.warn('Vault disabled - no secret to delete');
      return;
    }

    try {
      const fullPath = `${this.mountPath}/data/${path}`;
      await this.client.delete(fullPath);
      this.logger.log(`✅ Secret deleted from Vault: ${path}`);
    } catch (error) {
      this.logger.error(`Failed to delete secret from Vault: ${error.message}`);
      throw error;
    }
  }

  /**
   * List secrets at a path
   */
  async listSecrets(path: string): Promise<string[]> {
    if (!this.enabled) {
      this.logger.warn('Vault disabled - cannot list secrets');
      return [];
    }

    try {
      const fullPath = `${this.mountPath}/metadata/${path}`;
      const response = await this.client.list(fullPath);

      if (!response || !response.data || !response.data.keys) {
        return [];
      }

      return response.data.keys;
    } catch (error) {
      if (error.response?.statusCode === 404) {
        return []; // Path doesn't exist, return empty array
      }
      this.logger.error(`Failed to list secrets from Vault: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get database credentials from Vault
   * Path: database/credentials
   */
  async getDatabaseCredentials(): Promise<{
    url: string;
    username: string;
    password: string;
  }> {
    if (!this.enabled) {
      return {
        url: process.env.DATABASE_URL || '',
        username: process.env.POSTGRES_USER || 'airiskmgr',
        password: process.env.POSTGRES_PASSWORD || '',
      };
    }

    try {
      const secret = await this.getSecret('database/credentials');
      return {
        url: secret.url || process.env.DATABASE_URL,
        username: secret.username || process.env.POSTGRES_USER,
        password: secret.password || process.env.POSTGRES_PASSWORD,
      };
    } catch (error) {
      this.logger.error(`Failed to get database credentials: ${error.message}`);
      return {
        url: process.env.DATABASE_URL || '',
        username: process.env.POSTGRES_USER || 'airiskmgr',
        password: process.env.POSTGRES_PASSWORD || '',
      };
    }
  }

  /**
   * Get API keys from Vault
   * Path: api-keys/<service>
   */
  async getApiKey(service: 'gemini' | 'openai' | 'groq' | 'cohere' | 'perplexity'): Promise<string> {
    const envKeyMap = {
      gemini: 'GEMINI_API_KEY',
      openai: 'OPENAI_API_KEY',
      groq: 'GROQ_API_KEY',
      cohere: 'COHERE_API_KEY',
      perplexity: 'PERPLEXITY_API_KEY',
    };

    if (!this.enabled) {
      return process.env[envKeyMap[service]] || '';
    }

    try {
      return await this.getSecret(`api-keys/${service}`, 'key');
    } catch (error) {
      this.logger.error(`Failed to get ${service} API key: ${error.message}`);
      return process.env[envKeyMap[service]] || '';
    }
  }

  /**
   * Get JWT secrets from Vault
   * Path: jwt/secrets
   */
  async getJwtSecrets(): Promise<{
    secret: string;
    expiration: string;
    refreshExpiration: string;
  }> {
    if (!this.enabled) {
      return {
        secret: process.env.JWT_SECRET || '',
        expiration: process.env.JWT_EXPIRATION || '15m',
        refreshExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d',
      };
    }

    try {
      const secret = await this.getSecret('jwt/secrets');
      return {
        secret: secret.secret || process.env.JWT_SECRET,
        expiration: secret.expiration || process.env.JWT_EXPIRATION || '15m',
        refreshExpiration: secret.refreshExpiration || process.env.JWT_REFRESH_EXPIRATION || '7d',
      };
    } catch (error) {
      this.logger.error(`Failed to get JWT secrets: ${error.message}`);
      return {
        secret: process.env.JWT_SECRET || '',
        expiration: process.env.JWT_EXPIRATION || '15m',
        refreshExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d',
      };
    }
  }

  /**
   * Get encryption key from Vault
   * Path: encryption/key
   */
  async getEncryptionKey(): Promise<string> {
    if (!this.enabled) {
      return process.env.ENCRYPTION_KEY || '';
    }

    try {
      return await this.getSecret('encryption/key', 'key');
    } catch (error) {
      this.logger.error(`Failed to get encryption key: ${error.message}`);
      return process.env.ENCRYPTION_KEY || '';
    }
  }

  /**
   * Get GitHub webhook secret from Vault
   * Path: github/webhook-secret
   */
  async getGitHubWebhookSecret(): Promise<string> {
    if (!this.enabled) {
      return process.env.GITHUB_WEBHOOK_SECRET || '';
    }

    try {
      return await this.getSecret('github/webhook-secret', 'secret');
    } catch (error) {
      this.logger.error(`Failed to get GitHub webhook secret: ${error.message}`);
      return process.env.GITHUB_WEBHOOK_SECRET || '';
    }
  }

  /**
   * Rotate a secret (generate new value and update Vault)
   */
  async rotateSecret(path: string, generator: () => string): Promise<string> {
    if (!this.enabled) {
      this.logger.warn('Vault disabled - secret rotation not performed');
      return generator();
    }

    try {
      const newValue = generator();
      await this.setSecret(path, { value: newValue, rotatedAt: new Date().toISOString() });
      this.logger.log(`✅ Secret rotated: ${path}`);
      return newValue;
    } catch (error) {
      this.logger.error(`Failed to rotate secret: ${error.message}`);
      throw error;
    }
  }

  /**
   * Fallback to environment variable
   */
  private getFromEnv(path: string, key?: string): any {
    // Convert path to environment variable name
    // Example: database/credentials -> DATABASE_CREDENTIALS
    const envVarName = path.toUpperCase().replace(/\//g, '_').replace(/-/g, '_');

    if (key) {
      const keyEnvName = `${envVarName}_${key.toUpperCase()}`;
      return process.env[keyEnvName] || process.env[envVarName];
    }

    return process.env[envVarName];
  }

  /**
   * Check if Vault is enabled and healthy
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Health check for Vault
   */
  async healthCheck(): Promise<{ healthy: boolean; message: string }> {
    if (!this.enabled) {
      return { healthy: true, message: 'Vault disabled - using environment variables' };
    }

    try {
      const health = await this.client.health();
      return {
        healthy: health.initialized && health.sealed === false,
        message: health.initialized
          ? health.sealed
            ? 'Vault is sealed'
            : 'Vault is healthy'
          : 'Vault not initialized',
      };
    } catch (error) {
      return { healthy: false, message: `Vault health check failed: ${error.message}` };
    }
  }
}
