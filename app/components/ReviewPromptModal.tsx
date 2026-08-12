"use client";

const T = {
  teal: "#0D9488",
  tealD: "#0F766E",
  card: "#121A2B",
  white: "#FFFFFF",
  text: "#F8FAFC",
  sub: "#94A3B8",
  border: "rgba(148,163,184,0.22)",
  gold: "#FBBF24",
};

interface Props {
  open: boolean;
  onClose: () => void;
  onWriteReview: () => void;
  locale?: "en" | "ar";
  rating?: number;
}

const COPY = {
  en: {
    thanks: "Thanks for your feedback.",
    hint: "You can also write a review.",
    write: "Write a Review",
    ok: "OK",
  },
  ar: {
    thanks: "شكرًا لملاحظاتك.",
    hint: "يمكنك أيضًا كتابة تقييم.",
    write: "كتابة تقييم",
    ok: "حسنًا",
  },
};

export default function ReviewPromptModal({
  open,
  onClose,
  onWriteReview,
  locale = "en",
  rating = 5,
}: Props) {
  if (!open) return null;
  const t = COPY[locale] || COPY.en;
  const dir = locale === "ar" ? "rtl" : "ltr";
  const stars = [0, 1, 2, 3, 4];

  return (
    <div
      dir={dir}
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 110,
        background: "rgba(2,6,23,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        onClick={function (e) {
          e.stopPropagation();
        }}
        style={{
          width: "100%",
          maxWidth: 320,
          background: T.card,
          borderRadius: 24,
          border: "1px solid " + T.border,
          padding: "22px 18px 16px",
          textAlign: "center",
          color: T.text,
        }}
      >
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            margin: "0 auto 14px",
            background: "linear-gradient(135deg, " + T.tealD + ", " + T.teal + ")",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 900,
            fontSize: 18,
          }}
        >
          C
        </div>

        <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 6 }}>{t.thanks}</div>
        <div style={{ fontSize: 13, color: T.sub, marginBottom: 12 }}>{t.hint}</div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 6,
            marginBottom: 16,
          }}
        >
          {stars.map(function (i) {
            return (
              <span
                key={i}
                style={{
                  fontSize: 22,
                  color: i < rating ? T.gold : "rgba(148,163,184,0.35)",
                }}
              >
                ★
              </span>
            );
          })}
        </div>

        <button
          onClick={onWriteReview}
          style={{
            width: "100%",
            border: "none",
            background: "transparent",
            color: "#60A5FA",
            fontSize: 15,
            fontWeight: 700,
            padding: "10px 8px",
            marginBottom: 4,
          }}
        >
          {t.write}
        </button>

        <div style={{ height: 1, background: T.border, margin: "4px 0 6px" }} />

        <button
          onClick={onClose}
          style={{
            width: "100%",
            border: "none",
            background: "transparent",
            color: T.text,
            fontSize: 15,
            fontWeight: 700,
            padding: "10px 8px",
          }}
        >
          {t.ok}
        </button>
      </div>
    </div>
  );
}
