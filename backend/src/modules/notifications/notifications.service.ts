import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private resend: Resend;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get('email.resendApiKey');
    if (apiKey && apiKey !== 're_xxxxxxxxxxxx') {
      this.resend = new Resend(apiKey);
    }
  }

  async sendBookingConfirmation(email: string, name: string, date?: string) {
    if (!this.resend) {
      this.logger.warn('Resend not configured - skipping email');
      return;
    }

    try {
      await this.resend.emails.send({
        from: 'Ibrahim Quran Academy <noreply@ibrahimquranacademy.com>',
        to: email,
        subject: 'Booking Confirmed - Ibrahim Quran Academy',
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
            <h1 style="color:#0D4F4F;">Assalamu Alaikum ${name}!</h1>
            <p>Your trial session has been booked successfully.</p>
            ${date ? `<p><strong>Date:</strong> ${date}</p>` : ''}
            <p>We will contact you shortly to confirm the details.</p>
            <br/>
            <p style="color:#C8A96E;font-weight:bold;">Ibrahim Quran Academy</p>
          </div>
        `,
      });
      this.logger.log(`Booking email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${email}`, error);
    }
  }

  async sendContactNotification(name: string, email: string, message: string) {
    if (!this.resend) {
      this.logger.warn('Resend not configured - skipping email');
      return;
    }

    try {
      await this.resend.emails.send({
        from: 'Ibrahim Quran Academy <noreply@ibrahimquranacademy.com>',
        to: 'admin@ibrahimquranacademy.com',
        subject: `New Contact: ${name}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
            <h2 style="color:#0D4F4F;">New Contact Message</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Message:</strong></p>
            <p style="background:#f5f5f5;padding:15px;border-radius:8px;">${message}</p>
          </div>
        `,
      });
      this.logger.log(`Contact notification sent for ${email}`);
    } catch (error) {
      this.logger.error('Failed to send contact notification', error);
    }
  }

  async sendPasswordResetEmail(email: string, name: string, resetUrl: string) {
    if (!this.resend) {
      this.logger.warn(`Resend not configured - Reset URL for ${email}: ${resetUrl}`);
      return;
    }

    try {
      await this.resend.emails.send({
        from: 'Ibrahim Quran Academy <noreply@ibrahimquranacademy.com>',
        to: email,
        subject: 'Reset Your Password - Ibrahim Quran Academy',
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:40px 20px;">
            <div style="text-align:center;margin-bottom:30px;">
              <h1 style="color:#0D4F4F;margin:0;">Ibrahim Quran Academy</h1>
            </div>
            <h2 style="color:#333;">Assalamu Alaikum ${name},</h2>
            <p style="color:#555;line-height:1.6;">
              We received a request to reset your password. Click the button below to create a new password:
            </p>
            <div style="text-align:center;margin:30px 0;">
              <a href="${resetUrl}" style="display:inline-block;padding:14px 32px;background-color:#0D4F4F;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:bold;font-size:16px;">
                Reset Password
              </a>
            </div>
            <p style="color:#888;font-size:14px;line-height:1.6;">
              This link will expire in 1 hour. If you didn't request this, please ignore this email.
            </p>
            <hr style="border:none;border-top:1px solid #eee;margin:30px 0;" />
            <p style="color:#C8A96E;font-weight:bold;text-align:center;">Ibrahim Quran Academy</p>
          </div>
        `,
      });
      this.logger.log(`Password reset email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send reset email to ${email}`, error);
    }
  }
}
