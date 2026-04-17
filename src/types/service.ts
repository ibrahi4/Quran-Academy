export interface ServiceDetail {
  id: string;
  slug: string;
  icon: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  features: string[];
  targetAudience: string[];
  color: "primary" | "secondary" | "accent";
  curriculum?: CurriculumItem[];
}

export interface CurriculumItem {
  level: string;
  title: string;
  topics: string[];
  duration: string;
}