"use client";
/**
 * MegacodeRunner.tsx
 * Save to: app/components/ward/MegacodeRunner.tsx
 * Megacode v2 — VF · PE · Sepsis interactive simulation
 * Educational only. Not real-time clinical guidance.
 */

import React, { useState, useEffect, useRef, useCallback } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────
export type CaseId = "mega_vf_01" | "mega_pe_01" | "mega_sepsis_01";

type MegaPhase =
  | "init" | "cpr" | "defib" | "rhythm" | "shock"
  | "drug" | "stabilize" | "post_rosc" | "ended";

interface MegaEvent {
  t: number;
  type: string;
  ok: boolean;
  note: string;
}

interface MegaDebrief {
  well: string[];
  improve: string[];
}

export interface MegaResult {
  caseId: CaseId;
  score: number;
  passed: boolean;
  xp: number;
  wrong: number;
  elapsedSec: number;
  debrief: MegaDebrief;
  events: MegaEvent[];
}

export interface MegacodeRunnerProps {
  caseId: CaseId;
  onClose: () => void;
  onFinished?: (result: MegaResult) => void;
}

// ── Case definitions ──────────────────────────────────────────────────────────
const CASES = {
  mega_vf_01: {
    title: "Ventricular Fibrillation",
    setting: "CCU · 58M · Post-STEMI Day 2 · Monitor alarm — unresponsive, no pulse",
    timeLimitSec: 480,
    xp: 100,
    color: "#EF4444",
    phases: ["init", "cpr", "defib", "rhythm", "shock", "drug", "post_rosc", "ended"] as MegaPhase[],
    actions: {
      init: [
        { id: "confirm_arrest", label: "Confirm unresponsive / no pulse", critical: true, ok: true, next: "cpr" as MegaPhase },
        { id: "skip_to_defib", label: "Skip straight to defibrillation", critical: true, ok: false, next: null },
      ],
      cpr: [
        { id: "start_cpr", label: "Start chest compressions", critical: true, ok: true, next: "defib" as MegaPhase },
        { id: "call_code", label: "Call code team + get AED", critical: false, ok: true, next: null },
        { id: "check_pulse_again", label: "Recheck pulse for 30s", critical: true, ok: false, next: null },
      ],
      defib: [
        { id: "attach_pads", label: "Attach defib pads", critical: false, ok: true, next: null },
        { id: "rhythm_check", label: "Rhythm check → VF confirmed", critical: true, ok: true, next: "rhythm" as MegaPhase },
        { id: "shock_without_check", label: "Shock without rhythm check", critical: true, ok: false, next: null },
      ],
      rhythm: [
        { id: "charge_clear", label: "Charge → clear → deliver shock", critical: true, ok: true, next: "shock" as MegaPhase },
        { id: "resume_cpr_only", label: "Resume CPR without shocking VF", critical: true, ok: false, next: null },
      ],
      shock: [
        { id: "resume_cpr_2min", label: "Resume CPR immediately × 2 min", critical: true, ok: true, next: "drug" as MegaPhase },
        { id: "check_rosc_early", label: "Stop CPR immediately to check pulse", critical: true, ok: false, next: null },
      ],
      drug: [
        { id: "epi_1mg", label: "Epinephrine 1mg IV (educational)", critical: false, ok: true, next: null },
        { id: "rhythm_check_2", label: "Rhythm check after 2-min cycle", critical: true, ok: true, next: "post_rosc" as MegaPhase },
        { id: "atropine_vf", label: "Atropine for VF", critical: true, ok: false, next: null },
      ],
      post_rosc: [
        { id: "abc_post", label: "ABC + O2 + vitals post-ROSC", critical: true, ok: true, next: "ended" as MegaPhase },
        { id: "ecg_12lead", label: "12-lead ECG", critical: false, ok: true, next: null },
        { id: "ignore_postrosc", label: "Discharge immediately", critical: true, ok: false, next: null },
      ],
      ended: [],
    },
    debrief: {
      passed: {
        well: ["Recognized arrest promptly", "Started CPR before defibrillation", "Correct shock sequence", "Post-ROSC bundle initiated"],
        improve: ["Minimize CPR interruptions during defib setup", "Epinephrine timing optimization"],
      },
      failed: {
        well: ["Attempted response"],
        improve: ["Always confirm arrest before any intervention", "CPR must precede defibrillation", "Never skip post-ROSC care"],
      },
    },
  },
  mega_pe_01: {
    title: "High-Risk Pulmonary Embolism",
    setting: "Ward · 44F · Post long-haul flight · Sudden collapse · HR 135 · BP 80/50 · O2 82%",
    timeLimitSec: 420,
    xp: 110,
    color: "#8B5CF6",
    phases: ["init", "stabilize", "drug", "post_rosc", "ended"] as MegaPhase[],
    actions: {
      init: [
        { id: "abc_o2", label: "Airway + O2 high-flow immediately", critical: true, ok: true, next: "stabilize" as MegaPhase },
        { id: "iv_access", label: "IV access + bloods + ECG", critical: false, ok: true, next: null },
        { id: "wait_xray", label: "Wait for CXR before O2", critical: true, ok: false, next: null },
      ],
      stabilize: [
        { id: "recognize_pe", label: "Recognize high-risk PE pattern (shock + hypoxia)", critical: true, ok: true, next: "drug" as MegaPhase },
        { id: "fluid_bolus", label: "Cautious fluid bolus (250ml)", critical: false, ok: true, next: null },
        { id: "aggressive_fluids", label: "Aggressive 2L fluid bolus", critical: true, ok: false, next: null },
      ],
      drug: [
        { id: "anticoag_consider", label: "Consider anticoagulation (educational)", critical: false, ok: true, next: null },
        { id: "escalate_senior", label: "Escalate to senior + CTPA", critical: true, ok: true, next: "post_rosc" as MegaPhase },
        { id: "thrombolysis_alone", label: "Administer thrombolysis without imaging", critical: true, ok: false, next: null },
      ],
      post_rosc: [
        { id: "monitoring", label: "Continuous monitoring + ICU referral", critical: true, ok: true, next: "ended" as MegaPhase },
        { id: "reassess_vitals", label: "Reassess vitals + response", critical: false, ok: true, next: null },
        { id: "discharge_stable", label: "Discharge as stable", critical: true, ok: false, next: null },
      ],
      ended: [],
      cpr: [], defib: [], rhythm: [], shock: [],
    },
    debrief: {
      passed: {
        well: ["Immediate O2 + airway", "Recognized high-risk PE pattern", "Appropriate escalation", "ICU referral"],
        improve: ["Fluid management in RV failure needs caution", "Early senior involvement"],
      },
      failed: {
        well: ["Attempted initial assessment"],
        improve: ["O2 is always first", "Aggressive fluids worsen RV failure in PE", "Imaging before thrombolysis when patient is not in arrest"],
      },
    },
  },
  mega_sepsis_01: {
    title: "Septic Shock",
    setting: "Ward · 67M · Temp 39.8°C · BP 72/40 · HR 138 · GCS 13 · Lactate 4.8",
    timeLimitSec: 420,
    xp: 100,
    color: "#F59E0B",
    phases: ["init", "stabilize", "drug", "post_rosc", "ended"] as MegaPhase[],
    actions: {
      init: [
        { id: "recognize_shock", label: "Recognize septic shock pattern", critical: true, ok: true, next: "stabilize" as MegaPhase },
        { id: "cultures_blood", label: "Blood cultures × 2 before antibiotics", critical: false, ok: true, next: null },
        { id: "delay_abx", label: "Delay antibiotics until all cultures done (>1h)", critical: true, ok: false, next: null },
      ],
      stabilize: [
        { id: "iv_fluid_30ml", label: "IV fluids 30ml/kg crystalloid", critical: true, ok: true, next: "drug" as MegaPhase },
        { id: "reassess_fluid", label: "Reassess perfusion after fluids", critical: false, ok: true, next: null },
        { id: "no_fluids", label: "Withhold fluids — wait for echo", critical: true, ok: false, next: null },
      ],
      drug: [
        { id: "broad_abx", label: "Broad-spectrum antibiotics (educational)", critical: true, ok: true, next: "post_rosc" as MegaPhase },
        { id: "vasopressors", label: "Vasopressors if refractory", critical: false, ok: true, next: null },
        { id: "steroids_first", label: "Steroids before antibiotics", critical: true, ok: false, next: null },
      ],
      post_rosc: [
        { id: "icu_referral", label: "ICU referral + source control", critical: true, ok: true, next: "ended" as MegaPhase },
        { id: "monitor_lactate", label: "Lactate trend monitoring", critical: false, ok: true, next: null },
        { id: "discharge_improved", label: "Discharge when BP improves", critical: true, ok: false, next: null },
      ],
      ended: [],
      cpr: [], defib: [], rhythm: [], shock: [],
    },
    debrief: {
      passed: {
        well: ["Recognized septic shock early", "Cultures before antibiotics", "Appropriate fluid resuscitation", "ICU escalation"],
        improve: ["Lactate clearance monitoring", "Source control planning"],
      },
      failed: {
        well: ["Attempted assessment"],
        improve: ["Cultures should precede antibiotics but NOT delay them", "Early fluids are life-saving in septic shock", "Steroids are adjunct, not first-line"],
      },
    },
  },
};

