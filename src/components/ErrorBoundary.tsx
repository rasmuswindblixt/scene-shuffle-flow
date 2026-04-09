import { Component, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface Props {
  children: ReactNode;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-8 space-y-4 bg-card border border-border rounded-lg">
          <AlertCircle className="w-12 h-12 text-destructive" />
          <h3 className="text-lg font-semibold">Something went wrong</h3>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            {this.props.fallbackMessage || "An unexpected error occurred. Please try again."}
          </p>
          {this.state.error && (
            <pre className="text-xs text-muted-foreground bg-muted p-2 rounded max-w-md overflow-auto">
              {this.state.error.message}
            </pre>
          )}
          <Button onClick={this.handleReset} variant="outline">
            Try Again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
