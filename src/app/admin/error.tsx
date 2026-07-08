"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error("Admin error:", error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="mx-auto max-w-md">
        <CardHeader className="items-center">
          <AlertTriangle className="h-12 w-12 text-destructive mb-2" />
          <CardTitle>Admin Error</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            {error.message || "An unexpected error occurred."}
          </p>
          {error.digest && (
            <p className="text-xs text-muted-foreground text-center font-mono">
              Error ID: {error.digest}
            </p>
          )}
          <div className="flex justify-center gap-3">
            <Button onClick={reset} variant="outline">
              Try again
            </Button>
            <Button variant="outline" onClick={() => router.push("/admin")}>
              Admin dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
