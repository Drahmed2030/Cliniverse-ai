"use client";

import { useMemo, useState } from "react";
import type {
  ClinicalBundle,
  MedicationItem,
  SoapNote,
  TrackingMetric,
} from "./clinicalTypes";

const T = {
  teal: "#0D9488",
  tealD: "#0F766E",
  bg: "#F8FAFC",
  white: "#FFFFFF",
  text: "#0F172A",
  sub: "#475569",
  muted: "#94A3B8",
  border: "#E2E8F0",
  red: "#EF4444",
  amber: "#F59E0B",
  green: "#10B981",
};

type Tab = "track" | "soap" | "meds" | "report" | "discharge";

interface Props {
  patientName: string;
  bundle: ClinicalBundle;
  onSaveSoap?: (note: SoapNote) => void;
  canDischarge?: boolean;
}

export default function ClinicalPanel({
  patientName,
  bundle,
  onSaveSoap,
  canDischarge,
}: Props) {
  const [tab, setTab] = useState<Tab>("track");
  const [s, setS] = useState("");
  const [o, setO] = useState("");
  const [a, setA] = useState("");
  const [p, setP] = useState("");

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
    if (!s.trim() && !o.trim() && !a.trim() && !p.trim()) return;
    const note: SoapNote = {
      id: "soap_" + String(Date.now()),
      at: new Date().toISOString(),
      author: "You",
      shift: "evening",
      subjective: s.trim() || "—",
      objective: o.trim() || "—",
      assessment: a.trim() || "—",
      plan: p.trim() || "—",
    };
    if (onSaveSoap) onSaveSoap(note);
    setS("");
    setO("");
    setA("");
    setP("");
    setTab("soap");
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Alerts */}
      {bundle.alerts && bundle.alerts.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {bundle.alerts.map(function (al) {
            const color =
              al.level === "critical"
                ? T.red
                : al.level === "watch"
                ? T.amber
                : T.teal;
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
                <div style={{ fontSize: 12, fontWeight: 800, color: color }}>
                  {al.label}
                </div>
                {al.detail ? (
                  <div style={{ fontSize: 12, color: T.sub, marginTop: 3 }}>
                    {al.detail}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : null}

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: 6,
          overflowX: "auto",
          paddingBottom: 2,
        }}
      >
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
                border: active
                  ? "1px solid " + T.tealD
                  : "1px solid " + T.border,
                background: active ? T.tealD : T.white,
                color: active ? "#fff" : T.sub,
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "track" ? <TrackingView metrics={bundle.metrics} /> : null}
      {tab === "soap" ? (
        <SoapView
          notes={bundle.soapNotes}
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
            "No formal report yet. Complete SOAP and key orders to generate a stronger summary."
          }
        />
      ) : null}
      {tab === "discharge" ? (
        <DischargeView
          canDischarge={canDischarge}
          discharge={bundle.discharge}
        />
      ) : null}
    </div>
  );
}

function TrackingView(props: { metrics: TrackingMetric[] }) {
  if (!props.metrics || props.metrics.length === 0) {
    return <Empty text="No tracking metrics for this case yet" />;
  }
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 8,
      }}
    >
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
            <div style={{ fontSize: 11, color: T.muted, fontWeight: 700 }}>
              {m.label}
            </div>
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
                <span style={{ fontSize: 11, color: T.muted, marginLeft: 4 }}>
                  {m.unit}
                </span>
              ) : null}
            </div>
            {m.trend ? (
              <div style={{ fontSize: 10, color: T.sub, marginTop: 4 }}>
                {m.trend === "up"
                  ? "Trend up"
                  : m.trend === "down"
                  ? "Trend down"
                  : "Stable"}
              </div>
            ) : null}
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
        <div
          style={{
            fontSize: 12,
            fontWeight: 800,
            color: T.text,
            marginBottom: 8,
          }}
        >
          New SOAP note
        </div>
        <SoapField
          label="S · Subjective"
          value={props.s}
          onChange={props.setS}
          placeholder="Patient-reported symptoms..."
        />
        <SoapField
          label="O · Objective"
          value={props.o}
          onChange={props.setO}
          placeholder="Vitals, exam, labs..."
        />
        <SoapField
          label="A · Assessment"
          value={props.a}
          onChange={props.setA}
          placeholder="Clinical impression..."
        />
        <SoapField
          label="P · Plan"
          value={props.p}
          onChange={props.setP}
          placeholder="Next actions..."
        />
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
                    {n.author} · {n.shift}
                  </div>
                  <div style={{ fontSize: 11, color: T.muted }}>
                    {formatTime(n.at)}
                  </div>
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
      <div
        style={{
          fontSize: 11,
          fontWeight: 800,
          color: T.muted,
          marginBottom: 4,
        }}
      >
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
          background: T.bg,
          outline: "none",
          boxSizing: "border-box",
        }}
      />
    </div>
  );
}

