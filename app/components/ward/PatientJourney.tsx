"use client";
import RelatedEvidencePanel from "./RelatedEvidencePanel";
import ClinicalPanelV2 from "./ClinicalPanelV2";
import { STEMI_CLINICAL_BUNDLE } from "./stemiClinicalSeed";

import type {
  WardPatient,
  WorkupItem,
  OrderItem,
  TimelineEvent,
  Priority,
  CaseStatus,
} from "../../lib/ward/types";

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
  blue: "#60A5FA",
};

function priorityColor(p: Priority) {
  if (p === "critical") return T.red;
  if (p === "urgent") return T.amber;
  return T.green;
}

function statusLabel(s: CaseStatus) {
  const map: Record<string, string> = {
    arrived: "Arrived",
    triaged: "Triaged",
    workup_pending: "Workup Pending",
    decision_needed: "Decision Needed",
    admitted: "Admitted",
    in_treatment: "In Treatment",
    awaiting_orders: "Awaiting Orders",
    awaiting_consult: "Awaiting Consult",
    ready_for_discharge: "Ready for Discharge",
    discharged: "Discharged",
    transferred: "Transferred",
  };
  return map[s] || s;
}

function workupStatusColor(status: WorkupItem["status"]) {
  if (status === "ready") return T.teal;
  if (status === "reviewed") return T.green;
  return T.muted;
}

interface Props {
  patient: WardPatient;
  onClose: () => void;
  onRequestConsult?: (patientId: string) => void;
  consultRequested?: boolean;
  isPro?: boolean;
}

