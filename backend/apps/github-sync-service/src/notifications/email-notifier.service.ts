import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

type ToolName = 'promptfoo' | 'garak';

@Injectable()
export class EmailNotifierService {
  private readonly logger = new Logger(EmailNotifierService.name);
  private readonly transporter: nodemailer.Transporter;
  private readonly enabled: boolean;
  private readonly fromAddress: string;
  private readonly toAddresses: string[];

  constructor() {
    this.enabled = !!(
      process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASSWORD
    );

    this.fromAddress = process.env.EMAIL_FROM || 'noreply@airiskmgr.com';
    this.toAddresses = process.env.EMAIL_TO
      ? process.env.EMAIL_TO.split(',').map(email => email.trim())
      : [];

    if (this.enabled) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      });
    }
  }

  async notifyDeploymentSuccess(tool: ToolName, version: string, duration: number): Promise<void> {
    if (!this.enabled || this.toAddresses.length === 0) {
      return;
    }

    const subject = `✅ Deployment Successful: ${tool} v${version}`;
    const html = `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #22c55e;">✅ Deployment Successful</h2>
          <p>The deployment of <strong>${tool}</strong> has completed successfully.</p>

          <table style="border-collapse: collapse; margin: 20px 0;">
            <tr>
              <td style="padding: 8px; font-weight: bold;">Tool:</td>
              <td style="padding: 8px;">${tool}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">Version:</td>
              <td style="padding: 8px;">${version}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">Duration:</td>
              <td style="padding: 8px;">${this.formatDuration(duration)}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">Timestamp:</td>
              <td style="padding: 8px;">${new Date().toISOString()}</td>
            </tr>
          </table>

          <p style="margin-top: 20px; color: #666; font-size: 12px;">
            This is an automated message from AI Risk Manager GitHub Sync Service.
          </p>
        </body>
      </html>
    `;

    await this.sendEmail(subject, html);
  }

  async notifyDeploymentFailure(tool: ToolName, version: string, error: string): Promise<void> {
    if (!this.enabled || this.toAddresses.length === 0) {
      return;
    }

    const subject = `❌ Deployment Failed: ${tool} v${version}`;
    const html = `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #ef4444;">❌ Deployment Failed</h2>
          <p>The deployment of <strong>${tool}</strong> has failed. Immediate attention required.</p>

          <table style="border-collapse: collapse; margin: 20px 0;">
            <tr>
              <td style="padding: 8px; font-weight: bold;">Tool:</td>
              <td style="padding: 8px;">${tool}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">Version:</td>
              <td style="padding: 8px;">${version}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">Timestamp:</td>
              <td style="padding: 8px;">${new Date().toISOString()}</td>
            </tr>
          </table>

          <h3 style="color: #ef4444;">Error Details:</h3>
          <pre style="background: #f5f5f5; padding: 15px; border-left: 4px solid #ef4444; overflow-x: auto;">${error}</pre>

          <p style="margin-top: 20px; color: #666; font-size: 12px;">
            This is an automated message from AI Risk Manager GitHub Sync Service.
          </p>
        </body>
      </html>
    `;

    await this.sendEmail(subject, html);
  }

  async notifyRollback(tool: ToolName, fromVersion: string, toVersion: string, reason: string): Promise<void> {
    if (!this.enabled || this.toAddresses.length === 0) {
      return;
    }

    const subject = `⚠️ Rollback Executed: ${tool}`;
    const html = `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #f59e0b;">⚠️ Rollback Executed</h2>
          <p>A rollback has been performed on <strong>${tool}</strong>.</p>

          <table style="border-collapse: collapse; margin: 20px 0;">
            <tr>
              <td style="padding: 8px; font-weight: bold;">Tool:</td>
              <td style="padding: 8px;">${tool}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">From Version:</td>
              <td style="padding: 8px;">${fromVersion}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">To Version:</td>
              <td style="padding: 8px;">${toVersion}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">Timestamp:</td>
              <td style="padding: 8px;">${new Date().toISOString()}</td>
            </tr>
          </table>

          <h3>Reason:</h3>
          <p style="background: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b;">${reason}</p>

          <p style="margin-top: 20px; color: #666; font-size: 12px;">
            This is an automated message from AI Risk Manager GitHub Sync Service.
          </p>
        </body>
      </html>
    `;

    await this.sendEmail(subject, html);
  }

  async notifyHealthCheckFailure(service: string, consecutive: number): Promise<void> {
    if (!this.enabled || this.toAddresses.length === 0) {
      return;
    }

    const subject = `🚨 Health Check Failed: ${service}`;
    const html = `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #dc2626;">🚨 Health Check Failed</h2>
          <p>The health check for <strong>${service}</strong> has failed.</p>

          <table style="border-collapse: collapse; margin: 20px 0;">
            <tr>
              <td style="padding: 8px; font-weight: bold;">Service:</td>
              <td style="padding: 8px;">${service}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">Consecutive Failures:</td>
              <td style="padding: 8px;">${consecutive}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">Timestamp:</td>
              <td style="padding: 8px;">${new Date().toISOString()}</td>
            </tr>
          </table>

          <p style="background: #fee2e2; padding: 15px; border-left: 4px solid #dc2626;">
            <strong>Action Required:</strong> Please investigate the service immediately.
          </p>

          <p style="margin-top: 20px; color: #666; font-size: 12px;">
            This is an automated message from AI Risk Manager GitHub Sync Service.
          </p>
        </body>
      </html>
    `;

    await this.sendEmail(subject, html);
  }

  private async sendEmail(subject: string, html: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.fromAddress,
        to: this.toAddresses,
        subject,
        html,
      });

      this.logger.debug('Email notification sent successfully');
    } catch (error) {
      this.logger.error(`Failed to send email notification: ${error.message}`, error.stack);
      // Don't throw - notifications are non-critical
    }
  }

  private formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    }
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  }

  async testConnection(): Promise<boolean> {
    if (!this.enabled) {
      return false;
    }

    try {
      await this.transporter.verify();
      this.logger.log('✅ SMTP connection verified');
      return true;
    } catch (error) {
      this.logger.error(`❌ SMTP connection failed: ${error.message}`);
      return false;
    }
  }
}
