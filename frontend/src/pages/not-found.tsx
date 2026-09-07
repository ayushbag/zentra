import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-center">
      <p className="text-6xl font-black text-primary/25">404</p>
      <h1 className="mt-3 text-xl font-bold text-foreground">Page not found</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        The page you're looking for doesn't exist or was moved.
      </p>
      <Link to="/" className="mt-6">
        <Button>Back to my workspaces</Button>
      </Link>
    </div>
  );
}
