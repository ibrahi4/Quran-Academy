import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private transporter: nodemailer.Transporter | null = null;
  private fromName: string;
  private fromEmail: string;
  private adminEmail: string;
  private frontendUrl: string;

  constructor(private configService: ConfigService) {
    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    this.fromName = process.env.SMTP_FROM_NAME || 'Tajwedo Academy';
    this.fromEmail = process.env.SMTP_FROM_EMAIL || user || 'noreply@example.com';
    this.adminEmail = process.env.ADMIN_EMAIL || this.fromEmail;
    this.frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: process.env.SMTP_SECURE === 'true',
        auth: { user, pass },
      });
      this.logger.log(`Email transporter configured: ${host}:${port}`);
    } else {
      this.logger.warn('SMTP not configured - emails will be logged only');
    }
  }

  private async send(options: EmailOptions): Promise<boolean> {
    if (!this.transporter) {
      this.logger.warn(`[EMAIL SIMULATED] To: ${options.to} | Subject: ${options.subject}`);
      return false;
    }

    try {
      await this.transporter.sendMail({
        from: `"${this.fromName}" <${this.fromEmail}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
      });
      this.logger.log(`Email sent to ${options.to}: ${options.subject}`);
      return true;
    } catch (error: any) {
      this.logger.error(`Failed to send email to ${options.to}: ${error.message}`);
      return false;
    }
  }

  // ============================================
  // TEMPLATE: Email Wrapper
  // ============================================
  private wrapEmail(content: string, preheader = ''): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Tajwedo Academy</title>
</head>
<body style="margin:0;padding:0;background-color:#FAFAF7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
  <span style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${preheader}</span>
  
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#FAFAF7;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.06);">
          
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0D4F4F 0%,#0a3d3d 100%);padding:32px 40px;text-align:center;">
              <div style="display:inline-block;width:56px;height:56px;background:rgba(200,169,110,0.2);border:2px solid #C8A96E;border-radius:14px;line-height:56px;text-align:center;font-size:24px;margin-bottom:12px;">📖</div>
              <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;letter-spacing:-0.3px;">Tajwedo Academy</h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.7);font-size:13px;">Learn Quran with Excellence</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding:40px;">
              ${content}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background:#FAFAF7;padding:24px 40px;border-top:1px solid #eee;text-align:center;">
              <p style="margin:0 0 8px;color:#888;font-size:12px;line-height:1.5;">
                Need help? Email us at <a href="mailto:${this.adminEmail}" style="color:#0D4F4F;text-decoration:none;font-weight:600;">${this.adminEmail}</a>
              </p>
              <p style="margin:0;color:#aaa;font-size:11px;">
                © ${new Date().getFullYear()} Tajwedo Academy. All rights reserved.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }

  // ============================================
  // 1. WELCOME EMAIL (after Trial Booking)
  // ============================================
  async sendTrialWelcomeEmail(data: {
    email: string;
    name: string;
    tempPassword: string;
    setupToken: string;
    bookingDate?: string;
  }): Promise<boolean> {
    const setupUrl = `${this.frontendUrl}/en/auth/setup-password?token=${data.setupToken}`;

    const content = `
      <h2 style="margin:0 0 16px;color:#0D4F4F;font-size:24px;font-weight:700;">Assalamu Alaikum, ${data.name} 👋</h2>
      <p style="margin:0 0 20px;color:#555;font-size:15px;line-height:1.7;">
        Thank you for booking your <strong style="color:#0D4F4F;">free trial session</strong> with us! We're excited to help you on your Quran learning journey.
      </p>

      <div style="background:#f0f9f9;border-left:4px solid #0D4F4F;border-radius:8px;padding:20px;margin:24px 0;">
        <h3 style="margin:0 0 12px;color:#0D4F4F;font-size:16px;font-weight:700;">📋 What's Next?</h3>
        <ol style="margin:0;padding-left:20px;color:#444;font-size:14px;line-height:1.8;">
          <li>Our team will <strong>contact you within 24 hours</strong> to confirm your trial session time</li>
          <li>You'll receive a meeting link before your session</li>
          <li>Login to your dashboard to track your progress</li>
        </ol>
      </div>

      <h3 style="margin:32px 0 16px;color:#0D4F4F;font-size:18px;font-weight:700;">🔐 Your Account is Ready</h3>
      <p style="margin:0 0 16px;color:#555;font-size:14px;line-height:1.6;">
        We've created an account for you. Please set your password to access your dashboard:
      </p>

      <div style="background:#fff;border:2px solid #C8A96E;border-radius:12px;padding:20px;margin:16px 0;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:6px 0;color:#666;font-size:13px;font-weight:600;width:120px;">Email:</td>
            <td style="padding:6px 0;color:#0D4F4F;font-size:14px;font-weight:700;">${data.email}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#666;font-size:13px;font-weight:600;">Temp Password:</td>
            <td style="padding:6px 0;">
              <code style="background:#FAFAF7;padding:4px 10px;border-radius:6px;color:#0D4F4F;font-size:14px;font-weight:700;font-family:monospace;">${data.tempPassword}</code>
            </td>
          </tr>
        </table>
      </div>

      <div style="text-align:center;margin:32px 0;">
        <a href="${setupUrl}" style="display:inline-block;padding:16px 40px;background:linear-gradient(135deg,#0D4F4F,#0a3d3d);color:#fff;text-decoration:none;border-radius:12px;font-weight:700;font-size:15px;box-shadow:0 4px 14px rgba(13,79,79,0.3);">
          🔑 Set Your Password & Login
        </a>
      </div>

      <p style="margin:24px 0 0;color:#888;font-size:12px;text-align:center;line-height:1.5;">
        This link expires in 7 days. After setting your password, you can login normally with your email.
      </p>
    `;

    return this.send({
      to: data.email,
      subject: `Welcome to Tajwedo Academy! 🎉 Your trial is being scheduled`,
      html: this.wrapEmail(content, `Welcome ${data.name}! Your trial booking has been received.`),
    });
  }

  // ============================================
  // 2. TRIAL CONFIRMED (Admin assigned teacher + time)
  // ============================================
  async sendTrialConfirmedEmail(data: {
    email: string;
    name: string;
    sessionDate: string;
    sessionTime: string;
    teacherName: string;
    meetingLink: string;
    duration: number;
  }): Promise<boolean> {
    const dashboardUrl = `${this.frontendUrl}/en/student/dashboard`;

    const content = `
      <h2 style="margin:0 0 16px;color:#0D4F4F;font-size:24px;font-weight:700;">🎉 Your Trial Session is Confirmed!</h2>
      <p style="margin:0 0 24px;color:#555;font-size:15px;line-height:1.7;">
        Assalamu Alaikum <strong>${data.name}</strong>, great news! We've scheduled your free trial session.
      </p>

      <div style="background:linear-gradient(135deg,#0D4F4F 0%,#0a3d3d 100%);border-radius:12px;padding:24px;margin:24px 0;color:#fff;">
        <h3 style="margin:0 0 16px;color:#C8A96E;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">📅 Session Details</h3>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:8px 0;color:rgba(255,255,255,0.7);font-size:13px;width:100px;">Date:</td>
            <td style="padding:8px 0;color:#fff;font-size:15px;font-weight:600;">${data.sessionDate}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:rgba(255,255,255,0.7);font-size:13px;">Time:</td>
            <td style="padding:8px 0;color:#fff;font-size:15px;font-weight:600;">${data.sessionTime}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:rgba(255,255,255,0.7);font-size:13px;">Duration:</td>
            <td style="padding:8px 0;color:#fff;font-size:15px;font-weight:600;">${data.duration} minutes</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:rgba(255,255,255,0.7);font-size:13px;">Teacher:</td>
            <td style="padding:8px 0;color:#fff;font-size:15px;font-weight:600;">Sheikh ${data.teacherName}</td>
          </tr>
        </table>
      </div>

      <div style="text-align:center;margin:32px 0;">
        <a href="${data.meetingLink}" style="display:inline-block;padding:16px 40px;background:#10b981;color:#fff;text-decoration:none;border-radius:12px;font-weight:700;font-size:15px;box-shadow:0 4px 14px rgba(16,185,129,0.3);">
          🎥 Join Meeting
        </a>
      </div>

      <div style="background:#fff7ed;border-left:4px solid #f59e0b;border-radius:8px;padding:16px;margin:24px 0;">
        <p style="margin:0;color:#92400e;font-size:13px;line-height:1.6;">
          <strong>💡 Tips:</strong><br>
          • Join 5 minutes before your session<br>
          • Have your Mushaf ready<br>
          • Test your microphone and camera<br>
          • Choose a quiet environment
        </p>
      </div>

      <div style="text-align:center;margin:24px 0 0;">
        <a href="${dashboardUrl}" style="color:#0D4F4F;text-decoration:none;font-weight:600;font-size:13px;">
          → Go to your dashboard
        </a>
      </div>
    `;

    return this.send({
      to: data.email,
      subject: `✅ Trial Confirmed: ${data.sessionDate} with Sheikh ${data.teacherName}`,
      html: this.wrapEmail(content, `Your trial session is confirmed for ${data.sessionDate}`),
    });
  }

  // ============================================
  // 3. PASSWORD RESET (existing functionality)
  // ============================================
  async sendPasswordResetEmail(email: string, name: string, resetUrl: string): Promise<boolean> {
    const content = `
      <h2 style="margin:0 0 16px;color:#0D4F4F;font-size:24px;font-weight:700;">🔐 Reset Your Password</h2>
      <p style="margin:0 0 24px;color:#555;font-size:15px;line-height:1.7;">
        Assalamu Alaikum <strong>${name}</strong>, we received a request to reset your password.
      </p>

      <div style="text-align:center;margin:32px 0;">
        <a href="${resetUrl}" style="display:inline-block;padding:16px 40px;background:linear-gradient(135deg,#0D4F4F,#0a3d3d);color:#fff;text-decoration:none;border-radius:12px;font-weight:700;font-size:15px;">
          Reset Password
        </a>
      </div>

      <p style="margin:24px 0 0;color:#888;font-size:13px;text-align:center;line-height:1.5;">
        This link expires in 1 hour. If you didn't request this, please ignore this email.
      </p>
    `;

    return this.send({
      to: email,
      subject: 'Reset Your Password - Tajwedo Academy',
      html: this.wrapEmail(content, 'Reset your password link inside'),
    });
  }

  // ============================================
  // 4. NEW BOOKING NOTIFICATION (to Admin)
  // ============================================
  async sendBookingConfirmation(email: string, name: string, date?: string): Promise<boolean> {
    // Send notification to admin
    const adminContent = `
      <h2 style="margin:0 0 16px;color:#0D4F4F;font-size:22px;font-weight:700;">🔔 New Trial Booking</h2>
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAFAF7;border-radius:8px;padding:16px;">
        <tr>
          <td style="padding:8px 0;color:#666;font-size:13px;font-weight:600;width:100px;">Name:</td>
          <td style="padding:8px 0;color:#0D4F4F;font-size:14px;font-weight:700;">${name}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#666;font-size:13px;font-weight:600;">Email:</td>
          <td style="padding:8px 0;color:#444;font-size:14px;">${email}</td>
        </tr>
        ${date ? `
        <tr>
          <td style="padding:8px 0;color:#666;font-size:13px;font-weight:600;">Preferred:</td>
          <td style="padding:8px 0;color:#444;font-size:14px;">${date}</td>
        </tr>` : ''}
      </table>
      <div style="text-align:center;margin:24px 0 0;">
        <a href="${this.frontendUrl}/en/admin/bookings" style="display:inline-block;padding:12px 28px;background:#0D4F4F;color:#fff;text-decoration:none;border-radius:10px;font-weight:600;font-size:14px;">
          Review Booking →
        </a>
      </div>
    `;

    await this.send({
      to: this.adminEmail,
      subject: `🔔 New Trial Booking: ${name}`,
      html: this.wrapEmail(adminContent, `New trial booking from ${name}`),
    });

    return true;
  }

  // ============================================
  // 5. CONTACT FORM (to Admin)
  // ============================================
  async sendContactNotification(name: string, email: string, message: string): Promise<boolean> {
    const content = `
      <h2 style="margin:0 0 16px;color:#0D4F4F;font-size:22px;font-weight:700;">📩 New Contact Message</h2>
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAFAF7;border-radius:8px;padding:16px;margin-bottom:16px;">
        <tr>
          <td style="padding:8px 0;color:#666;font-size:13px;font-weight:600;width:80px;">From:</td>
          <td style="padding:8px 0;color:#0D4F4F;font-size:14px;font-weight:700;">${name}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#666;font-size:13px;font-weight:600;">Email:</td>
          <td style="padding:8px 0;color:#444;font-size:14px;">${email}</td>
        </tr>
      </table>
      <h3 style="margin:0 0 12px;color:#0D4F4F;font-size:15px;">Message:</h3>
      <p style="background:#FAFAF7;padding:16px;border-radius:8px;color:#444;font-size:14px;line-height:1.7;margin:0;">
        ${message.replace(/\n/g, '<br>')}
      </p>
    `;

    return this.send({
      to: this.adminEmail,
      subject: `📩 New Contact: ${name}`,
      html: this.wrapEmail(content, `New message from ${name}`),
    });
  }
}