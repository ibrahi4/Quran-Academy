import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import SetupPasswordContent from "@/components/auth/SetupPasswordContent";

export const dynamic = "force-dynamic";

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-sand-50">
      <div className="text-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-4" />
        <p className="text-gray-500 text-sm">Loading...</p>
      </div>
    </div>
  );
}

export default function SetupPasswordPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SetupPasswordContent />
    </Suspense>
  );
}