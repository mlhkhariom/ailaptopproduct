import { Component, type ReactNode } from "react";
import { RefreshCw, Home, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props { children: ReactNode; }
interface State { hasError: boolean; error?: Error; }

class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: any) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center max-w-md">
          <div className="h-20 w-20 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="h-10 w-10 text-destructive" />
          </div>
          <h1 className="text-2xl font-black mb-2">Something went wrong</h1>
          <p className="text-muted-foreground text-sm mb-2">An unexpected error occurred. Please try refreshing the page.</p>
          {this.state.error && (
            <p className="text-xs text-muted-foreground bg-muted rounded-lg px-3 py-2 mb-6 font-mono text-left overflow-auto max-h-24">
              {this.state.error.message}
            </p>
          )}
          <div className="flex gap-3 justify-center">
            <Button onClick={() => window.location.reload()} className="gap-2">
              <RefreshCw className="h-4 w-4" /> Refresh Page
            </Button>
            <Button variant="outline" onClick={() => { this.setState({ hasError: false }); window.location.href = '/'; }} className="gap-2">
              <Home className="h-4 w-4" /> Go Home
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-6">
            If this keeps happening, contact us at{" "}
            <a href="tel:+919893496163" className="text-primary">+91 98934 96163</a>
          </p>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
