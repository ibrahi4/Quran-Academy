import { setRequestLocale } from "next-intl/server";
import TeacherSessionsContent from "@/components/teacher/sessions/TeacherSessionsContent";

export default function TeacherSessionsPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  return <TeacherSessionsContent />;
}