const DISCLAIMER =
  "Educational simulation only. Not real-time clinical guidance. Not an official AHA course.";

// ── Component ─────────────────────────────────────────────────────────────────
export default function MegacodeRunner({ caseId, onClose, onFinished }: MegacodeRunnerProps) {
  const caseData = CASES[caseId];
  const [phase, setPhase] = useState<MegaPhase>("init");
  const [events, setEvents] = useState<MegaEvent[]>([]);
  const [wrong, setWrong] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [finished, setFinished] = useState(false);
  const [result, setResult] = useState<MegaResult | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);

  // ── Timer ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (finished) return;
    timerRef.current = setInterval(() => {
      setElapsed((e) => {
        const next = e + 1;
        if (next >= caseData.timeLimitSec) {
          clearInterval(timerRef.current!);
          handleEnd(wrong, correct, next, true);
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [finished]);

  // Auto-scroll log
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [events]);

  const addEvent = useCallback((type: string, ok: boolean, note: string) => {
    setEvents((prev) => [...prev, { t: elapsed, type, ok, note }]);
  }, [elapsed]);

  const handleEnd = useCallback((w: number, c: number, e: number, timedOut: boolean) => {
    if (startedRef.current) return;
    startedRef.current = true;
    clearInterval(timerRef.current!);

    const passed = !timedOut && w < 2;
    const base = Math.max(0, 100 - w * 15);
    const score = passed ? Math.min(100, base + Math.round((c / 5) * 20)) : Math.max(0, base - 20);
    const xp = passed ? caseData.xp : Math.round(caseData.xp * 0.25);
    const debriefKey = passed ? "passed" : "failed";
    const debrief = caseData.debrief[debriefKey];

    const r: MegaResult = {
      caseId, score, passed, xp, wrong: w,
      elapsedSec: e, debrief, events,
    };

    // Persist
    try {
      const prev = JSON.parse(localStorage.getItem("cliniverse_megaruns") || "[]");
      prev.push({ caseId, score, passed, xp, elapsedSec: e, ts: Date.now() });
      localStorage.setItem("cliniverse_megaruns", JSON.stringify(prev.slice(-20)));
    } catch {}

    setResult(r);
    setFinished(true);
    onFinished?.(r);
  }, [caseId, caseData, events, onFinished]);

  function handleAction(action: typeof CASES["mega_vf_01"]["actions"]["init"][0]) {
    if (finished) return;

    const newWrong = action.ok ? wrong : wrong + 1;
    const newCorrect = action.ok ? correct + 1 : correct;

    addEvent(action.label, action.ok, action.ok ? "✓ Correct" : "✗ Wrong action");

    if (!action.ok) setWrong(newWrong);
    else setCorrect(newCorrect);

    if (newWrong >= 2) {
      setTimeout(() => handleEnd(newWrong, newCorrect, elapsed, false), 300);
      return;
    }

    if (action.ok && action.next) {
      setPhase(action.next);
      if (action.next === "ended") {
        setTimeout(() => handleEnd(newWrong, newCorrect, elapsed, false), 300);
      }
    }
  }

  const timeLeft = caseData.timeLimitSec - elapsed;
  const timerPct = (timeLeft / caseData.timeLimitSec) * 100;
  const timerColor = timeLeft > 120 ? "#10B981" : timeLeft > 60 ? "#F59E0B" : "#EF4444";
  const currentActions = (caseData.actions as Record<string, typeof CASES["mega_vf_01"]["actions"]["init"]>)[phase] || [];

  // ── DEBRIEF ────────────────────────────────────────────────────────────────
  if (finished && result) {
    return (
      <div style={S.overlay}>
        <div style={S.root}>
          <div style={S.debriefHeader}>
            <div style={{
              fontSize: 48, fontWeight: 900,
              color: result.passed ? "#10B981" : "#EF4444",
              marginBottom: 4,
            }}>
              {result.passed ? "PASSED" : "FAILED"}
            </div>
            <div style={S.debriefScore}>Score: {result.score}/100</div>
            <div style={S.debriefMeta}>
              {result.xp} XP · {result.wrong} critical errors · {result.elapsedSec}s
            </div>
          </div>

          <div style={S.debriefSection}>
            <div style={S.debriefLabel}>✅ What went well</div>
            {result.debrief.well.map((w, i) => (
              <div key={i} style={S.debriefItem}>{w}</div>
            ))}
          </div>

          <div style={S.debriefSection}>
            <div style={{ ...S.debriefLabel, color: "#F59E0B" }}>⚠️ Improve</div>
            {result.debrief.improve.map((w, i) => (
              <div key={i} style={{ ...S.debriefItem, color: "#FCD34D" }}>{w}</div>
            ))}
          </div>

          <div style={S.disclaimer}>{DISCLAIMER}</div>

          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button style={S.btnSecondary} onClick={onClose}>Done</button>
            <button
              style={S.btnPrimary}
              onClick={() => {
                startedRef.current = false;
                setPhase("init");
                setEvents([]);
                setWrong(0);
                setCorrect(0);
                setElapsed(0);
                setFinished(false);
                setResult(null);
              }}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── RUN ────────────────────────────────────────────────────────────────────
  return (
    <div style={S.overlay}>
      <div style={S.root}>
        {/* Header */}
        <div style={S.runHeader}>
          <div>
            <div style={{ fontSize: 11, color: caseData.color, fontWeight: 700, letterSpacing: 1 }}>
              {caseData.title.toUpperCase()}
            </div>
            <div style={{ fontSize: 10, color: "#64748B", marginTop: 2 }}>
              {phase.toUpperCase().replace("_", " ")} phase
            </div>
          </div>
          <div style={{ textAlign: "right" as const }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: timerColor, letterSpacing: -1 }}>
              {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
            </div>
            <div style={{ fontSize: 10, color: "#64748B" }}>
              ❌ {wrong}/2 · ✅ {correct}
            </div>
          </div>
        </div>

        {/* Timer bar */}
        <div style={S.timerBar}>
          <div style={{ ...S.timerFill, width: timerPct + "%", background: timerColor }} />
        </div>

        {/* Stem */}
        <div style={S.stem}>
          <div style={{ fontSize: 10, color: caseData.color, fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>
            📍 SCENARIO
          </div>
          <div style={{ fontSize: 12, color: "#CBD5E1", lineHeight: 1.6 }}>
            {caseData.setting}
          </div>
        </div>

        {/* Event log */}
        <div ref={logRef} style={S.eventLog}>
          {events.length === 0 && (
            <div style={{ fontSize: 11, color: "#475569", fontStyle: "italic" }}>
              Awaiting first action...
            </div>
          )}
          {events.map((ev, i) => (
            <div key={i} style={{
              fontSize: 11,
              color: ev.ok ? "#10B981" : "#EF4444",
              marginBottom: 3,
            }}>
              {String(Math.floor(ev.t / 60)).padStart(2, "0")}:{String(ev.t % 60).padStart(2, "0")} · {ev.ok ? "✓" : "✗"} {ev.type}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={S.actions}>
          {currentActions.map((action) => (
            <button
              key={action.id}
              style={{
                ...S.actionBtn,
                borderColor: action.ok ? "#1E293B" : "#2D1515",
                background: action.ok ? "#111827" : "#1A0A0A",
              }}
              onClick={() => handleAction(action)}
            >
              <div style={{ fontSize: 13, fontWeight: 600, color: "#F8FAFC" }}>
                {action.label}
              </div>
              {action.critical && (
                <div style={{ fontSize: 9, color: "#64748B", marginTop: 2 }}>
                  CRITICAL ACTION
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Footer */}
        <div style={S.footer}>
          <div style={S.disclaimer}>{DISCLAIMER}</div>
          <button style={S.exitBtn} onClick={onClose}>Exit simulation</button>
        </div>
      </div>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const S: Record<string, React.CSSProperties> = {
  overlay: {
    position: "fixed" as const,
    inset: 0,
    zIndex: 9999,
    background: "#0B1220",
    display: "flex",
    flexDirection: "column" as const,
  },
  root: {
    flex: 1,
    display: "flex",
    flexDirection: "column" as const,
    padding: "16px 20px",
    overflowY: "auto" as const,
    maxWidth: 600,
    width: "100%",
    margin: "0 auto",
  },
  runHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  timerBar: {
    height: 4,
    background: "#1E293B",
    borderRadius: 2,
    overflow: "hidden" as const,
    marginBottom: 14,
  },
  timerFill: {
    height: "100%",
    borderRadius: 2,
    transition: "width 1s linear",
  },
  stem: {
    background: "#111827",
    border: "1px solid #1E293B",
    borderRadius: 12,
    padding: "12px 14px",
    marginBottom: 12,
  },
  eventLog: {
    flex: 1,
    background: "#080F1A",
    border: "1px solid #1E293B",
    borderRadius: 12,
    padding: "10px 12px",
    marginBottom: 12,
    minHeight: 80,
    maxHeight: 140,
    overflowY: "auto" as const,
    fontFamily: "monospace",
  },
  actions: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 8,
    marginBottom: 12,
  },
  actionBtn: {
    background: "#111827",
    border: "1px solid #1E293B",
    borderRadius: 12,
    padding: "13px 16px",
    cursor: "pointer",
    textAlign: "left" as const,
    transition: "border-color 0.15s",
  },
  footer: {
    borderTop: "1px solid #1E293B",
    paddingTop: 12,
  },
  disclaimer: {
    fontSize: 10,
    color: "#475569",
    lineHeight: 1.5,
    marginBottom: 8,
  },
  exitBtn: {
    background: "none",
    border: "1px solid #334155",
    borderRadius: 10,
    color: "#64748B",
    fontSize: 12,
    padding: "8px 16px",
    cursor: "pointer",
    width: "100%",
  },
  debriefHeader: {
    textAlign: "center" as const,
    marginBottom: 20,
    paddingBottom: 16,
    borderBottom: "1px solid #1E293B",
  },
  debriefScore: {
    fontSize: 18,
    fontWeight: 700,
    color: "#F8FAFC",
    marginBottom: 4,
  },
  debriefMeta: {
    fontSize: 12,
    color: "#64748B",
  },
  debriefSection: {
    marginBottom: 16,
  },
  debriefLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: "#10B981",
    letterSpacing: 1,
    marginBottom: 8,
  },
  debriefItem: {
    fontSize: 13,
    color: "#94A3B8",
    marginBottom: 6,
    paddingLeft: 8,
    borderLeft: "2px solid #1E293B",
    lineHeight: 1.4,
  },
  btnPrimary: {
    flex: 1,
    background: "linear-gradient(135deg, #1E40AF, #0D9488)",
    color: "#F8FAFC",
    border: "none",
    borderRadius: 12,
    padding: "14px",
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
  },
  btnSecondary: {
    flex: 1,
    background: "#1E293B",
    color: "#94A3B8",
    border: "none",
    borderRadius: 12,
    padding: "14px",
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
  },
};
