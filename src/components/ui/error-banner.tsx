import { Card, CardContent } from "./card";

interface ErrorBannerProps {
  message: string;
}

export function ErrorBanner({ message }: ErrorBannerProps) {
  return (
    <Card className="border-destructive">
      <CardContent className="p-4 text-destructive">{message}</CardContent>
    </Card>
  );
}
