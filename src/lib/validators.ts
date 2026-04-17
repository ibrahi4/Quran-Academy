import { z } from "zod";

export const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  whatsapp: z.string().min(8, "Please enter a valid WhatsApp number"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export const bookingFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  whatsapp: z.string().min(8, "Please enter a valid WhatsApp number"),
  country: z.string().min(2, "Please enter your country"),
  service: z.string().min(1, "Please select a service"),
  studentType: z.enum(["self", "child", "family"]),
  preferredTime: z.string().optional(),
  message: z.string().optional(),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;
export type BookingFormData = z.infer<typeof bookingFormSchema>;
