"use client";

/**
 * ClinicalPanel V2 — SOAP persistence + Discharge writer
 * Inline styles · no CSS template literal traps for shell tooling
 */

import { useMemo, useState } from "react";
import type {
  ClinicalBundle,
  DischargeSummary,
  MedicationItem,
  SoapNote,
  TrackingMetric,
} from "./clinicalTypes";
import {
  createSoapNote,
  isSoapMeaningful,
  localSoapStore,
  mergeSoapNotes,
} from "./soapStorage";
import {
  buildDischargeDraft,
  dischargeReadiness,
  loadDischarge,
  saveDischargeDraft,
} from "./dischargeWriter";

const T = {
  teal: "#2DD4BF",
  tealD: "#0F766E",
  bg: "#080C16",
  white: "#111827",
  text: "#F8FAFC",
  sub: "#CBD5E1",
  muted: "#94A3B8",
  border: "rgba(148,163,184,0.20)",
  red: "#F87171",
  amber: "#FBBF24",
  green: "#34D399",
};

type Tab = "track" | "soap" | "meds" | "report" | "discharge";
type EditableDischargeField = "diagnosis" | "hospitalCourse" | "procedures" | "followUp";

interface Props {
  patientId: string;
  patientName: string;
  diagnosis: string;
  bundle: ClinicalBundle;
  canDischarge?: boolean;
  /** Optional: parent can also mirror notes into global patient state */
  onSoapSaved?: (notes: SoapNote[]) => void;
  onDischargeSaved?: (summary: DischargeSummary) => void;
}

