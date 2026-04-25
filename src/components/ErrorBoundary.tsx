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
          <div className="flex h-full items-center justify-center text-slate-400 text-sm">
            <div className="text-center space-y-2">
              <p className="text-red-400 font-mono">rendering error</p>
              <p className="text-xs text-slate-500">{this.state.error.message}</p>
            </div>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
