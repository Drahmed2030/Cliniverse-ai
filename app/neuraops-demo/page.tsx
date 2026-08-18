"use client";

import { useState } from "react";

const SAMPLE_QUESTIONS_AR = [
  "وين طلبي؟ كم يوم يوصل؟",
  "أقدر أرجع المنتج إذا ما عجبني؟",
  "وش المقاسات المتوفرة؟",
];

const SAMPLE_QUESTIONS_EN = [
  "How long does shipping take?",
  "Can I return this if it doesn't fit?",
  "What sizes are available?",
];

export default function NeuraOpsDemo() {
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
      background: "#0B0F19",
      color: "#F1F5F9",
      padding: "40px 20px",
      fontFamily: "system-ui, -apple-system, sans-serif",
    }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 14, letterSpacing: 2, color: "#0D9488", fontWeight: 700, marginBottom: 8 }}>
            NEURAOPS DEMO
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
            رد آلي ذكي لمتجرك
          </h1>
          <p style={{ color: "#94A3B8", fontSize: 15 }}>
            جرّب تسأل أي سؤال يسأله عميل — شوف كيف يرد النظام فوراً
          </p>
        </div>

        <div style={{
          background: "#111827",
          borderRadius: 16,
          padding: 24,
          border: "1px solid #1F2937",
        }}>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="اكتب سؤال زي ما يسأله عميل حقيقي..."
            style={{
              width: "100%",
              minHeight: 80,
              background: "#0B0F19",
              border: "1px solid #1F2937",
              borderRadius: 12,
              padding: 14,
              color: "#F1F5F9",
              fontSize: 15,
              resize: "vertical",
              boxSizing: "border-box",
              fontFamily: "inherit",
            }}
          />

          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
            {SAMPLE_QUESTIONS_AR.map((q) => (
              <button
                key={q}
                onClick={() => { setQuestion(q); ask(q); }}
                style={{
                  fontSize: 13,
                  padding: "6px 12px",
                  borderRadius: 100,
                  border: "1px solid #1F2937",
                  background: "transparent",
                  color: "#94A3B8",
                  cursor: "pointer",
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
              marginTop: 16,
              padding: "14px",
              borderRadius: 12,
              border: "none",
              background: "#0D9488",
              color: "#fff",
              fontWeight: 700,
              fontSize: 15,
              cursor: loading ? "default" : "pointer",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "جاري الرد..." : "أرسل السؤال"}
          </button>

          {answer && (
            <div style={{
              marginTop: 20,
              padding: 16,
              background: "#0D9488" + "15",
              border: "1px solid #0D9488" + "40",
              borderRadius: 12,
              fontSize: 15,
              lineHeight: 1.6,
            }}>
              {answer}
            </div>
          )}
        </div>

        <p style={{ textAlign: "center", color: "#475569", fontSize: 12, marginTop: 24 }}>
          هذا عرض توضيحي — الرد مبني على بيانات متجر تجريبية
        </p>
      </div>
    </div>
  );
}
