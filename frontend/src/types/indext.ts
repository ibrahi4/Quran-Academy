// ===== Navigation Types =====
export interface NavLink {
  label: string;
  href: string;
  children?: NavLink[];
}

// ===== Service Types =====
export interface Service {
  id: string;
  slug: string;
  icon: string;
  title: string;
  shortDescription: string;
  fullDescription?: string;
  features?: string[];
  targetAudience?: string[];
  color: "primary" | "secondary" | "accent";
}

// ===== Testimonial Types =====
export interface Testimonial {
  id: number;
  name: string;
  country: string;
  countryCode: string;
  role: string;
  rating: number;
  text: string;
  image: string;
}

// ===== Pricing Types =====
export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  period: string;
  sessions: number;
  duration: string;
  features: string[];
  popular: boolean;
}

// ===== FAQ Types =====
export interface FAQ {
  question: string;
  answer: string;
}

// ===== Form Types =====
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