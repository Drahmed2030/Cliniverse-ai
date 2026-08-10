"use client";
import { useState, useEffect } from "react";

const T = {
  teal: "#0D9488",
  cobalt: "#1E40AF",
  grad: "linear-gradient(135deg,#0D9488,#1E40AF)",
  canvas: "#F8FAFC",
  card: "#FFFFFF",
  border: "#E2E8F0",
  text: "#0F172A",
  muted: "#64748B",
};

type Tab = "analyze" | "plan" | "water" | "tips";

const WATER_GOAL = 8; // أكواب

export default function NutritionCard({ onBack }: { onBack: () => void }) {
  const [tab, setTab] = useState<Tab>("analyze");

  // ── Meal Analyzer ──
  const [meal, setMeal] = useState("");
  const [mealResult, setMealResult] = useState<string | null>(null);
  const [mealLoading, setMealLoading] = useState(false);

  // ── Meal Plan ──
  const [planGoal, setPlanGoal] = useState("balanced");
  const [planResult, setPlanResult] = useState<string | null>(null);
  const [planLoading, setPlanLoading] = useState(false);

  // ── Water Tracker ──
  const [cups, setCups] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    const saved = localStorage.getItem("cliniverse_water_cups");
    const date = localStorage.getItem("cliniverse_water_date");
    const today = new Date().toDateString();
    if (date !== today) return 0;
    return saved ? parseInt(saved) : 0;
  });

  // ── Health Tips ──
  const [condition, setCondition] = useState("general");
  const [tipsResult, setTipsResult] = useState<string | null>(null);
  const [tipsLoading, setTipsLoading] = useState(false);

  // حفظ الماء يومياً
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("cliniverse_water_cups", String(cups));
    localStorage.setItem("cliniverse_water_date", new Date().toDateString());
  }, [cups]);

  async function callClaude(prompt: string): Promise<string> {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    const data = await res.json();
    return data.content?.[0]?.text ?? "لم أتمكن من الحصول على إجابة.";
  }

  async function analyzeMeal() {
    if (!meal.trim()) return;
    setMealLoading(true);
    setMealResult(null);
    try {
      const result = await callClaude(
        `أنت مستشار تغذية. حلل هذه الوجبة بالعربية أو الإنجليزية حسب لغة المستخدم.
الوجبة: ${meal}
اذكر: السعرات الحرارية التقريبية، البروتين، الكربوهيدرات، الدهون، الفيتامينات الرئيسية، ونصيحة واحدة للتحسين.
اجعل الرد منظماً وقصيراً (لا يتجاوز 150 كلمة). لا تذكر أنك AI.`
      );
      setMealResult(result);
    } catch {
      setMealResult("حدث خطأ. حاول مرة أخرى.");
    }
    setMealLoading(false);
  }

  async function generatePlan() {
    setPlanLoading(true);
    setPlanResult(null);
    const goals: Record<string, string> = {
      balanced: "نظام غذائي متوازن",
      weightloss: "خسارة الوزن",
      muscle: "بناء العضلات",
      diabetic: "مريض سكري",
      heart: "صحة القلب",
    };
    try {
      const result = await callClaude(
        `أنت مستشار تغذية. اقترح خطة غذائية يومية بسيطة لـ: ${goals[planGoal]}.
اذكر 3 وجبات رئيسية + وجبتين خفيفتين مع السعرات التقريبية لكل وجبة.
اجعل الرد منظماً وعملياً (لا يتجاوز 200 كلمة). استخدم العربية.`
      );
      setPlanResult(result);
    } catch {
      setPlanResult("حدث خطأ. حاول مرة أخرى.");
    }
    setPlanLoading(false);
  }

  async function getTips() {
    setTipsLoading(true);
    setTipsResult(null);
    const conditions: Record<string, string> = {
      general: "صحة عامة",
      diabetic: "مريض سكري",
      heart: "أمراض القلب",
      kidney: "أمراض الكلى",
      hypertension: "ارتفاع ضغط الدم",
      pregnant: "حامل",
    };
    try {
      const result = await callClaude(
        `أنت مستشار تغذية. اعطِ 5 نصائح غذائية مهمة لشخص لديه: ${conditions[condition]}.
اجعلها عملية وقابلة للتطبيق. استخدم العربية. لا تتجاوز 150 كلمة.
تنبيه في النهاية: "هذه نصائح عامة، استشر طبيبك للتوجيه الشخصي."`
      );
      setTipsResult(result);
    } catch {
      setTipsResult("حدث خطأ. حاول مرة أخرى.");
    }
    setTipsLoading(false);
  }

  const TABS: { id: Tab; label: string; icon: string }[] = [
    { id: "analyze", label: "تحليل وجبة", icon: "🍽️" },
    { id: "plan", label: "خطة غذائية", icon: "📋" },
    { id: "water", label: "الماء", icon: "💧" },
    { id: "tips", label: "نصائح", icon: "💡" },
  ];

  return (
    <div style={{ minHeight: "100dvh", background: T.canvas, fontFamily: "-apple-system,'SF Pro Display',sans-serif", paddingBottom: 100 }}>
      {/* Header */}
      <div style={{ background: T.grad, padding: "52px 20px 24px", color: "white" }}>
        <button onClick={onBack} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "white", borderRadius: 20, padding: "6px 16px", fontSize: 14, cursor: "pointer", marginBottom: 16 }}>
          ← رجوع
        </button>
        <div style={{ fontSize: 28, fontWeight: 800 }}>🥗 التغذية</div>
        <div style={{ fontSize: 14, opacity: 0.85, marginTop: 4 }}>مرشدك الغذائي الذكي</div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, padding: "16px 20px", overflowX: "auto" }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{
              flexShrink: 0, padding: "8px 16px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
              background: tab === t.id ? T.teal : T.card,
              color: tab === t.id ? "white" : T.muted,
              boxShadow: tab === t.id ? "0 2px 8px rgba(13,148,136,0.3)" : "none",
              transition: "all 0.2s",
            }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div style={{ padding: "0 20px" }}>

        {/* ── تحليل وجبة ── */}
        {tab === "analyze" && (
          <div>
            <Card title="اكتب ما أكلته">
              <textarea
                value={meal}
                onChange={e => setMeal(e.target.value)}
                placeholder="مثال: رز بالدجاج مع سلطة خضراء وعصير برتقال..."
                rows={4}
                style={{ width: "100%", border: `1px solid ${T.border}`, borderRadius: 12, padding: 12, fontSize: 15, fontFamily: "inherit", resize: "none", outline: "none", boxSizing: "border-box" }}
              />
              <button onClick={analyzeMeal} disabled={mealLoading || !meal.trim()}
                style={{ marginTop: 12, width: "100%", padding: 14, borderRadius: 14, border: "none", background: meal.trim() ? T.grad : T.border, color: "white", fontSize: 16, fontWeight: 700, cursor: meal.trim() ? "pointer" : "default" }}>
                {mealLoading ? "⏳ جاري التحليل..." : "تحليل الوجبة"}
              </button>
            </Card>
            {mealResult && <ResultCard text={mealResult} />}
          </div>
        )}

        {/* ── خطة غذائية ── */}
        {tab === "plan" && (
          <div>
            <Card title="اختر هدفك الغذائي">
              {[
                { id: "balanced", label: "🌿 متوازن" },
                { id: "weightloss", label: "⚖️ خسارة وزن" },
                { id: "muscle", label: "💪 بناء عضلات" },
                { id: "diabetic", label: "🩺 سكري" },
                { id: "heart", label: "❤️ صحة القلب" },
              ].map(g => (
                <button key={g.id} onClick={() => setPlanGoal(g.id)}
                  style={{
                    display: "block", width: "100%", marginBottom: 10, padding: "12px 16px", borderRadius: 14, border: `2px solid ${planGoal === g.id ? T.teal : T.border}`,
                    background: planGoal === g.id ? "rgba(13,148,136,0.08)" : T.card,
                    color: T.text, fontSize: 15, fontWeight: 600, cursor: "pointer", textAlign: "left",
                  }}>
                  {g.label}
                </button>
              ))}
              <button onClick={generatePlan} disabled={planLoading}
                style={{ width: "100%", padding: 14, borderRadius: 14, border: "none", background: T.grad, color: "white", fontSize: 16, fontWeight: 700, cursor: "pointer", marginTop: 4 }}>
                {planLoading ? "⏳ جاري التحضير..." : "احصل على خطتك"}
              </button>
            </Card>
            {planResult && <ResultCard text={planResult} />}
          </div>
        )}

        {/* ── تتبع الماء ── */}
        {tab === "water" && (
          <Card title="تتبع الماء اليومي">
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ fontSize: 64, fontWeight: 900, color: T.cobalt }}>{cups}</div>
              <div style={{ color: T.muted, fontSize: 15, marginBottom: 4 }}>كوب من أصل {WATER_GOAL}</div>
              {/* Progress bar */}
              <div style={{ background: T.border, borderRadius: 99, height: 12, margin: "16px 0", overflow: "hidden" }}>
                <div style={{ background: T.grad, height: "100%", borderRadius: 99, width: `${Math.min((cups / WATER_GOAL) * 100, 100)}%`, transition: "width 0.4s" }} />
              </div>
              <div style={{ fontSize: 28, marginBottom: 20 }}>
                {cups >= WATER_GOAL ? "🎉 أحسنت! وصلت هدفك اليومي" : cups >= WATER_GOAL / 2 ? "👍 في المنتصف، استمر!" : "💧 ابدأ بشرب الماء"}
              </div>
              <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                <button onClick={() => setCups(c => Math.max(0, c - 1))}
                  style={{ width: 56, height: 56, borderRadius: "50%", border: `2px solid ${T.border}`, background: T.card, fontSize: 24, cursor: "pointer" }}>−</button>
                <button onClick={() => setCups(c => c + 1)}
                  style={{ width: 56, height: 56, borderRadius: "50%", border: "none", background: T.grad, color: "white", fontSize: 24, cursor: "pointer", fontWeight: 700 }}>+</button>
              </div>
              <button onClick={() => setCups(0)}
                style={{ marginTop: 20, padding: "8px 20px", borderRadius: 20, border: `1px solid ${T.border}`, background: "transparent", color: T.muted, fontSize: 13, cursor: "pointer" }}>
                إعادة تعيين اليوم
              </button>
            </div>
          </Card>
        )}

        {/* ── نصائح حسب الحالة ── */}
        {tab === "tips" && (
          <div>
            <Card title="نصائح حسب حالتك الصحية">
              {[
                { id: "general", label: "🌱 صحة عامة" },
                { id: "diabetic", label: "🩺 سكري" },
                { id: "heart", label: "❤️ أمراض القلب" },
                { id: "kidney", label: "🫘 أمراض الكلى" },
                { id: "hypertension", label: "📊 ضغط الدم" },
                { id: "pregnant", label: "🤰 حمل" },
              ].map(c => (
                <button key={c.id} onClick={() => setCondition(c.id)}
                  style={{
                    display: "inline-block", margin: "0 8px 8px 0", padding: "8px 14px", borderRadius: 20,
                    border: `2px solid ${condition === c.id ? T.teal : T.border}`,
                    background: condition === c.id ? "rgba(13,148,136,0.08)" : T.card,
                    color: T.text, fontSize: 14, fontWeight: 600, cursor: "pointer",
                  }}>
                  {c.label}
                </button>
              ))}
              <button onClick={getTips} disabled={tipsLoading}
                style={{ display: "block", width: "100%", marginTop: 12, padding: 14, borderRadius: 14, border: "none", background: T.grad, color: "white", fontSize: 16, fontWeight: 700, cursor: "pointer" }}>
                {tipsLoading ? "⏳ جاري التحضير..." : "احصل على النصائح"}
              </button>
            </Card>
            {tipsResult && <ResultCard text={tipsResult} />}
            <div style={{ margin: "12px 0 0", padding: 12, background: "rgba(245,158,11,0.08)", borderRadius: 12, border: "1px solid rgba(245,158,11,0.2)", fontSize: 12, color: "#92400E", textAlign: "center" }}>
              ⚠️ هذه نصائح عامة — استشر طبيبك للتوجيه الشخصي
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "#FFFFFF", borderRadius: 18, padding: "18px 16px", border: "1px solid #E2E8F0", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", marginBottom: 16 }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", marginBottom: 14 }}>{title}</div>
      {children}
    </div>
  );
}

function ResultCard({ text }: { text: string }) {
  return (
    <div style={{ background: "rgba(13,148,136,0.06)", borderRadius: 16, padding: 16, border: "1px solid rgba(13,148,136,0.15)", marginBottom: 16 }}>
      <div style={{ fontSize: 14, color: "#0F172A", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{text}</div>
    </div>
  );
}
