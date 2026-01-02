// src/components/ErrorBoundary.tsx
import React from "react";

type Props = {
    children: React.ReactNode;
    fallback?: (info: { error: unknown; componentStack?: string }) => React.ReactNode;
};

type State = { error: unknown; componentStack?: string };

export class ErrorBoundary extends React.Component<Props, State> {
    state: State = { error: null };

    static getDerivedStateFromError(error: unknown): State {
        return { error };
    }

    componentDidCatch(error: unknown, info: React.ErrorInfo) {
        // This logs a nicer message + component stack in the console
        console.error("Caught by ErrorBoundary:", error);
        console.error("Component stack:", info.componentStack);
        this.setState({ componentStack: info.componentStack });
    }

    render() {
        if (this.state.error) {
            if (this.props.fallback) {
                return this.props.fallback({
                    error: this.state.error,
                    componentStack: this.state.componentStack,
                });
            }

            // Default readable fallback UI
            const message =
                this.state.error instanceof Error
                    ? this.state.error.message
                    : String(this.state.error);

            return (
                <div className="h-full w-full p-6 text-left bg-black/70 text-white">
                    <div className="text-xl font-bold mb-2">Runtime error</div>
                    <div className="mb-4 opacity-90">{message}</div>

                    {this.state.componentStack && (
                        <>
                            <div className="font-semibold mb-2">Component stack</div>
                            <pre className="whitespace-pre-wrap text-sm opacity-80">
                {this.state.componentStack}
              </pre>
                        </>
                    )}

                    <div className="mt-6 text-sm opacity-70">
                        Check the console for the full error object and stack trace.
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
