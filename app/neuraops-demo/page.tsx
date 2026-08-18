"use client";

import { useState } from "react";

const SAMPLE_QUESTIONS_AR = [
  "وين طلبي؟ كم يوم يوصل؟",
  "أقدر أرجع المنتج إذا ما عجبني؟",
  "وش المقاسات المتوفرة؟",
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
      setAnswer(data.answer || data.error || "حدث خطأ، حاول مرة أخرى.");
    } catch {
      setAnswer("مشكلة بالاتصال — حاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div dir="rtl" style={{
      minHeight: "100vh",
      background: "#0A0E14",
      color: "#F5F3EE",
      fontFamily: "'Tajawal', 'Segoe UI', sans-serif",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Ambient signature mark — a faint radial glow, not a logo graphic */}
      <div style={{
        position: "absolute",
        top: "-20%",
        left: "50%",
        transform: "translateX(-50%)",
        width: 900,
        height: 900,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(212,175,120,0.06) 0%, rgba(13,148,136,0.04) 45%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "56px 24px", position: "relative" }}>

        <a href="/neuraops-demo-en" style={{
          position: "absolute",
          top: 24,
          left: 24,
          fontSize: 12,
          color: "#8A8F98",
          textDecoration: "none",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 100,
          padding: "6px 12px",
        }}>
          English →
        </a>

        {/* Eyebrow */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 32,
        }}>
          <div style={{ width: 24, height: 1, background: "#D4AF78" }} />
          <span style={{
            fontSize: 11,
            letterSpacing: "0.15em",
            color: "#D4AF78",
            fontWeight: 700,
          }}>
            NEURAOPS · نظام الرد الذكي
          </span>
        </div>

        {/* Headline */}
        <h1 style={{
          fontSize: "clamp(30px, 6vw, 42px)",
          fontWeight: 800,
          lineHeight: 1.3,
          marginBottom: 14,
          color: "#FFFFFF",
        }}>
          متجرك يرد على عملاءك
          <br />
          <span style={{
            background: "linear-gradient(90deg, #0D9488, #D4AF78)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>
            بذكاء، وبثوانٍ.
          </span>
        </h1>

        <p style={{
          fontSize: 15.5,
          color: "#9CA3AF",
          lineHeight: 1.8,
          marginBottom: 40,
          maxWidth: 460,
        }}>
          جرّب تسأل أي سؤال يسأله عميل حقيقي — وشوف كيف يرد النظام فوراً،
          بدون أي إعداد أو انتظار.
        </p>

        {/* Card */}
        <div style={{
          background: "rgba(255,255,255,0.03)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 20,
          padding: 28,
        }}>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="اكتب سؤالك هنا..."
            style={{
              width: "100%",
              minHeight: 84,
              background: "rgba(0,0,0,0.25)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 14,
              padding: 16,
              color: "#F5F3EE",
              fontSize: 15.5,
              resize: "vertical",
              boxSizing: "border-box",
              fontFamily: "inherit",
              outline: "none",
            }}
          />

          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
            {SAMPLE_QUESTIONS_AR.map((q) => (
              <button
                key={q}
                onClick={() => { setQuestion(q); ask(q); }}
                style={{
                  fontSize: 13,
                  padding: "7px 14px",
                  borderRadius: 100,
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(255,255,255,0.03)",
                  color: "#B8BCC4",
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
              marginTop: 18,
              padding: "15px",
              borderRadius: 14,
              border: "none",
              background: "linear-gradient(90deg, #0D9488, #0B7A70)",
              color: "#fff",
              fontWeight: 700,
              fontSize: 15,
              cursor: loading ? "default" : "pointer",
              opacity: loading ? 0.6 : 1,
              boxShadow: "0 8px 24px -8px rgba(13,148,136,0.5)",
            }}
          >
            {loading ? "جاري الرد..." : "أرسل السؤال"}
          </button>

          {answer && (
            <div style={{
              marginTop: 22,
              paddingTop: 22,
              borderTop: "1px solid rgba(255,255,255,0.08)",
            }}>
              <div style={{
                fontSize: 11,
                letterSpacing: "0.1em",
                color: "#D4AF78",
                fontWeight: 700,
                marginBottom: 10,
              }}>
                رد النظام
              </div>
              <div style={{ fontSize: 15.5, lineHeight: 1.8, color: "#F5F3EE" }}>
                {answer}
              </div>
            </div>
          )}
        </div>

        <p style={{
          textAlign: "center",
          color: "#5B6270",
          fontSize: 12,
          marginTop: 28,
        }}>
          هذا عرض توضيحي — الرد مبني على بيانات متجر تجريبية
        </p>
      </div>
    </div>
  );
}
