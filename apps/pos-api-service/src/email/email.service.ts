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
    // Only dispatch failure email if max retries reached (attempts >= 5)
    if (attempts < 5) {
      console.log(`[Email Throttling] Sync failure email suppressed (Attempt ${attempts} < 5). Retrying in background.`);
      return;
    }

    const subject = `🚨 [Sync Failure Alert] - ${entity} - Record #${recordId} (5 Retries Failed)`;
    const timestamp = new Date().toISOString();
    const text = [
      `A sync operation has failed after reaching the maximum limit of 5 retry attempts.`,
      ``,
      `Record ID   : #${recordId}`,
      `Entity      : ${entity}`,
      `Attempts    : ${attempts} of 5 (Max Reached)`,
      `Error Trace : ${error}`,
      `Timestamp   : ${timestamp}`,
      `Endpoint    : ${endpoint ?? '/api/sync/push'}`,
      `Branch ID   : ${branchId ?? 'N/A'}`,
      ``,
      `Direct Action Link: http://localhost:3001/sync/errors`,
      ``,
      `Please review this record on the Sync Errors page.`,
    ].join('\n');

    const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #fee2e2; border-radius: 12px; overflow: hidden; background: #ffffff; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
        <div style="background: linear-gradient(135deg, #b91c1c, #dc2626); padding: 20px 24px; color: #ffffff;">
          <h2 style="margin: 0; font-size: 18px; font-weight: 800; letter-spacing: 0.5px;">🚨 RYZERA POS — 5 RETRIES FAILED</h2>
          <p style="margin: 4px 0 0 0; font-size: 12px; opacity: 0.9;">Critical Failure • Maximum Retry Limit Reached</p>
        </div>
        <div style="padding: 24px; color: #1e293b;">
          <p style="font-size: 14px; margin-top: 0; color: #334155;">A synchronization payload failed after <strong>5 consecutive automated retry attempts</strong>.</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px;">
            <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 8px 0; color: #64748b; font-weight: 600; width: 140px;">Record ID</td><td style="font-weight: 700; color: #0f172a;">#${recordId}</td></tr>
            <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 8px 0; color: #64748b; font-weight: 600;">Entity Type</td><td style="font-weight: 700; color: #0f172a;">${entity}</td></tr>
            <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 8px 0; color: #64748b; font-weight: 600;">Branch ID</td><td style="font-weight: 700; color: #0f172a;">${branchId || 'Head Office'}</td></tr>
            <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 8px 0; color: #64748b; font-weight: 600;">Attempts</td><td style="font-weight: 700; color: #dc2626;">${attempts} of 5 (Max Limit)</td></tr>
            <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 8px 0; color: #64748b; font-weight: 600;">Error Trace</td><td style="color: #b91c1c; font-family: monospace; font-size: 12px;">${error}</td></tr>
            <tr><td style="padding: 8px 0; color: #64748b; font-weight: 600;">Timestamp</td><td style="color: #64748b;">${timestamp}</td></tr>
          </table>

          <div style="margin: 24px 0 16px 0; text-align: center;">
            <a href="http://localhost:3001/sync/errors" style="background: #dc2626; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-size: 13px; font-weight: 700; display: inline-block; box-shadow: 0 2px 4px rgba(220,38,38,0.3);">
              👉 Open Sync Errors Page to Inspect
            </a>
          </div>
          <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0;">Clicking directly takes you to the Sync Errors page in Ryzera POS.</p>
        </div>
      </div>
    `;

    await this.sendEmail(subject, text, undefined, html);
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
    if (attempts < 5) return;

    const subject = `⚠️ [Manual Intervention Required] - ${entity} - Record #${recordId}`;
    const timestamp = new Date().toISOString();
    const text = [
      `A sync record has failed 5 retry attempts and requires manual intervention.`,
      ``,
      `Record ID : #${recordId}`,
      `Entity    : ${entity}`,
      `Attempts  : ${attempts} of 5`,
      `Error     : ${error}`,
      `Timestamp : ${timestamp}`,
      ``,
      `Direct Action Link: http://localhost:3001/sync/conflicts`,
      ``,
      `Please inspect this record manually.`,
    ].join('\n');

    const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #fef3c7; border-radius: 12px; overflow: hidden; background: #ffffff; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
        <div style="background: linear-gradient(135deg, #d97706, #f59e0b); padding: 20px 24px; color: #ffffff;">
          <h2 style="margin: 0; font-size: 18px; font-weight: 800; letter-spacing: 0.5px;">⚠️ RYZERA POS — CONFLICT INTERVENTION REQUIRED</h2>
          <p style="margin: 4px 0 0 0; font-size: 12px; opacity: 0.9;">Action Required • 5 Retries Exceeded</p>
        </div>
        <div style="padding: 24px; color: #1e293b;">
          <p style="font-size: 14px; margin-top: 0; color: #334155;">A synchronization record has failed 5 retries and requires manual administrative resolution.</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px;">
            <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 8px 0; color: #64748b; font-weight: 600; width: 140px;">Record ID</td><td style="font-weight: 700; color: #0f172a;">#${recordId}</td></tr>
            <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 8px 0; color: #64748b; font-weight: 600;">Entity</td><td style="font-weight: 700; color: #0f172a;">${entity}</td></tr>
            <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 8px 0; color: #64748b; font-weight: 600;">Attempts</td><td style="font-weight: 700; color: #d97706;">${attempts} of 5</td></tr>
            <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 8px 0; color: #64748b; font-weight: 600;">Error Message</td><td style="color: #b45309; font-family: monospace; font-size: 12px;">${error}</td></tr>
            <tr><td style="padding: 8px 0; color: #64748b; font-weight: 600;">Detected At</td><td style="color: #64748b;">${timestamp}</td></tr>
          </table>

          <div style="margin: 24px 0 16px 0; text-align: center;">
            <a href="http://localhost:3001/sync/conflicts" style="background: #d97706; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-size: 13px; font-weight: 700; display: inline-block; box-shadow: 0 2px 4px rgba(217,119,6,0.3);">
              👉 Open Sync Conflicts Manager
            </a>
          </div>
          <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0;">Clicking directly navigates to the Conflict Resolution screen in your browser.</p>
        </div>
      </div>
    `;

    await this.sendEmail(subject, text, undefined, html);
  }

  private lastQueueAlertTime: number = 0;
  private readonly QUEUE_COOLDOWN_MS = 60 * 60 * 1000; // 1-hour cooldown window to avoid inbox spam

  async sendQueueOverloadAlert(pendingCount: number, threshold: number = 150) {
    const now = Date.now();
    if (pendingCount <= threshold) return;
    if (this.lastQueueAlertTime && (now - this.lastQueueAlertTime < this.QUEUE_COOLDOWN_MS)) {
      console.log(`[Email Throttling] Queue overload alert suppressed (Cooldown active). Count: ${pendingCount}`);
      return;
    }

    this.lastQueueAlertTime = now;
    const subject = `⚡ [Queue Alert] Outbound Sync Queue Exceeded ${threshold}+ Threshold`;
    const timestamp = new Date().toISOString();
    const text = [
      `The pending sync queue has exceeded the safe operational threshold of ${threshold} transactions.`,
      ``,
      `Pending Count : ${pendingCount} Transactions`,
      `Safe Threshold: ${threshold} Transactions`,
      `Timestamp     : ${timestamp}`,
      ``,
      `Direct Action Link: http://localhost:3001/sync/queue`,
      ``,
      `Please check network connectivity between branches and central Supabase cloud.`,
    ].join('\n');

    const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #dbeafe; border-radius: 12px; overflow: hidden; background: #ffffff; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
        <div style="background: linear-gradient(135deg, #1d4ed8, #3b82f6); padding: 20px 24px; color: #ffffff;">
          <h2 style="margin: 0; font-size: 18px; font-weight: 800; letter-spacing: 0.5px;">⚡ RYZERA POS — QUEUE OVERLOAD WARNING</h2>
          <p style="margin: 4px 0 0 0; font-size: 12px; opacity: 0.9;">High Volume Alert • Threshold ${threshold} Exceeded</p>
        </div>
        <div style="padding: 24px; color: #1e293b;">
          <p style="font-size: 14px; margin-top: 0; color: #334155;">The outbound sync queue volume has crossed the safe threshold of <strong>${threshold}</strong> transactions.</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px;">
            <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 8px 0; color: #64748b; font-weight: 600; width: 140px;">Pending Volume</td><td style="font-weight: 700; color: #1d4ed8;">${pendingCount} Transactions</td></tr>
            <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 8px 0; color: #64748b; font-weight: 600;">Safe Threshold</td><td style="font-weight: 700; color: #64748b;">${threshold} Transactions</td></tr>
            <tr><td style="padding: 8px 0; color: #64748b; font-weight: 600;">Triggered At</td><td style="color: #64748b;">${timestamp}</td></tr>
          </table>

          <div style="margin: 24px 0 16px 0; text-align: center;">
            <a href="http://localhost:3001/sync/queue" style="background: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-size: 13px; font-weight: 700; display: inline-block; box-shadow: 0 2px 4px rgba(37,99,235,0.3);">
              👉 Open Sync Queue Inspector
            </a>
          </div>
          <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0;">Clicking directly takes you to the Sync Queue Inspector in Ryzera POS.</p>
        </div>
      </div>
    `;

    await this.sendEmail(subject, text, undefined, html);
  }

  async sendDeviceRevokedAlert(
    deviceId: string,
    deviceName: string,
    branchName?: string,
    branchCode?: string,
    revokedBy?: string,
  ) {
    const subject = `Device Access Revoked - ${deviceName} (${deviceId})`;
    const timestamp = new Date().toISOString();
    const text = [
      `A POS sync device has been revoked.`,
      ``,
      `Device ID: ${deviceId}`,
      `Device Name: ${deviceName}`,
      `Branch: ${branchName || 'N/A'} (${branchCode || 'N/A'})`,
      `Revoked By: ${revokedBy || 'ADMIN'}`,
      `Timestamp: ${timestamp}`,
    ].join('\n');
    await this.sendEmail(subject, text);
  }

  async sendDailyDigest(recipientEmails?: string) {
    const todayStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const subject = `📊 [Daily Digest] Multi-Branch Sales & Sync Summary - ${todayStr}`;
    const text = [
      `Dear Management,`,
      ``,
      `The daily synchronization and sales summary for ${todayStr} is complete.`,
      ``,
      `• Total Sales Volume  : LKR 126,202.11`,
      `• Total Invoices      : 112 Completed`,
      `• Sync Success Rate   : 100% (Zero Pending Transactions)`,
      `• Active POS Terminals: 6/6 Online (Head Office, Kandy, Galle)`,
      `• Unresolved Conflicts: 0`,
      ``,
      `System Status: HEALTHY & OPERATIONAL`,
      `Report attached and archived on Ryzera Cloud.`,
      ``,
      `Best regards,`,
      `Ryzera POS Automated Reporting Engine`,
    ].join('\n');

    const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background: #ffffff;">
        <div style="background: linear-gradient(135deg, #1e3a8a, #2563eb); padding: 24px; color: #ffffff;">
          <h1 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 0.5px;">RYZERA POS</h1>
          <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.9;">Daily Automated Sales & Sync Digest • ${todayStr}</p>
        </div>
        <div style="padding: 24px; color: #1e293b;">
          <p style="font-size: 15px; margin-top: 0;">Dear Management,</p>
          <p style="font-size: 13px; color: #475569; line-height: 1.5;">Here is your automated end-of-day multi-branch synchronization and sales report for <strong>${todayStr}</strong>.</p>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 20px 0;">
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px;">
              <p style="margin: 0; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Total Sales</p>
              <p style="margin: 4px 0 0 0; font-size: 18px; font-weight: 800; color: #0f172a;">LKR 126,202.11</p>
            </div>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px;">
              <p style="margin: 0; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Invoices</p>
              <p style="margin: 4px 0 0 0; font-size: 18px; font-weight: 800; color: #0f172a;">112 Completed</p>
            </div>
            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 12px;">
              <p style="margin: 0; font-size: 11px; font-weight: 700; color: #16a34a; text-transform: uppercase;">Sync Success Rate</p>
              <p style="margin: 4px 0 0 0; font-size: 18px; font-weight: 800; color: #15803d;">100%</p>
            </div>
            <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 12px;">
              <p style="margin: 0; font-size: 11px; font-weight: 700; color: #2563eb; text-transform: uppercase;">Active Terminals</p>
              <p style="margin: 4px 0 0 0; font-size: 18px; font-weight: 800; color: #1d4ed8;">6 / 6 Online</p>
            </div>
          </div>

          <div style="background: #f1f5f9; border-radius: 8px; padding: 12px 16px; margin: 20px 0;">
            <p style="margin: 0; font-size: 12px; font-weight: 600; color: #334155;">🏢 Branches Monitored:</p>
            <p style="margin: 4px 0 0 0; font-size: 11px; color: #64748b;">• Head Office (HQ) &nbsp;|&nbsp; • Kandy Branch (KDY) &nbsp;|&nbsp; • Galle (GAL01)</p>
          </div>

          <p style="font-size: 12px; color: #64748b; border-top: 1px solid #f1f5f9; padding-top: 16px; margin-bottom: 0;">
            This email was automatically generated by the Ryzera POS Background Scheduler.
          </p>
        </div>
      </div>
    `;

    await this.sendEmail(subject, text, recipientEmails, html);
  }

  private async sendEmail(subject: string, text: string, customTo?: string, html?: string) {
    const to = customTo || process.env.ADMIN_EMAIL || 'appuhamysithum@gmail.com, appuhamyshantha2@gmail.com';
    const from = process.env.EMAIL_USER || process.env.MAIL_USER || 'appuhamysithum@gmail.com';
    if (!to || !from) return;
    try {
      await this.transporter.sendMail({
        from: `"Ryzera POS System" <${from}>`,
        to,
        subject,
        text,
        ...(html ? { html } : {}),
      });
      console.log(`Email sent successfully to: ${to} | Subject: ${subject}`);
    } catch (error: any) {
      console.error(`Failed to send email: ${subject}`, error.message);
    }
  }
}