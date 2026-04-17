import { cn } from "@/lib/utils";

interface SectionWrapperProps {
  children: React.ReactNode;
  className?: string;
  background?: "white" | "sand" | "primary" | "gradient";
  pattern?: boolean;
  id?: string;
}

export default function SectionWrapper({
  children,
  className,
  background = "white",
  pattern = false,
  id,
}: SectionWrapperProps) {
  const bgClasses = {
    white: "bg-white",
    sand: "bg-sand-50",
    primary: "bg-primary text-white",
    gradient: "bg-hero-gradient text-white",
  };

  return (
    <section
      id={id}
      className={cn(
        "section-padding relative overflow-hidden",
        bgClasses[background],
        pattern && "pattern-overlay",
        className
      )}
    >
      <div className="container-custom relative z-10">{children}</div>
    </section>
  );
}