"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Auth error:", error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="mx-auto max-w-sm">
        <CardHeader className="items-center">
          <AlertTriangle className="h-10 w-10 text-destructive mb-2" />
          <CardTitle>Authentication Error</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            {error.message || "Failed to authenticate. Please try again."}
          </p>
          <div className="flex justify-center gap-3">
            <Button onClick={reset} variant="outline" size="sm">
              Try again
            </Button>
            <Button asChild size="sm">
              <a href="/login">Back to login</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
