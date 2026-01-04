export default function VerifyEmail() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-bold mb-4">Verify Email</h1>
        <p className="text-muted-foreground mb-4">
          Email verification is handled through Space Child Auth.
        </p>
        <a 
          href="https://dream.spacechild.love/verify-email" 
          className="text-primary hover:underline"
        >
          Go to Space Child Auth
        </a>
      </div>
    </div>
  );
}
