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