"use client";

import { useState } from "react";

const SAMPLE_QUESTIONS = [
  "Where's my order? How long does shipping take?",
  "Can I return this if it doesn't fit?",
  "What sizes do you have in stock?",
];

export default function NeuraOpsDemoEN() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  async function ask(q?: string) {
    const finalQuestion = q || question;
    if (!finalQuestion.trim()) return;

    setLoading(true);
    setAnswer("");

    try {
      const res = await fetch("/api/neuraops/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: finalQuestion }),
      });
      const data = await res.json();
      setAnswer(data.answer || data.error || "Something went wrong.");
    } catch {
      setAnswer("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#FAFAF8",
      color: "#1A1A1A",
      fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    }}>
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "64px 24px", position: "relative" }}>

        <a href="/neuraops-demo" style={{
          position: "absolute",
          top: 24,
          right: 24,
          fontSize: 12,
          color: "#8A8A82",
          textDecoration: "none",
          border: "1px solid #E5E4DD",
          borderRadius: 100,
          padding: "6px 12px",
        }}>
          ← العربية
        </a>

        {/* Eyebrow */}
        <div style={{
          fontSize: 11,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "#8A8A82",
          fontWeight: 600,
          marginBottom: 24,
          borderBottom: "1px solid #E5E4DD",
          paddingBottom: 16,
        }}>
          NeuraOps — Automated Support
        </div>

        {/* Headline */}
        <h1 style={{
          fontSize: "clamp(32px, 6vw, 48px)",
          fontWeight: 300,
          lineHeight: 1.1,
          letterSpacing: "-0.02em",
          marginBottom: 16,
          color: "#111111",
        }}>
          Your store,<br />
          <span style={{ fontWeight: 600 }}>answered instantly.</span>
        </h1>

        <p style={{
          fontSize: 16,
          color: "#5A5A52",
          lineHeight: 1.6,
          marginBottom: 48,
          maxWidth: 480,
        }}>
          Ask a question the way a real customer would.
          See exactly how the system responds — no setup, no waiting.
        </p>

        {/* Input card */}
        <div style={{
          background: "#FFFFFF",
          border: "1px solid #E5E4DD",
          borderRadius: 2,
          padding: 32,
        }}>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Type a customer question..."
            style={{
              width: "100%",
              minHeight: 88,
              background: "transparent",
              border: "none",
              borderBottom: "1px solid #D8D7CE",
              borderRadius: 0,
              padding: "8px 0",
              color: "#111111",
              fontSize: 16,
              resize: "vertical",
              boxSizing: "border-box",
              fontFamily: "inherit",
              outline: "none",
            }}
          />

          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 20 }}>
            {SAMPLE_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => { setQuestion(q); ask(q); }}
                style={{
                  fontSize: 12.5,
                  padding: "7px 14px",
                  borderRadius: 100,
                  border: "1px solid #D8D7CE",
                  background: "transparent",
                  color: "#5A5A52",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {q}
              </button>
            ))}
          </div>

          <button
            onClick={() => ask()}
            disabled={loading}
            style={{
              width: "100%",
              marginTop: 28,
              padding: "16px",
              borderRadius: 2,
              border: "none",
              background: "#1A1A1A",
              color: "#FAFAF8",
              fontWeight: 500,
              fontSize: 14,
              letterSpacing: "0.02em",
              cursor: loading ? "default" : "pointer",
              opacity: loading ? 0.5 : 1,
              transition: "opacity 0.15s",
            }}
          >
            {loading ? "Thinking..." : "Ask →"}
          </button>

          {answer && (
            <div style={{
              marginTop: 24,
              paddingTop: 24,
              borderTop: "1px solid #E5E4DD",
              fontSize: 15,
              lineHeight: 1.7,
              color: "#1A1A1A",
            }}>
              <div style={{
                fontSize: 10.5,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "#8A8A82",
                fontWeight: 600,
                marginBottom: 10,
              }}>
                Response
              </div>
              {answer}
            </div>
          )}
        </div>

        <p style={{
          textAlign: "center",
          color: "#A8A79E",
          fontSize: 12,
          marginTop: 32,
          letterSpacing: "0.01em",
        }}>
          Demo only — responses are based on sample store data.
        </p>
      </div>
    </div>
  );
}