function SoapLine(props: { k: string; v: string }) {
  return (
    <div style={{ marginBottom: 6 }}>
      <span style={{ fontSize: 11, fontWeight: 800, color: T.tealD }}>
        {props.k}:{" "}
      </span>
      <span style={{ fontSize: 12, color: T.sub }}>{props.v}</span>
    </div>
  );
}

function MedsView(props: { meds: MedicationItem[] }) {
  if (!props.meds || props.meds.length === 0) {
    return <Empty text="No medications recorded" />;
  }
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
              padding: "12px 12px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 8,
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 800, color: T.text }}>
                {m.name}
              </div>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  color:
                    m.status === "active"
                      ? T.green
                      : m.status === "held"
                      ? T.amber
                      : T.muted,
                  textTransform: "uppercase",
                }}
              >
                {m.status}
              </span>
            </div>
            <div style={{ fontSize: 12, color: T.sub, marginTop: 4 }}>
              {m.dose} · {m.route} · {m.frequency}
            </div>
            {m.indication ? (
              <div style={{ fontSize: 11, color: T.muted, marginTop: 4 }}>
                {m.indication}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function DischargeView(props: {
  canDischarge?: boolean;
  discharge?: ClinicalBundle["discharge"];
}) {
  if (!props.discharge) {
    return (
      <Empty
        text={
          props.canDischarge
            ? "Ready for discharge documentation — summary not filled yet"
            : "Discharge summary unlocks when status is ready_for_discharge"
        }
      />
    );
  }
  const d = props.discharge;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <BlockCard title="Diagnosis" body={d.diagnosis} />
      <BlockCard title="Hospital course" body={d.hospitalCourse} />
      <BlockCard title="Procedures" body={d.procedures} />
      <BlockCard title="Follow-up" body={d.followUp} />
      <div
        style={{
          background: T.white,
          border: "1px solid " + T.border,
          borderRadius: 14,
          padding: 12,
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 800,
            color: T.text,
            marginBottom: 6,
          }}
        >
          Discharge meds
        </div>
        {d.dischargeMeds.map(function (med, idx) {
          return (
            <div key={idx} style={{ fontSize: 12, color: T.sub, marginBottom: 4 }}>
              • {med}
            </div>
          );
        })}
      </div>
      <div
        style={{
          background: "rgba(13,148,136,0.08)",
          border: "1px solid rgba(13,148,136,0.25)",
          borderRadius: 14,
          padding: 12,
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 800,
            color: T.tealD,
            marginBottom: 6,
          }}
        >
          Home instructions
        </div>
        {d.homeInstructions.map(function (h, idx) {
          return (
            <div key={idx} style={{ fontSize: 12, color: T.sub, marginBottom: 4 }}>
              • {h}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BlockCard(props: { title: string; body: string }) {
  return (
    <div
      style={{
        background: T.white,
        border: "1px solid " + T.border,
        borderRadius: 14,
        padding: 12,
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 800,
          color: T.text,
          marginBottom: 6,
        }}
      >
        {props.title}
      </div>
      <div style={{ fontSize: 12, color: T.sub, lineHeight: 1.45 }}>
        {props.body}
      </div>
    </div>
  );
}

function Empty(props: { text: string }) {
  return (
    <div
      style={{
        background: T.white,
        border: "1px dashed " + T.border,
        borderRadius: 14,
        padding: 14,
        fontSize: 12,
        color: T.muted,
      }}
    >
      {props.text}
    </div>
  );
}

function formatTime(iso: string) {
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleString();
  } catch (e) {
    return iso;
  }
}
