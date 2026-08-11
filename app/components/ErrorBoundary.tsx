"use client";
import { Component, ReactNode } from "react";

interface Props { children: ReactNode; section?: string; }
interface State { hasError: boolean; error?: Error; }

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error(`[${this.props.section || "App"}] Error:`, error.message);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "60vh", display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: "40px 24px", textAlign: "center",
          fontFamily: "-apple-system,'SF Pro Display',sans-serif",
          background: "#F8FAFC",
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#111827", marginBottom: 8 }}>
            {this.props.section || "Section"} temporarily unavailable
          </h2>
          <p style={{ fontSize: 14, color: "#6B7280", marginBottom: 24, maxWidth: 280, lineHeight: 1.6 }}>
            Something went wrong. Your data is safe.
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            style={{
              background: "linear-gradient(135deg,#0D9488,#1E40AF)",
              color: "white", border: "none", borderRadius: 14,
              padding: "12px 28px", fontSize: 15, fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
