// apps/pos-api-service/src/mail/mail.service.ts
import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

export interface SendMailAttachment {
    filename: string;
    content: Buffer;
    contentType?: string;
}

export interface SendMailOptions {
    to: string;
    subject: string;
    text?: string;
    html?: string;
    attachments?: SendMailAttachment[];
}

@Injectable()
export class MailService {
    private readonly logger = new Logger(MailService.name);

    // MAIL_HOST/MAIL_PORT/MAIL_SECURE are optional — if not set, falls back
    // to Gmail's service preset (works with a Gmail address + app password,
    // which is what MAIL_USER/MAIL_PASS in .env are already set up for).
    private readonly transporter = nodemailer.createTransport(
        process.env.MAIL_HOST
            ? {
                host: process.env.MAIL_HOST,
                port: Number(process.env.MAIL_PORT ?? 587),
                secure: process.env.MAIL_SECURE === 'true',
                auth: {
                    user: process.env.MAIL_USER,
                    pass: process.env.MAIL_PASS,
                },
            }
            : {
                service: 'gmail',
                auth: {
                    user: process.env.MAIL_USER,
                    pass: process.env.MAIL_PASS,
                },
            },
    );

    async sendMail(options: SendMailOptions): Promise<void> {
        await this.transporter.sendMail({
            from: `"Ryzera POS Reports" <${process.env.MAIL_USER}>`,
            to: options.to,
            subject: options.subject,
            text: options.text,
            html: options.html,
            attachments: options.attachments,
        });
        this.logger.log(`Mail sent to ${options.to}: "${options.subject}"`);
    }
}