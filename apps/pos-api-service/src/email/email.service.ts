import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

/**
 * Sends email alerts for sync failures, manual intervention, and queue overload.
 * All alerts include branchId, companyId, endpoint, and timestamp for easy tracking.
 */
@Injectable()
export class EmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT || 587),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendSyncFailureAlert(
    recordId: string,
    entity: string,
    error: string,
    attempts: number,
    branchId?: string | null,
    companyId?: string | null,
    endpoint?: string,
  ) {
    const subject = `Sync Failure Alert - ${entity} - ${recordId}`;
    const timestamp = new Date().toISOString();
    const text = [
      `A sync operation failed.`,
      ``,
      `Record ID: ${recordId}`,
      `Entity: ${entity}`,
      `Attempts: ${attempts}`,
      `Error: ${error}`,
      `Timestamp: ${timestamp}`,
      `Endpoint: ${endpoint ?? 'fail'}`,
      `Branch ID: ${branchId ?? 'N/A'}`,
      `Company ID: ${companyId ?? 'N/A'}`,
      ``,
      `Please review the failed sync record.`,
    ].join('\n');
    await this.sendEmail(subject, text);
  }

  async sendManualInterventionAlert(
    recordId: string,
    entity: string,
    error: string,
    attempts: number,
    branchId?: string | null,
    companyId?: string | null,
    endpoint?: string,
  ) {
    const subject = `Manual Intervention Required - ${entity} - ${recordId}`;
    const timestamp = new Date().toISOString();
    const text = [
      `A sync record has failed multiple times and requires manual intervention.`,
      ``,
      `Record ID: ${recordId}`,
      `Entity: ${entity}`,
      `Attempts: ${attempts}`,
      `Error: ${error}`,
      `Timestamp: ${timestamp}`,
      `Endpoint: ${endpoint ?? 'fail'}`,
      `Branch ID: ${branchId ?? 'N/A'}`,
      `Company ID: ${companyId ?? 'N/A'}`,
      ``,
      `Please inspect this record manually.`,
    ].join('\n');
    await this.sendEmail(subject, text);
  }

  async sendQueueOverloadAlert(pendingCount: number, threshold: number) {
    const subject = `Sync Queue Overload Alert`;
    const timestamp = new Date().toISOString();
    const text = [
      `The pending sync queue has exceeded the safe threshold.`,
      ``,
      `Pending Count: ${pendingCount}`,
      `Threshold: ${threshold}`,
      `Timestamp: ${timestamp}`,
      ``,
      `Please check the sync system.`,
    ].join('\n');
    await this.sendEmail(subject, text);
  }

  private async sendEmail(subject: string, text: string) {
    const to = process.env.ADMIN_EMAIL;
    const from = process.env.EMAIL_USER;
    if (!to || !from) return;
    try {
      await this.transporter.sendMail({
        from: `"Ryzera POS" <${from}>`,
        to,
        subject,
        text,
      });
      console.log(`Email sent: ${subject}`);
    } catch (error) {
      console.error(`Failed to send email: ${subject}`, error);
    }
  }
}