"use client";

import { useState } from "react";
import AuthGuard from "@/components/auth/AuthGuard";
import { useLocale } from "@/hooks/useLocale";
import { cn } from "@/lib/utils";
import StudentSidebar from "./StudentSidebar";
import StudentHeader from "./StudentHeader";

export default function StudentShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isRTL } = useLocale();

  return (
    <AuthGuard allowedRoles={["STUDENT", "ADMIN"]}>
      <div className="min-h-screen bg-sand-50">
        <StudentSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className={cn("flex flex-col min-h-screen", isRTL ? "lg:mr-[272px]" : "lg:ml-[272px]")}>
          <StudentHeader onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}