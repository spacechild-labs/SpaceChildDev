import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/Common/ThemeProvider";
import { ProjectProvider } from "@/contexts/ProjectContext";
import { AgentProvider } from "@/contexts/AgentContext";
import { QEProvider } from "@/contexts/QEContext";
import { useAuth } from "@/hooks/useAuth";
import { Switch, Route } from "wouter";
import Landing from "@/pages/Landing";
import IDE from "@/pages/IDE";
import SSOCallback from "@/pages/SSOCallback";
import ResetPassword from "@/pages/ResetPassword";
import VerifyEmail from "@/pages/VerifyEmail";
import { PWAInstallPrompt, OfflineIndicator, UpdateBanner } from "@/components/pwa";
import { ErrorBoundary } from "react-error-boundary";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center max-w-md p-6">
        <h2 className="text-xl font-bold mb-2 text-destructive">Application Error</h2>
        <p className="text-muted-foreground mb-4 text-sm">
          {error.message || "An unexpected error occurred"}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
        >
          Reload Application
        </button>
      </div>
    </div>
  );
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Loading SpaceChildDev...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/sso/callback" component={SSOCallback} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/verify-email" component={VerifyEmail} />
      {!isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/ide" component={Landing} />
        </>
      ) : (
        <>
          <Route path="/" component={IDE} />
          <Route path="/ide" component={IDE} />
          <Route path="/project/:id" component={IDE} />
        </>
      )}
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="spacechilddev-theme">
        <ProjectProvider>
          <AgentProvider>
            <QEProvider>
              <TooltipProvider>
                <Toaster />
                <ErrorBoundary FallbackComponent={ErrorFallback}>
                  <Router />
                  <PWAInstallPrompt appName="SpaceChildDev" />
                  <OfflineIndicator />
                  <UpdateBanner />
                </ErrorBoundary>
              </TooltipProvider>
            </QEProvider>
          </AgentProvider>
        </ProjectProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
