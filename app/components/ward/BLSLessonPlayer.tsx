"use client";
/**
 * BLSLessonPlayer.tsx
 * Renders a single BLS lesson: key points → practice → MCQ → complete
 * Surgical: no external deps beyond React
 */

import React, { useState } from "react";
import { BlsLesson, BLS_DISCLAIMER } from "../../lib/codelab/blsLessons";

interface Props {
  lesson: BlsLesson;
  isPro: boolean;
  onComplete: () => void;
  onBack: () => void;
}

type Phase = "intro" | "practice" | "mcq" | "done";

export default function BLSLessonPlayer({ lesson, isPro, onComplete, onBack }: Props) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());
  const [sequenceOrder, setSequenceOrder] = useState<number[]>(
    lesson.practice.items ? lesson.practice.items.map((_, i) => i) : []
  );
  const [mcqAnswers, setMcqAnswers] = useState<(number | null)[]>(
    lesson.mcqs.map(() => null)
  );
  const [mcqSubmitted, setMcqSubmitted] = useState(false);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSec, setTimerSec] = useState(120);
  const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Timer for compression practice ────────────────────────────────────────
  function startTimer() {
    setTimerRunning(true);
    setTimerSec(120);
    timerRef.current = setInterval(() => {
      setTimerSec((s) => {
        if (s <= 1) {
          clearInterval(timerRef.current!);
          setTimerRunning(false);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }

  function stopTimer() {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimerRunning(false);
  }

  // ── Sequence reorder (simple tap-to-select swap) ───────────────────────────
  const [seqSelected, setSeqSelected] = useState<number | null>(null);

  function handleSeqTap(idx: number) {
    if (seqSelected === null) {
      setSeqSelected(idx);
    } else {
      const next = [...sequenceOrder];
      [next[seqSelected], next[idx]] = [next[idx], next[seqSelected]];
      setSequenceOrder(next);
      setSeqSelected(null);
    }
  }

  // ── MCQ logic ─────────────────────────────────────────────────────────────
  const mcqScore = mcqAnswers.filter(
    (a, i) => a === lesson.mcqs[i]?.answerIndex
  ).length;

  const canComplete = (() => {
    if (phase !== "mcq" && phase !== "done") return false;
    if (!mcqSubmitted) return false;
    return mcqScore >= Math.ceil(lesson.mcqs.length / 2);
  })();

  // ── Styles shared ─────────────────────────────────────────────────────────
  const S = playerStyles;

  return (
    <div style={S.root}>
      {/* Header */}
      <div style={S.header}>
        <button onClick={onBack} style={S.backBtn}>← Back</button>
        <div style={S.lessonTag}>
          BLS · {lesson.order}/{6} · ~{lesson.durationMin} min
        </div>
      </div>

      {/* Title */}
      <div style={S.titleBlock}>
        <div style={S.title}>{lesson.title}</div>
        <div style={S.objective}>{lesson.objective}</div>
      </div>

      {/* ── INTRO PHASE ── */}
      {phase === "intro" && (
        <div style={S.phaseBlock}>
          <div style={S.phaseLabel}>KEY POINTS</div>
          {lesson.keyPoints.map((pt, i) => (
            <div key={i} style={S.keyPoint}>
              <div style={S.keyDot} />
              <div style={S.keyText}>{pt}</div>
            </div>
          ))}

          {/* Video placeholder */}
          <div style={S.videoBrief}>
            <div style={S.videoIcon}>▶</div>
            <div style={S.videoText}>{lesson.videoBrief}</div>
            <div style={S.videoNote}>Original video coming soon</div>
          </div>

          <button style={S.primaryBtn} onClick={() => setPhase("practice")}>
            Start Practice →
          </button>
        </div>
      )}

      {/* ── PRACTICE PHASE ── */}
      {phase === "practice" && (
        <div style={S.phaseBlock}>
          <div style={S.phaseLabel}>PRACTICE</div>
          <div style={S.practicePrompt}>{lesson.practice.prompt}</div>

          {/* Sequence */}
          {lesson.practice.type === "sequence" && lesson.practice.items && (
            <div>
              <div style={S.seqNote}>Tap two items to swap their order</div>
              {sequenceOrder.map((origIdx, position) => (
                <div
                  key={origIdx}
                  style={{
                    ...S.seqItem,
                    ...(seqSelected === position ? S.seqItemSelected : {}),
                  }}
                  onClick={() => handleSeqTap(position)}
                >
                  <div style={S.seqNum}>{position + 1}</div>
                  <div style={S.seqText}>{lesson.practice.items![origIdx]}</div>
                </div>
              ))}
            </div>
          )}

          {/* Timer */}
          {lesson.practice.type === "timer" && (
            <div>
              <div style={S.timerDisplay}>
                {Math.floor(timerSec / 60)}:{String(timerSec % 60).padStart(2, "0")}
              </div>
              <div style={S.timerSub}>2-minute compression round</div>
              <div style={S.timerBpm}>♩ 110 bpm metronome rhythm</div>
              <button
                style={timerRunning ? S.timerBtnStop : S.timerBtnStart}
                onClick={timerRunning ? stopTimer : startTimer}
              >
                {timerRunning ? "⏹ Stop" : "▶ Start Timer"}
              </button>
              {lesson.practice.items && (
                <div style={{ marginTop: 16 }}>
                  <div style={S.checklistLabel}>Self-check</div>
                  {lesson.practice.items.map((item, i) => (
                    <div
                      key={i}
                      style={{
                        ...S.checkItem,
                        ...(checkedItems.has(i) ? S.checkItemDone : {}),
                      }}
                      onClick={() => {
                        const next = new Set(checkedItems);
                        next.has(i) ? next.delete(i) : next.add(i);
                        setCheckedItems(next);
                      }}
                    >
                      <div style={{
                        ...S.checkbox,
                        ...(checkedItems.has(i) ? S.checkboxDone : {}),
                      }}>
                        {checkedItems.has(i) ? "✓" : ""}
                      </div>
                      <div style={S.checkText}>{item}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Checklist */}
          {lesson.practice.type === "checklist" && lesson.practice.items && (
            <div>
              {lesson.practice.items.map((item, i) => (
                <div
                  key={i}
                  style={{
                    ...S.checkItem,
                    ...(checkedItems.has(i) ? S.checkItemDone : {}),
                  }}
                  onClick={() => {
                    const next = new Set(checkedItems);
                    next.has(i) ? next.delete(i) : next.add(i);
                    setCheckedItems(next);
                  }}
                >
                  <div style={{
                    ...S.checkbox,
                    ...(checkedItems.has(i) ? S.checkboxDone : {}),
                  }}>
                    {checkedItems.has(i) ? "✓" : ""}
                  </div>
                  <div style={S.checkText}>{item}</div>
                </div>
              ))}
            </div>
          )}

          {/* Scenario + Mini Megacode — placeholder */}
          {(lesson.practice.type === "scenario" || lesson.practice.type === "mini_megacode") && (
            <div style={S.placeholderBlock}>
              <div style={S.placeholderIcon}>
                {lesson.practice.type === "mini_megacode" ? "🔴" : "🔀"}
              </div>
              <div style={S.placeholderTitle}>
                {lesson.practice.type === "mini_megacode"
                  ? "Mini-Megacode coming in next update"
                  : "Interactive scenario coming in next update"}
              </div>
              <div style={S.placeholderSub}>
                Complete the checklist above to proceed
              </div>
            </div>
          )}

          <button style={S.primaryBtn} onClick={() => setPhase("mcq")}>
            Continue to Questions →
          </button>
        </div>
      )}

      {/* ── MCQ PHASE ── */}
      {phase === "mcq" && (
        <div style={S.phaseBlock}>
          <div style={S.phaseLabel}>CHECK YOUR KNOWLEDGE</div>
          {lesson.mcqs.map((mcq, qi) => (
            <div key={qi} style={S.mcqBlock}>
              <div style={S.mcqQ}>{mcq.q}</div>
              {mcq.options.map((opt, oi) => {
                const selected = mcqAnswers[qi] === oi;
                const correct = mcq.answerIndex === oi;
                const showResult = mcqSubmitted;
                return (
                  <div
                    key={oi}
                    style={{
                      ...S.mcqOption,
                      ...(selected && !showResult ? S.mcqSelected : {}),
                      ...(showResult && correct ? S.mcqCorrect : {}),
                      ...(showResult && selected && !correct ? S.mcqWrong : {}),
                    }}
                    onClick={() => {
                      if (mcqSubmitted) return;
                      const next = [...mcqAnswers];
                      next[qi] = oi;
                      setMcqAnswers(next);
                    }}
                  >
                    <div style={S.mcqLetter}>
                      {String.fromCharCode(65 + oi)}
                    </div>
                    <div style={S.mcqText}>{opt}</div>
                  </div>
                );
              })}
            </div>
          ))}

          {!mcqSubmitted ? (
            <button
              style={mcqAnswers.every((a) => a !== null) ? S.primaryBtn : S.primaryBtnDisabled}
              onClick={() => {
                if (mcqAnswers.every((a) => a !== null)) setMcqSubmitted(true);
              }}
            >
              Submit Answers
            </button>
          ) : (
            <div>
              <div style={{
                ...S.scoreBlock,
                background: mcqScore === lesson.mcqs.length ? "#064E3B" : "#1E3A5F",
              }}>
                <div style={S.scoreNum}>{mcqScore}/{lesson.mcqs.length}</div>
                <div style={S.scoreLabel}>
                  {mcqScore === lesson.mcqs.length
                    ? "Perfect — well done!"
                    : mcqScore >= Math.ceil(lesson.mcqs.length / 2)
                    ? "Passed — good understanding"
                    : "Review the key points and try again"}
                </div>
              </div>
              {canComplete && (
                <button style={S.completeBtn} onClick={onComplete}>
                  ✓ Mark Lesson Complete
                </button>
              )}
              {!canComplete && (
                <button
                  style={S.retryBtn}
                  onClick={() => {
                    setMcqAnswers(lesson.mcqs.map(() => null));
                    setMcqSubmitted(false);
                  }}
                >
                  Retry Questions
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Disclaimer */}
      <div style={S.disclaimer}>{BLS_DISCLAIMER}</div>
    </div>
  );
}

const playerStyles: Record<string, React.CSSProperties> = {
  root: {
    minHeight: "100vh",
    background: "#0B1220",
    color: "#F8FAFC",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
    paddingBottom: 60,
    overflowY: "auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 20px",
    borderBottom: "1px solid #1E293B",
  },
  backBtn: {
    background: "none",
    border: "none",
    color: "#94A3B8",
    fontSize: 15,
    cursor: "pointer",
  },
  lessonTag: {
    fontSize: 11,
    color: "#64748B",
    letterSpacing: 0.5,
  },
  titleBlock: {
    padding: "20px 20px 0",
  },
  title: {
    fontSize: 24,
    fontWeight: 800,
    marginBottom: 6,
  },
  objective: {
    fontSize: 14,
    color: "#94A3B8",
    lineHeight: 1.5,
    marginBottom: 20,
  },
  phaseBlock: {
    padding: "0 20px",
  },
  phaseLabel: {
    fontSize: 10,
    letterSpacing: 2,
    color: "#0D9488",
    fontWeight: 700,
    marginBottom: 14,
  },
  keyPoint: {
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 12,
  },
  keyDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: "#0D9488",
    flexShrink: 0,
    marginTop: 6,
  },
  keyText: {
    fontSize: 14,
    color: "#CBD5E1",
    lineHeight: 1.5,
  },
  videoBrief: {
    background: "#111827",
    border: "1px solid #1E293B",
    borderRadius: 14,
    padding: "16px",
    margin: "20px 0",
    textAlign: "center" as const,
  },
  videoIcon: {
    fontSize: 28,
    marginBottom: 8,
    color: "#EF4444",
  },
  videoText: {
    fontSize: 13,
    color: "#94A3B8",
    lineHeight: 1.5,
    marginBottom: 6,
  },
  videoNote: {
    fontSize: 11,
    color: "#475569",
    fontStyle: "italic",
  },
  primaryBtn: {
    width: "100%",
    background: "linear-gradient(135deg, #1E40AF, #0D9488)",
    color: "#F8FAFC",
    border: "none",
    borderRadius: 14,
    padding: "15px",
    fontWeight: 700,
    fontSize: 15,
    cursor: "pointer",
    marginTop: 20,
  },
  primaryBtnDisabled: {
    width: "100%",
    background: "#1E293B",
    color: "#475569",
    border: "none",
    borderRadius: 14,
    padding: "15px",
    fontWeight: 700,
    fontSize: 15,
    cursor: "not-allowed",
    marginTop: 20,
  },
  practicePrompt: {
    fontSize: 15,
    fontWeight: 600,
    color: "#F8FAFC",
    marginBottom: 16,
  },
  seqNote: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 10,
  },
  seqItem: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    background: "#111827",
    border: "1px solid #1E293B",
    borderRadius: 12,
    padding: "12px 14px",
    marginBottom: 8,
    cursor: "pointer",
  },
  seqItemSelected: {
    borderColor: "#1E40AF",
    background: "#172554",
  },
  seqNum: {
    width: 24,
    height: 24,
    borderRadius: 8,
    background: "#1E293B",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    fontWeight: 700,
    color: "#94A3B8",
    flexShrink: 0,
  },
  seqText: {
    fontSize: 14,
    color: "#CBD5E1",
  },
  timerDisplay: {
    fontSize: 56,
    fontWeight: 800,
    textAlign: "center" as const,
    color: "#EF4444",
    letterSpacing: -2,
    margin: "10px 0 4px",
  },
  timerSub: {
    fontSize: 13,
    color: "#94A3B8",
    textAlign: "center" as const,
    marginBottom: 4,
  },
  timerBpm: {
    fontSize: 12,
    color: "#0D9488",
    textAlign: "center" as const,
    marginBottom: 14,
  },
  timerBtnStart: {
    width: "100%",
    background: "#EF4444",
    color: "#fff",
    border: "none",
    borderRadius: 14,
    padding: "14px",
    fontWeight: 700,
    fontSize: 15,
    cursor: "pointer",
  },
  timerBtnStop: {
    width: "100%",
    background: "#1E293B",
    color: "#94A3B8",
    border: "none",
    borderRadius: 14,
    padding: "14px",
    fontWeight: 700,
    fontSize: 15,
    cursor: "pointer",
  },
  checklistLabel: {
    fontSize: 11,
    letterSpacing: 1.5,
    color: "#475569",
    fontWeight: 700,
    marginBottom: 10,
  },
  checkItem: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    background: "#111827",
    border: "1px solid #1E293B",
    borderRadius: 12,
    padding: "12px 14px",
    marginBottom: 8,
    cursor: "pointer",
  },
  checkItemDone: {
    borderColor: "#0D9488",
    background: "#042F2E",
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    border: "2px solid #334155",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    color: "#10B981",
    fontWeight: 700,
    flexShrink: 0,
  },
  checkboxDone: {
    background: "#0D9488",
    border: "2px solid #0D9488",
    color: "#fff",
  },
  checkText: {
    fontSize: 14,
    color: "#CBD5E1",
  },
  placeholderBlock: {
    background: "#111827",
    border: "1px solid #1E293B",
    borderRadius: 14,
    padding: "24px 16px",
    textAlign: "center" as const,
    marginBottom: 10,
  },
  placeholderIcon: {
    fontSize: 32,
    marginBottom: 10,
  },
  placeholderTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: "#94A3B8",
    marginBottom: 4,
  },
  placeholderSub: {
    fontSize: 12,
    color: "#475569",
  },
  mcqBlock: {
    marginBottom: 24,
  },
  mcqQ: {
    fontSize: 15,
    fontWeight: 600,
    color: "#F8FAFC",
    lineHeight: 1.5,
    marginBottom: 12,
  },
  mcqOption: {
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
    background: "#111827",
    border: "1px solid #1E293B",
    borderRadius: 12,
    padding: "12px 14px",
    marginBottom: 8,
    cursor: "pointer",
  },
  mcqSelected: {
    borderColor: "#1E40AF",
    background: "#172554",
  },
  mcqCorrect: {
    borderColor: "#10B981",
    background: "#042F2E",
  },
  mcqWrong: {
    borderColor: "#EF4444",
    background: "#2D0A0A",
  },
  mcqLetter: {
    width: 22,
    height: 22,
    borderRadius: 6,
    background: "#1E293B",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 11,
    fontWeight: 700,
    color: "#94A3B8",
    flexShrink: 0,
  },
  mcqText: {
    fontSize: 14,
    color: "#CBD5E1",
    lineHeight: 1.4,
  },
  scoreBlock: {
    borderRadius: 14,
    padding: "16px",
    textAlign: "center" as const,
    marginBottom: 14,
  },
  scoreNum: {
    fontSize: 32,
    fontWeight: 800,
    marginBottom: 4,
  },
  scoreLabel: {
    fontSize: 14,
    color: "#94A3B8",
  },
  completeBtn: {
    width: "100%",
    background: "#0D9488",
    color: "#fff",
    border: "none",
    borderRadius: 14,
    padding: "15px",
    fontWeight: 700,
    fontSize: 15,
    cursor: "pointer",
  },
  retryBtn: {
    width: "100%",
    background: "#1E293B",
    color: "#94A3B8",
    border: "none",
    borderRadius: 14,
    padding: "15px",
    fontWeight: 700,
    fontSize: 15,
    cursor: "pointer",
  },
  disclaimer: {
    margin: "24px 20px 0",
    fontSize: 11,
    color: "#475569",
    lineHeight: 1.6,
    borderTop: "1px solid #1E293B",
    paddingTop: 14,
  },
};
