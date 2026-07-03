import { Component } from "react";
import type { CSSProperties, ErrorInfo, ReactNode } from "react";

type Props = {
  children: ReactNode;
};

type State = {
  error: Error | null;
};

const baseButtonStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "0.6rem 1.2rem",
  borderRadius: "var(--radius-sm)",
  fontWeight: 600,
  fontSize: "0.95rem",
  textDecoration: "none",
  cursor: "pointer",
};

const solidButtonStyle: CSSProperties = {
  ...baseButtonStyle,
  border: "none",
  background: "var(--color-accent)",
  color: "var(--color-accent-contrast)",
};

const outlinedButtonStyle: CSSProperties = {
  ...baseButtonStyle,
  border: "1px solid var(--color-border-strong)",
  background: "transparent",
  color: "var(--color-ink)",
};

export class GlobalErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Unhandled application error:", error, errorInfo);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="auth-screen">
          <div className="auth-card panel" style={{ textAlign: "center" }}>
            <h1 style={{ margin: 0, color: "var(--color-ink)" }}>Something went wrong</h1>
            <p className="auth-copy">
              An unexpected error occurred. Try reloading the page — if the problem keeps happening,
              please come back later.
            </p>

            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
              <a href="/dashboard" style={outlinedButtonStyle}>
                Go to dashboard
              </a>
              <button type="button" onClick={() => window.location.reload()} style={solidButtonStyle}>
                Reload page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
