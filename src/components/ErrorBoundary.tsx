"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        this.props.fallback ?? (
          <div
            className="flex h-full items-center justify-center text-sm"
            style={{ color: "var(--text-secondary)" }}
          >
            <div className="text-center space-y-2">
              <p className="font-mono text-red-400">rendering error</p>
              <p className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
                {this.state.error.message}
              </p>
            </div>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