export default function PatientJourney({
  patient,
  onClose,
  onRequestConsult,
  consultRequested = false,
  isPro = false,
}: Props) {
  const accent = priorityColor(patient.priority);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 80,
        background: T.bg,
        colorScheme: "dark",
        overflowY: "auto",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 600,
          margin: "0 auto",
          paddingBottom: "calc(100px + env(safe-area-inset-bottom))",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", paddingTop: "calc(10px + env(safe-area-inset-top))" }}>
          <div
            style={{
              width: 40,
              height: 4,
              borderRadius: 99,
              background: T.border,
            }}
          />
        </div>

        <div
          style={{
            padding: "12px 20px 16px",
            borderBottom: "1px solid " + T.border,
            background: T.white,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 12,
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: T.muted,
                  letterSpacing: 0.6,
                  marginBottom: 4,
                }}
              >
                PATIENT JOURNEY
              </div>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 800,
                  color: T.text,
                  letterSpacing: "-0.02em",
                }}
              >
                {patient.name}
              </div>
              <div style={{ fontSize: 13, color: T.sub, marginTop: 4 }}>
                {patient.age}
                {patient.sex} · {patient.department.toUpperCase()}
                {patient.bed ? " · Bed " + patient.bed : ""}
              </div>
              <div style={{ fontSize: 13, color: T.text, marginTop: 6, fontWeight: 600 }}>
                {patient.diagnosis}
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              style={{
                border: "1px solid " + T.border,
                background: T.white,
                borderRadius: 99,
                padding: "8px 12px",
                fontSize: 12,
                fontWeight: 700,
                color: T.sub,
              }}
            >
              Close
            </button>
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
            <Chip label={patient.priority.toUpperCase()} color={accent} soft />
            <Chip label={statusLabel(patient.status)} color={T.sub} soft />
            {patient.assignedToMe ? <Chip label="Assigned to you" color={T.teal} soft /> : null}
          </div>
        </div>

        <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
          <Section title="Timeline">
            {patient.timeline && patient.timeline.length > 0 ? (
              patient.timeline.map(function (ev: TimelineEvent) {
                return (
                  <div key={ev.id} style={{ display: "flex", gap: 10, padding: "10px 0", borderBottom: "1px solid " + T.border }}>
                    <div style={{ width: 8, height: 8, borderRadius: 99, marginTop: 6, background: T.teal, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{ev.title}</div>
                      {ev.detail ? <div style={{ fontSize: 12, color: T.sub, marginTop: 2 }}>{ev.detail}</div> : null}
                      <div style={{ fontSize: 11, color: T.muted, marginTop: 4 }}>{formatTime(ev.at)} · {ev.type}</div>
                    </div>
                  </div>
                );
              })
            ) : <Empty text="No timeline events yet" />}
          </Section>

          <Section title="Workup">
            {patient.workup && patient.workup.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {patient.workup.map(function (w: WorkupItem) {
                  return (
                    <div key={w.id} style={{ background: T.white, border: "1px solid " + T.border, borderRadius: 14, padding: "12px 14px", borderLeft: w.critical ? "3px solid " + T.red : "3px solid " + T.border }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{w.title}</div>
                        <span style={{ fontSize: 10, fontWeight: 800, color: workupStatusColor(w.status), textTransform: "uppercase" }}>{w.status}</span>
                      </div>
                      {w.summary ? <div style={{ fontSize: 12, color: T.sub, marginTop: 4 }}>{w.summary}</div> : null}
                    </div>
                  );
                })}
              </div>
            ) : <Empty text="No workup items" />}
          </Section>

          <Section title="Related Evidence">
            <RelatedEvidencePanel templateId={patient.templateId} diagnosis={patient.diagnosis} isPro={isPro} />
          </Section>

          <Section title="Orders">
            {patient.orders && patient.orders.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {patient.orders.map(function (o: OrderItem) {
                  return (
                    <div key={o.id} style={{ background: T.white, border: "1px solid " + T.border, borderRadius: 14, padding: "12px 14px", display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start" }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{o.label}</div>
                        {o.impact ? <div style={{ fontSize: 12, color: T.sub, marginTop: 3 }}>{o.impact}</div> : null}
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 800, color: o.status === "done" ? T.green : T.amber, textTransform: "uppercase" }}>{o.status}</span>
                    </div>
                  );
                })}
              </div>
            ) : <Empty text="No orders yet" />}
          </Section>

          <Section title="Cross-Department Consult">
            {patient.consults && patient.consults.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
                {patient.consults.map(function (c) {
                  return (
                    <div key={c.id} style={{ background: T.white, border: "1px solid " + T.border, borderRadius: 14, padding: "12px 14px" }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: T.text }}>{c.fromDept.toUpperCase()} → {c.toDept.toUpperCase()}</div>
                      <div style={{ fontSize: 12, color: T.sub, marginTop: 4 }}>{c.reason}</div>
                      <div style={{ fontSize: 10, fontWeight: 800, color: c.status === "answered" ? T.green : T.amber, marginTop: 6, textTransform: "uppercase" }}>{c.status}</div>
                      {c.answer ? <div style={{ fontSize: 12, color: T.text, marginTop: 6 }}>{c.answer}</div> : null}
                    </div>
                  );
                })}
              </div>
            ) : null}

            <button
              type="button"
              onClick={function () { if (onRequestConsult) onRequestConsult(patient.id); }}
              disabled={consultRequested}
              style={{ width: "100%", border: "1px solid " + T.teal, background: "rgba(45,212,191,0.08)", color: T.teal, borderRadius: 14, padding: "12px 14px", fontSize: 13, fontWeight: 800, cursor: consultRequested ? "default" : "pointer", opacity: consultRequested ? 0.7 : 1 }}
            >
              {consultRequested ? "Consult Requested" : "Request Consult"}
            </button>
            {consultRequested ? (
              <p role="status" aria-live="polite" style={{ margin: "10px 0 0", color: T.sub, textAlign: "center", fontSize: 11 }}>
                Simulated consult request recorded locally. No external message was sent.
              </p>
            ) : null}
          </Section>

          <div style={{ background: T.white, border: "1px solid " + T.border, borderRadius: 16, padding: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: T.text }}>AI Clinical Consult</div>
            <div style={{ fontSize: 12, color: T.sub, marginTop: 4, lineHeight: 1.45 }}>
              AI assistance is not enabled in this release flow. Keep simulation framing: educational only.
            </div>
          </div>

          <ClinicalPanelV2
            patientId={patient.id}
            patientName={patient.name}
            diagnosis={patient.diagnosis}
            bundle={patient.templateId === "stemi_anterior" ? STEMI_CLINICAL_BUNDLE : { metrics: [], medications: [], soapNotes: [], alerts: [] }}
            canDischarge={patient.status === "ready_for_discharge" || patient.status === "discharged"}
          />
          <div style={{ fontSize: 11, color: T.muted, textAlign: "center", paddingTop: 4 }}>
            Simulation only · Practice safely · No real patient data
          </div>
        </div>
      </div>
    </div>
  );
}

function Section(props: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <div style={{ fontSize: 11, fontWeight: 800, color: T.muted, letterSpacing: 0.7, marginBottom: 8, textTransform: "uppercase" }}>{props.title}</div>
      {props.children}
    </section>
  );
}

function Chip(props: { label: string; color: string; soft?: boolean }) {
  return (
    <span style={{ fontSize: 10, fontWeight: 800, color: props.color, background: props.soft ? props.color + "14" : "transparent", border: "1px solid " + props.color + "33", borderRadius: 99, padding: "4px 8px", textTransform: "uppercase" }}>
      {props.label}
    </span>
  );
}

function Empty(props: { text: string }) {
  return (
    <div style={{ background: T.white, border: "1px dashed " + T.border, borderRadius: 14, padding: 14, fontSize: 12, color: T.muted }}>
      {props.text}
    </div>
  );
}

function formatTime(iso: string) {
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleString();
  } catch {
    return iso;
  }
}
