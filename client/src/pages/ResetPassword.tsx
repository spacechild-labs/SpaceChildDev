export default function ResetPassword() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-bold mb-4">Reset Password</h1>
        <p className="text-muted-foreground mb-4">
          Password reset is handled through Space Child Auth.
        </p>
        <a 
          href="https://dream.spacechild.love/reset-password" 
          className="text-primary hover:underline"
        >
          Go to Space Child Auth
        </a>
      </div>
    </div>
  );
}
