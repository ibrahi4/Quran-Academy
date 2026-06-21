import { setRequestLocale } from "next-intl/server";
import TeacherDashboardContent from "@/components/teacher/dashboard/TeacherDashboardContent";

export default function TeacherDashboardPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  return <TeacherDashboardContent />;
}
