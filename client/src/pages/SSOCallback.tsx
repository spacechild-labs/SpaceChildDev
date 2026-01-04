import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";

export default function SSOCallback() {
  const [, setLocation] = useLocation();
  const { verifySSOToken } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      verifySSOToken(token)
        .then(() => {
          setLocation("/");
        })
        .catch((err) => {
          setError(err.message || "SSO verification failed");
        });
    } else {
      setError("No token provided");
    }
  }, [verifySSOToken, setLocation]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-xl font-bold text-destructive mb-2">Authentication Error</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <a href="/" className="text-primary hover:underline">
            Return to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent mx-auto mb-4" />
        <p className="text-muted-foreground">Completing authentication...</p>
      </div>
    </div>
  );
}
