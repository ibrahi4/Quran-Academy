import { Injectable, Logger } from "@nestjs/common";
import { Resend } from "resend";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private resend: Resend;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get("email.resendApiKey");
    if (apiKey && apiKey !== "re_xxxxxxxxxxxx") {
      this.resend = new Resend(apiKey);
    }
  }

  async sendBookingConfirmation(email: string, name: string, date?: string) {
    if (!this.resend) {
      this.logger.warn("Resend not configured - skipping email");
      return;
    }

    try {
      await this.resend.emails.send({
        from: "Ibrahim Quran Academy <noreply@ibrahimquranacademy.com>",
        to: email,
        subject: "Booking Confirmed - Ibrahim Quran Academy",
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
            <h1 style="color:#0D4F4F;">Assalamu Alaikum ${name}!</h1>
            <p>Your trial session has been booked successfully.</p>
            ${date ? `<p><strong>Date:</strong> ${date}</p>` : ""}
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
      this.logger.warn("Resend not configured - skipping email");
      return;
    }

    try {
      await this.resend.emails.send({
        from: "Ibrahim Quran Academy <noreply@ibrahimquranacademy.com>",
        to: "admin@ibrahimquranacademy.com",
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
      this.logger.error("Failed to send contact notification", error);
    }
  }
}
