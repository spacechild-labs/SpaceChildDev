import { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";

export function UpdateBanner() {
  const [showUpdate, setShowUpdate] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                setShowUpdate(true);
              }
            });
          }
        });
      });
    }
  }, []);

  const handleUpdate = () => {
    window.location.reload();
  };

  if (!showUpdate) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-card border rounded-lg shadow-lg p-4 z-50">
      <div className="flex items-center gap-3">
        <RefreshCw className="w-5 h-5 text-primary" />
        <div className="flex-1">
          <p className="text-sm font-medium">Update available</p>
          <p className="text-xs text-muted-foreground">Refresh to get the latest version</p>
        </div>
        <button
          onClick={handleUpdate}
          className="px-3 py-1.5 bg-primary text-primary-foreground rounded text-sm font-medium hover:bg-primary/90"
        >
          Refresh
        </button>
      </div>
    </div>
  );
}
