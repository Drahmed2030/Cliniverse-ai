"use client";
/**
 * BLSLessonPlayer.tsx
 * Renders a single BLS lesson: key points → practice → MCQ → complete
 * Surgical: no external deps beyond React
 */

import React, { useState } from "react";
import { type BlsLesson, BLS_DISCLAIMER, BLS_LESSONS } from "../../lib/codelab/blsLessons";
import { type ACLSLesson, ACLS_DISCLAIMER, ACLS_LESSONS } from "../../lib/codelab/aclsLessons";

interface Props {
  lesson: BlsLesson | ACLSLesson;
  isPro: boolean;
  onComplete: (errors: number) => void;
  completionDisabled?: boolean;
  completionLabel?: string;
  onBack: () => void;
}

type Phase = "intro" | "practice" | "mcq" | "done";

export default function BLSLessonPlayer({ lesson, onComplete, onBack, completionDisabled = false, completionLabel }: Props) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());
  const [sequenceOrder, setSequenceOrder] = useState<number[]>(
    lesson.practice.items ? lesson.practice.items.map((_, i) => i) : []
  );
  const [mcqAnswers, setMcqAnswers] = useState<(number | null)[]>(
    lesson.mcqs.map(() => null)
  );
  const [mcqSubmitted, setMcqSubmitted] = useState(false);
  const phaseHeadingRef = React.useRef<HTMLHeadingElement | null>(null);
  const resultRef = React.useRef<HTMLDivElement | null>(null);
  const previousView = React.useRef({ phase, mcqSubmitted });
  React.useEffect(() => {
    const previous = previousView.current;
    previousView.current = { phase, mcqSubmitted };
    if (previous.phase === phase && previous.mcqSubmitted === mcqSubmitted) return;
    (mcqSubmitted ? resultRef.current : phaseHeadingRef.current)?.focus();
  }, [phase, mcqSubmitted]);

  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSec, setTimerSec] = useState(120);
  const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  React.useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  // ── Timer for compression practice ────────────────────────────────────────
  function startTimer() {
    if (timerRef.current) clearInterval(timerRef.current);
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
    <div style={S.root} data-codelab>
      {/* Header */}
      <div style={S.header}>
        <button onClick={onBack} style={S.backBtn}>← Back</button>
        <div style={S.lessonTag}>
          {lesson.track.toUpperCase()} · {lesson.order}/{lesson.track === "acls" ? ACLS_LESSONS.length : BLS_LESSONS.length} · ~{lesson.durationMin} min
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
          <h2 ref={phaseHeadingRef} tabIndex={-1} style={{ ...S.phaseLabel, marginTop: 0 }}>KEY POINTS</h2>
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
          <h2 ref={phaseHeadingRef} tabIndex={-1} style={{ ...S.phaseLabel, marginTop: 0 }}>PRACTICE</h2>
          <div style={S.practicePrompt}>{lesson.practice.prompt}</div>

          {/* Sequence */}
          {lesson.practice.type === "sequence" && lesson.practice.items && (
            <div>
              <div style={S.seqNote}>Select two steps to swap their order</div>
              {sequenceOrder.map((origIdx, position) => (
                <button type="button" aria-pressed={seqSelected === position}
                  key={origIdx}
                  style={{
                    ...S.seqItem,
                    ...(seqSelected === position ? S.seqItemSelected : {}),
                  }}
                  onClick={() => handleSeqTap(position)}
                >
                  <span style={S.seqNum}>{position + 1}</span>
                  <span style={S.seqText}>{lesson.practice.items![origIdx]}</span>
                </button>
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
                    <button type="button" aria-pressed={checkedItems.has(i)}
                      key={i}
                      style={{
                        ...S.checkItem,
                        ...(checkedItems.has(i) ? S.checkItemDone : {}),
                      }}
                      onClick={() => {
                        const next = new Set(checkedItems);
                        if (next.has(i)) next.delete(i); else next.add(i);
                        setCheckedItems(next);
                      }}
                    >
                      <span style={{
                        ...S.checkbox,
                        ...(checkedItems.has(i) ? S.checkboxDone : {}),
                      }}>
                        {checkedItems.has(i) ? "✓" : ""}
                      </span>
                      <span style={S.checkText}>{item}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Checklist */}
          {lesson.practice.type === "checklist" && lesson.practice.items && (
            <div>
              {lesson.practice.items.map((item, i) => (
                <button type="button" aria-pressed={checkedItems.has(i)}
                  key={i}
                  style={{
                    ...S.checkItem,
                    ...(checkedItems.has(i) ? S.checkItemDone : {}),
                  }}
                  onClick={() => {
                    const next = new Set(checkedItems);
                    if (next.has(i)) next.delete(i); else next.add(i);
                    setCheckedItems(next);
                  }}
                >
                  <span style={{
                    ...S.checkbox,
                    ...(checkedItems.has(i) ? S.checkboxDone : {}),
                  }}>
                    {checkedItems.has(i) ? "✓" : ""}
                  </span>
                  <span style={S.checkText}>{item}</span>
                </button>
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
                You can continue to the knowledge check while this activity is being prepared.
              </div>
            </div>
          )}

          {lesson.practice.type === 'algorithm' && lesson.practice.items && (
            <ol>{lesson.practice.items.map(item => <li key={item}>{item}</li>)}</ol>
          )}
          {lesson.track === 'acls' && lesson.practice.type === 'drug_drill' && (
            <dl>{lesson.practice.drugs?.map(drug => <React.Fragment key={drug.name}>
              <dt>{drug.name}</dt><dd>{drug.dose} · {drug.indication} · {drug.timing}</dd>
            </React.Fragment>)}</dl>
          )}
          <button style={S.primaryBtn} onClick={() => setPhase("mcq")}>
            Continue to Questions →
          </button>
        </div>
      )}

      {/* ── MCQ PHASE ── */}
      {phase === "mcq" && (
        <div style={S.phaseBlock}>
          <h2 ref={phaseHeadingRef} tabIndex={-1} style={{ ...S.phaseLabel, marginTop: 0 }}>CHECK YOUR KNOWLEDGE</h2>
          {lesson.mcqs.map((mcq, qi) => (
            <div key={qi} style={S.mcqBlock} role="group" aria-label={mcq.q}>
              <div style={S.mcqQ}>{mcq.q}</div>
              {mcq.options.map((opt, oi) => {
                const selected = mcqAnswers[qi] === oi;
                const correct = mcq.answerIndex === oi;
                const showResult = mcqSubmitted;
                return (
                  <button
                    type="button"
                    aria-pressed={selected}
                    disabled={mcqSubmitted}
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
                    <span style={S.mcqLetter} aria-hidden="true">
                      {String.fromCharCode(65 + oi)}
                    </span>
                    <span style={S.mcqText}>{opt}{showResult && correct ? " — Correct answer" : showResult && selected ? " — Your answer" : ""}</span>
                  </button>
                );
              })}
              {mcqSubmitted && 'explanation' in mcq && typeof mcq.explanation === 'string' && (
                <p>{mcq.explanation}</p>
              )}
            </div>
          ))}

          {!mcqSubmitted ? (
            <button
              disabled={!mcqAnswers.every((a) => a !== null)}
              style={mcqAnswers.every((a) => a !== null) ? S.primaryBtn : S.primaryBtnDisabled}
              onClick={() => {
                if (mcqAnswers.every((a) => a !== null)) setMcqSubmitted(true);
              }}
            >
              Submit Answers
            </button>
          ) : (
            <div>
              <div ref={resultRef} tabIndex={-1} role="region" aria-label="Knowledge check result" style={{
                ...S.scoreBlock,
                background: mcqScore === lesson.mcqs.length ? "var(--cv-learning-success, #064E3B)" : "var(--cv-surface-subtle, #1E3A5F)",
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
              <details style={S.reviewBlock}>
                <summary style={S.reviewSummary}>Review this lesson</summary>
                <p style={S.keyText}>Revisit the lesson’s key points before you continue.</p>
                <ul style={S.reviewList}>
                  {lesson.keyPoints.map((point, index) => (
                    <li key={index} style={S.keyText}>{point}</li>
                  ))}
                </ul>
              </details>
              {canComplete && (
                <button style={S.completeBtn} disabled={completionDisabled} onClick={() => onComplete(lesson.mcqs.length - mcqScore)}>
                  {completionLabel ?? '✓ Mark Lesson Complete'}
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
      <div style={S.disclaimer}>{lesson.track === 'acls' ? ACLS_DISCLAIMER : BLS_DISCLAIMER}</div>
    </div>
  );
}

const playerStyles: Record<string, React.CSSProperties> = {
  reviewBlock: {
    border: "1px solid var(--cv-border, #475569)",
    borderRadius: 12,
    padding: "0 16px 12px",
    marginBottom: 16,
  },
  reviewSummary: {
    minHeight: 44,
    padding: "12px 0",
    cursor: "pointer",
    fontWeight: 600,
  },
  reviewList: {
    paddingLeft: 20,
    display: "grid",
    gap: 12,
  },
  root: {
    minHeight: "auto",
    border: "1px solid var(--cv-border, #334155)",
    borderRadius: 24,
    maxWidth: 880,
    margin: "0 auto",
    background: "var(--cv-surface-elevated, #0B1220)",
    color: "var(--cv-text, #F8FAFC)",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
    paddingBottom: 24,
    overflowY: "auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 20px",
    borderBottom: "1px solid var(--cv-border, #334155)",
  },
  backBtn: {
    background: "none",
    border: "none",
    color: "var(--cv-text-secondary, #94A3B8)",
    fontSize: 15,
    cursor: "pointer",
    minHeight: 44,
  },
  lessonTag: {
    fontSize: 12,
    color: "var(--cv-text-secondary, #94A3B8)",
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
    color: "var(--cv-text-secondary, #94A3B8)",
    lineHeight: 1.5,
    marginBottom: 20,
  },
  phaseBlock: {
    padding: "0 20px",
  },
  phaseLabel: {
    fontSize: 12,
    letterSpacing: 2,
    color: "var(--cv-teal, #2dd4bf)",
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
    background: "var(--cv-teal, #2dd4bf)",
    flexShrink: 0,
    marginTop: 6,
  },
  keyText: {
    fontSize: 14,
    color: "var(--cv-text, #CBD5E1)",
    lineHeight: 1.5,
  },
  videoBrief: {
    background: "var(--cv-surface-subtle, #111827)",
    border: "1px solid var(--cv-border, #334155)",
    borderRadius: 14,
    padding: "16px",
    margin: "20px 0",
    textAlign: "center" as const,
  },
  videoIcon: {
    fontSize: 28,
    marginBottom: 8,
    color: "var(--cv-learning-danger, #f87171)",
  },
  videoText: {
    fontSize: 13,
    color: "var(--cv-text-secondary, #94A3B8)",
    lineHeight: 1.5,
    marginBottom: 6,
  },
  videoNote: {
    fontSize: 12,
    color: "var(--cv-text-secondary, #94A3B8)",
    fontStyle: "italic",
  },
  primaryBtn: {
    width: "100%",
    background: "var(--cv-learning-action, #0f766e)",
    color: "#fff",
    border: "none",
    borderRadius: 14,
    padding: "15px",
    fontWeight: 700,
    fontSize: 15,
    cursor: "pointer",
    minHeight: 44,
    marginTop: 20,
  },
  primaryBtnDisabled: {
    width: "100%",
    background: "var(--cv-border, #334155)",
    color: "var(--cv-text-secondary, #94A3B8)",
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
    color: "var(--cv-text, #F8FAFC)",
    marginBottom: 16,
  },
  seqNote: {
    fontSize: 12,
    color: "var(--cv-text-secondary, #94A3B8)",
    marginBottom: 10,
  },
  seqItem: {
    width: "100%",
    textAlign: "left",
    font: "inherit",
    display: "flex",
    alignItems: "center",
    gap: 12,
    background: "var(--cv-surface-subtle, #111827)",
    border: "1px solid var(--cv-border, #334155)",
    borderRadius: 12,
    padding: "12px 14px",
    marginBottom: 8,
    cursor: "pointer",
    minHeight: 44,
  },
  seqItemSelected: {
    borderColor: "var(--cv-learning-action, #0f766e)",
    background: "var(--cv-nav-selected, #172554)",
  },
  seqNum: {
    width: 24,
    height: 24,
    borderRadius: 8,
    background: "var(--cv-border, #334155)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    fontWeight: 700,
    color: "var(--cv-text-secondary, #94A3B8)",
    flexShrink: 0,
  },
  seqText: {
    fontSize: 14,
    color: "var(--cv-text, #CBD5E1)",
  },
  timerDisplay: {
    fontSize: 56,
    fontWeight: 800,
    textAlign: "center" as const,
    color: "var(--cv-learning-danger, #f87171)",
    letterSpacing: -2,
    margin: "10px 0 4px",
  },
  timerSub: {
    fontSize: 13,
    color: "var(--cv-text-secondary, #94A3B8)",
    textAlign: "center" as const,
    marginBottom: 4,
  },
  timerBpm: {
    fontSize: 12,
    color: "var(--cv-teal, #2dd4bf)",
    textAlign: "center" as const,
    marginBottom: 14,
  },
  timerBtnStart: {
    width: "100%",
    background: "var(--cv-learning-danger, #f87171)",
    color: "#fff",
    border: "none",
    borderRadius: 14,
    padding: "14px",
    fontWeight: 700,
    fontSize: 15,
    cursor: "pointer",
    minHeight: 44,
  },
  timerBtnStop: {
    width: "100%",
    background: "var(--cv-border, #334155)",
    color: "var(--cv-text-secondary, #94A3B8)",
    border: "none",
    borderRadius: 14,
    padding: "14px",
    fontWeight: 700,
    fontSize: 15,
    cursor: "pointer",
    minHeight: 44,
  },
  checklistLabel: {
    fontSize: 12,
    letterSpacing: 1.5,
    color: "var(--cv-text-secondary, #94A3B8)",
    fontWeight: 700,
    marginBottom: 10,
  },
  checkItem: {
    width: "100%",
    textAlign: "left",
    font: "inherit",
    display: "flex",
    alignItems: "center",
    gap: 12,
    background: "var(--cv-surface-subtle, #111827)",
    border: "1px solid var(--cv-border, #334155)",
    borderRadius: 12,
    padding: "12px 14px",
    marginBottom: 8,
    cursor: "pointer",
    minHeight: 44,
  },
  checkItemDone: {
    borderColor: "var(--cv-teal, #2dd4bf)",
    background: "var(--cv-learning-success, #042F2E)",
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    border: "2px solid var(--cv-border, #475569)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    color: "var(--cv-teal, #2dd4bf)",
    fontWeight: 700,
    flexShrink: 0,
  },
  checkboxDone: {
    background: "var(--cv-teal, #2dd4bf)",
    border: "2px solid var(--cv-teal, #2dd4bf)",
    color: "#fff",
  },
  checkText: {
    fontSize: 14,
    color: "var(--cv-text, #CBD5E1)",
  },
  placeholderBlock: {
    background: "var(--cv-surface-subtle, #111827)",
    border: "1px solid var(--cv-border, #334155)",
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
    color: "var(--cv-text-secondary, #94A3B8)",
    marginBottom: 4,
  },
  placeholderSub: {
    fontSize: 12,
    color: "var(--cv-text-secondary, #94A3B8)",
  },
  mcqBlock: {
    marginBottom: 24,
  },
  mcqQ: {
    fontSize: 15,
    fontWeight: 600,
    color: "var(--cv-text, #F8FAFC)",
    lineHeight: 1.5,
    marginBottom: 12,
  },
  mcqOption: {
    width: "100%",
    textAlign: "left",
    font: "inherit",
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
    background: "var(--cv-surface-subtle, #111827)",
    border: "1px solid var(--cv-border, #334155)",
    borderRadius: 12,
    padding: "12px 14px",
    marginBottom: 8,
    cursor: "pointer",
    minHeight: 44,
  },
  mcqSelected: {
    borderColor: "var(--cv-learning-action, #0f766e)",
    background: "var(--cv-nav-selected, #172554)",
  },
  mcqCorrect: {
    borderColor: "var(--cv-teal, #2dd4bf)",
    background: "var(--cv-learning-success, #042F2E)",
  },
  mcqWrong: {
    borderColor: "var(--cv-learning-danger, #f87171)",
    background: "var(--cv-learning-error, #2D0A0A)",
  },
  mcqLetter: {
    width: 22,
    height: 22,
    borderRadius: 6,
    background: "var(--cv-border, #334155)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    fontWeight: 700,
    color: "var(--cv-text-secondary, #94A3B8)",
    flexShrink: 0,
  },
  mcqText: {
    fontSize: 14,
    color: "var(--cv-text, #CBD5E1)",
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
    color: "var(--cv-text-secondary, #94A3B8)",
  },
  completeBtn: {
    width: "100%",
    background: "var(--cv-learning-action, #0f766e)",
    color: "#fff",
    border: "none",
    borderRadius: 14,
    padding: "15px",
    fontWeight: 700,
    fontSize: 15,
    cursor: "pointer",
    minHeight: 44,
  },
  retryBtn: {
    width: "100%",
    background: "var(--cv-border, #334155)",
    color: "var(--cv-text-secondary, #94A3B8)",
    border: "none",
    borderRadius: 14,
    padding: "15px",
    fontWeight: 700,
    fontSize: 15,
    cursor: "pointer",
    minHeight: 44,
  },
  disclaimer: {
    margin: "24px 20px 0",
    fontSize: 12,
    color: "var(--cv-text-secondary, #94A3B8)",
    lineHeight: 1.6,
    borderTop: "1px solid var(--cv-border, #334155)",
    paddingTop: 14,
  },
};
