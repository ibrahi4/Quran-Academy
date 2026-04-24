export interface NavLink {
  label: string;
  href: string;
  children?: NavLink[];
}

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

export interface FAQ {
  question: string;
  answer: string;
}

export type FormStatus = "idle" | "loading" | "success" | "error";