export default function ClinicalPanelV2({
  patientId,
  patientName,
  diagnosis,
  bundle,
  canDischarge,
  onSoapSaved,
  onDischargeSaved,
}: Props) {
  const [tab, setTab] = useState<Tab>("track");
  const [notes, setNotes] = useState<SoapNote[]>(() =>
    mergeSoapNotes(bundle.soapNotes || [], localSoapStore.list(patientId))
  );
  const [s, setS] = useState("");
  const [o, setO] = useState("");
  const [a, setA] = useState("");
  const [p, setP] = useState("");
  const [discharge, setDischarge] = useState<DischargeSummary | null>(() =>
    loadDischarge(patientId) || bundle.discharge || null
  );
  const [saveMsg, setSaveMsg] = useState("");

  const tabs = useMemo(
    function () {
      return [
        { id: "track" as Tab, label: "Tracking" },
        { id: "soap" as Tab, label: "SOAP" },
        { id: "meds" as Tab, label: "Meds" },
        { id: "report" as Tab, label: "Report" },
        { id: "discharge" as Tab, label: "Discharge" },
      ];
    },
    []
  );

  function saveSoap() {
    if (!isSoapMeaningful(s, o, a, p)) {
      setSaveMsg("Write at least one SOAP field");
      return;
    }
    const note = createSoapNote({
      subjective: s,
      objective: o,
      assessment: a,
      plan: p,
      authorName: "You",
    });
    const next = localSoapStore.append(patientId, note);
    const merged = mergeSoapNotes(bundle.soapNotes || [], next);
    setNotes(merged);
    setS("");
    setO("");
    setA("");
    setP("");
    setSaveMsg("SOAP saved");
    if (onSoapSaved) onSoapSaved(merged);
  }

  function generateDischargeDraft() {
    const draft = buildDischargeDraft({
      patientName: patientName,
      diagnosis: diagnosis,
      activeMeds: bundle.medications,
      recentSoap: notes,
      hospitalCourse: bundle.report,
      homeInstructions: bundle.discharge ? bundle.discharge.homeInstructions : undefined,
      procedures: bundle.discharge ? bundle.discharge.procedures : undefined,
      followUp: bundle.discharge ? bundle.discharge.followUp : undefined,
    });
    saveDischargeDraft(patientId, draft);
    setDischarge(draft);
    setSaveMsg("Discharge draft saved");
    if (onDischargeSaved) onDischargeSaved(draft);
    setTab("discharge");
  }

  function updateDischargeField(field: EditableDischargeField, value: string) {
    const base =
      discharge ||
      buildDischargeDraft({
        patientName: patientName,
        diagnosis: diagnosis,
        activeMeds: bundle.medications,
        recentSoap: notes,
      });
    const next: DischargeSummary = { ...base, [field]: value };
    setDischarge(next);
  }

  function persistDischarge() {
    if (!discharge) {
      setSaveMsg("Generate a discharge draft before saving");
      setTab("discharge");
      return;
    }
    saveDischargeDraft(patientId, discharge);
    setSaveMsg("Discharge summary saved");
    if (onDischargeSaved) onDischargeSaved(discharge);
  }

  const readiness = dischargeReadiness(discharge);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {bundle.alerts && bundle.alerts.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {bundle.alerts.map(function (al) {
            const color =
              al.level === "critical" ? T.red : al.level === "watch" ? T.amber : T.teal;
            return (
              <div
                key={al.id}
                style={{
                  background: T.white,
                  border: "1px solid " + T.border,
                  borderLeft: "3px solid " + color,
                  borderRadius: 12,
                  padding: "10px 12px",
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 800, color: color }}>{al.label}</div>
                {al.detail ? (
                  <div style={{ fontSize: 12, color: T.sub, marginTop: 3 }}>{al.detail}</div>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : null}

      <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 2 }}>
        {tabs.map(function (t) {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={function () {
                setTab(t.id);
              }}
              style={{
                flexShrink: 0,
                borderRadius: 99,
                padding: "7px 12px",
                fontSize: 12,
                fontWeight: 700,
                border: active ? "1px solid " + T.tealD : "1px solid " + T.border,
                background: active ? T.tealD : T.white,
                color: active ? "#fff" : T.sub,
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {saveMsg ? (
        <div role="status" aria-live="polite" style={{ fontSize: 12, color: T.teal, fontWeight: 700 }}>{saveMsg}</div>
      ) : null}

      {tab === "track" ? <TrackingView metrics={bundle.metrics} /> : null}

      {tab === "soap" ? (
        <SoapView
          notes={notes}
          s={s}
          o={o}
          a={a}
          p={p}
          setS={setS}
          setO={setO}
          setA={setA}
          setP={setP}
          onSave={saveSoap}
        />
      ) : null}

      {tab === "meds" ? <MedsView meds={bundle.medications} /> : null}

      {tab === "report" ? (
        <BlockCard
          title={"Clinical Report · " + patientName}
          body={
            bundle.report ||
            "No formal report yet. Save SOAP notes to strengthen the narrative."
          }
        />
      ) : null}

      {tab === "discharge" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={generateDischargeDraft}
              style={{
                border: "none",
                background: T.tealD,
                color: "#fff",
                borderRadius: 12,
                padding: "10px 12px",
                fontSize: 12,
                fontWeight: 800,
              }}
            >
              Generate / Refresh Draft
            </button>
            <button
              type="button"
              onClick={persistDischarge}
              disabled={!discharge}
              title={!discharge ? "Generate a discharge draft before saving" : undefined}
              style={{
                border: "1px solid " + T.border,
                background: T.white,
                color: T.text,
                borderRadius: 12,
                padding: "10px 12px",
                fontSize: 12,
                fontWeight: 800,
                cursor: discharge ? "pointer" : "not-allowed",
                opacity: discharge ? 1 : 0.55,
              }}
            >
              Save Summary
            </button>
          </div>

          {!discharge ? <Empty text="Generate a discharge draft before saving." /> : null}

          {!canDischarge ? (
            <Empty text="Patient is not marked ready_for_discharge yet — you can still draft the summary." />
          ) : null}

          {!readiness.ready ? (
            <Empty text={"Missing: " + readiness.missing.join(", ")} />
          ) : (
            <div style={{ fontSize: 12, color: T.green, fontWeight: 700 }}>
              Discharge checklist complete (simulation)
            </div>
          )}

          {discharge ? (
            <DischargeEditor
              value={discharge}
              onChange={updateDischargeField}
            />
          ) : (
            <Empty text="No discharge summary yet — generate a draft." />
          )}
        </div>
      ) : null}
    </div>
  );
}

function TrackingView(props: { metrics: TrackingMetric[] }) {
  if (!props.metrics || props.metrics.length === 0) {
    return <Empty text="No tracking metrics for this case yet" />;
  }
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
      {props.metrics.map(function (m) {
        return (
          <div
            key={m.id}
            style={{
              background: T.white,
              border: "1px solid " + T.border,
              borderRadius: 14,
              padding: "12px 12px",
            }}
          >
            <div style={{ fontSize: 11, color: T.muted, fontWeight: 700 }}>{m.label}</div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 800,
                color: m.abnormal ? T.red : T.text,
                marginTop: 4,
              }}
            >
              {m.value}
              {m.unit ? (
                <span style={{ fontSize: 11, color: T.muted, marginLeft: 4 }}>{m.unit}</span>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SoapView(props: {
  notes: SoapNote[];
  s: string;
  o: string;
  a: string;
  p: string;
  setS: (v: string) => void;
  setO: (v: string) => void;
  setA: (v: string) => void;
  setP: (v: string) => void;
  onSave: () => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div
        style={{
          background: T.white,
          border: "1px solid " + T.border,
          borderRadius: 16,
          padding: 12,
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 800, color: T.text, marginBottom: 8 }}>
          New SOAP note
        </div>
        {/* Educational hint */}
        <div style={{ fontSize: 11, color: T.muted, marginBottom: 8, lineHeight: 1.4 }}>
          S = symptoms · O = vitals/exam/labs · A = impression · P = next actions. Notes are
          append-only and saved on this device until cloud DB is connected.
        </div>
        <SoapField label="S · Subjective" value={props.s} onChange={props.setS} placeholder="Patient-reported symptoms..." />
        <SoapField label="O · Objective" value={props.o} onChange={props.setO} placeholder="Vitals, exam, labs..." />
        <SoapField label="A · Assessment" value={props.a} onChange={props.setA} placeholder="Clinical impression..." />
        <SoapField label="P · Plan" value={props.p} onChange={props.setP} placeholder="Next actions..." />
        <button
          onClick={props.onSave}
          style={{
            width: "100%",
            marginTop: 6,
            border: "none",
            borderRadius: 12,
            padding: "12px 14px",
            background: T.tealD,
            color: "#fff",
            fontWeight: 800,
            fontSize: 13,
          }}
        >
          Save SOAP note
        </button>
      </div>

      {props.notes && props.notes.length > 0 ? (
        props.notes
          .slice()
          .reverse()
          .map(function (n) {
            return (
              <div
                key={n.id}
                style={{
                  background: T.white,
                  border: "1px solid " + T.border,
                  borderRadius: 16,
                  padding: 12,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 8,
                    marginBottom: 8,
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 800, color: T.text }}>
                    {n.author + " · " + n.shift}
                  </div>
                  <div style={{ fontSize: 11, color: T.muted }}>{formatTime(n.at)}</div>
                </div>
                <SoapLine k="S" v={n.subjective} />
                <SoapLine k="O" v={n.objective} />
                <SoapLine k="A" v={n.assessment} />
                <SoapLine k="P" v={n.plan} />
              </div>
            );
          })
      ) : (
        <Empty text="No SOAP notes yet — add the first entry above" />
      )}
    </div>
  );
}

function SoapField(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ fontSize: 11, fontWeight: 800, color: T.muted, marginBottom: 4 }}>
        {props.label}
      </div>
      <textarea
        value={props.value}
        onChange={function (e) {
          props.onChange(e.target.value);
        }}
        placeholder={props.placeholder}
        rows={2}
        style={{
          width: "100%",
          resize: "vertical",
          borderRadius: 10,
          border: "1px solid " + T.border,
          padding: "8px 10px",
          fontSize: 13,
          color: T.text,
          background: T.white,
          outline: "none",
          boxSizing: "border-box",
        }}
      />
    </div>
  );
}

function SoapLine(props: { k: string; v: string }) {
  if (!props.v) return null;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "22px 1fr", gap: 6, marginTop: 4 }}>
      <div style={{ fontSize: 11, fontWeight: 900, color: T.tealD }}>{props.k}</div>
      <div style={{ fontSize: 12, color: T.sub, lineHeight: 1.45 }}>{props.v}</div>
    </div>
  );
}

function MedsView(props: { meds: MedicationItem[] }) {
  if (!props.meds || props.meds.length === 0) return <Empty text="No medications recorded" />;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {props.meds.map(function (m) {
        return (
          <div
            key={m.id}
            style={{
              background: T.white,
              border: "1px solid " + T.border,
              borderRadius: 14,
              padding: "11px 12px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: T.text }}>{m.name}</div>
              <div style={{ fontSize: 10, color: m.status === "active" ? T.green : T.muted, fontWeight: 800 }}>
                {m.status.toUpperCase()}
              </div>
            </div>
            <div style={{ fontSize: 12, color: T.sub, marginTop: 4 }}>
              {m.dose} · {m.route} · {m.frequency}
            </div>
            {m.indication ? (
              <div style={{ fontSize: 11, color: T.muted, marginTop: 3 }}>{m.indication}</div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function DischargeEditor(props: {
  value: DischargeSummary;
  onChange: (field: EditableDischargeField, value: string) => void;
}) {
  const d = props.value;
  return (
    <div style={{ background: T.white, border: "1px solid " + T.border, borderRadius: 16, padding: 12 }}>
      <EditorField label="Diagnosis" value={d.diagnosis} onChange={(v) => props.onChange("diagnosis", v)} />
      <EditorField label="Hospital course" value={d.hospitalCourse} onChange={(v) => props.onChange("hospitalCourse", v)} multiline />
      <EditorField label="Procedures" value={d.procedures} onChange={(v) => props.onChange("procedures", v)} multiline />
      <EditorField label="Follow-up" value={d.followUp} onChange={(v) => props.onChange("followUp", v)} multiline />
    </div>
  );
}

function EditorField(props: { label: string; value: string; onChange: (v: string) => void; multiline?: boolean }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 11, fontWeight: 800, color: T.muted, marginBottom: 4 }}>{props.label}</div>
      {props.multiline ? (
        <textarea
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
          rows={3}
          style={{ width: "100%", boxSizing: "border-box", border: "1px solid " + T.border, borderRadius: 10, padding: "8px 10px", fontSize: 12, color: T.text, background: T.bg }}
        />
      ) : (
        <input
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
          style={{ width: "100%", boxSizing: "border-box", border: "1px solid " + T.border, borderRadius: 10, padding: "8px 10px", fontSize: 12, color: T.text, background: T.bg }}
        />
      )}
    </div>
  );
}

function BlockCard(props: { title: string; body: string }) {
  return (
    <div style={{ background: T.white, border: "1px solid " + T.border, borderRadius: 16, padding: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 800, color: T.text }}>{props.title}</div>
      <div style={{ fontSize: 12, color: T.sub, marginTop: 7, lineHeight: 1.55, whiteSpace: "pre-wrap" }}>{props.body}</div>
    </div>
  );
}

function Empty(props: { text: string }) {
  return (
    <div style={{ background: T.white, border: "1px dashed " + T.border, borderRadius: 14, padding: 12, fontSize: 12, color: T.muted }}>
      {props.text}
    </div>
  );
}

function formatTime(at: string) {
  try {
    return new Date(at).toLocaleString();
  } catch {
    return at;
  }
}
