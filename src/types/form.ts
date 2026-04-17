export interface ContactFormData {
  name: string;
  email: string;
  whatsapp: string;
  message: string;
}

export interface BookingFormData {
  name: string;
  email: string;
  whatsapp: string;
  country: string;
  service: string;
  studentType: "self" | "child" | "family";
  preferredTime?: string;
  message?: string;
}

export interface NewsletterFormData {
  email: string;
}

export type FormStatus = "idle" | "loading" | "success" | "error";