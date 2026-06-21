import { setRequestLocale } from "next-intl/server";
import TeacherEarningsContent from "@/components/teacher/earnings/TeacherEarningsContent";

export default function TeacherEarningsPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  return <TeacherEarningsContent />;
}
