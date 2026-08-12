"use client";

/**
 * ClinicalPanel V2 — SOAP persistence + Discharge writer
 * Inline styles · no CSS template literal traps for shell tooling
 */

import { useEffect, useMemo, useState } from "react";
import type {
  ClinicalBundle,
  DischargeSummary,
  MedicationItem,
  SoapNote,
  TrackingMetric,
} from "../clinicalTypes";
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

var T = {
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
  var [tab, setTab] = useState<Tab>("track");
  var [notes, setNotes] = useState<SoapNote[]>([]);
  var [s, setS] = useState("");
  var [o, setO] = useState("");
  var [a, setA] = useState("");
  var [p, setP] = useState("");
  var [discharge, setDischarge] = useState<DischargeSummary | null>(null);
  var [saveMsg, setSaveMsg] = useState("");

  // Load persisted SOAP + discharge when patient opens
  useEffect(
    function () {
      var saved = localSoapStore.list(patientId);
      var merged = mergeSoapNotes(bundle.soapNotes || [], saved);
      setNotes(merged);
      var d = loadDischarge(patientId);
      setDischarge(d || bundle.discharge || null);
      setS("");
      setO("");
      setA("");
      setP("");
      setSaveMsg("");
    },
    [patientId]
  );

  var tabs = useMemo(
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
    var note = createSoapNote({
      subjective: s,
      objective: o,
      assessment: a,
      plan: p,
      authorName: "You",
    });
    var next = localSoapStore.append(patientId, note);
    var merged = mergeSoapNotes(bundle.soapNotes || [], next);
    setNotes(merged);
    setS("");
    setO("");
    setA("");
    setP("");
    setSaveMsg("SOAP saved");
    if (onSoapSaved) onSoapSaved(merged);
  }

  function generateDischargeDraft() {
    var draft = buildDischargeDraft({
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

  function updateDischargeField(field: keyof DischargeSummary, value: any) {
    var base =
      discharge ||
      buildDischargeDraft({
        patientName: patientName,
        diagnosis: diagnosis,
        activeMeds: bundle.medications,
        recentSoap: notes,
      });
    var next = Object.assign({}, base) as DischargeSummary;
    (next as any)[field] = value;
    setDischarge(next);
  }

  function persistDischarge() {
    if (!discharge) return;
    saveDischargeDraft(patientId, discharge);
    setSaveMsg("Discharge summary saved");
    if (onDischargeSaved) onDischargeSaved(discharge);
  }

  var readiness = dischargeReadiness(discharge);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {bundle.alerts && bundle.alerts.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {bundle.alerts.map(function (al) {
            var color =
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
          var active = tab === t.id;
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
        <div style={{ fontSize: 12, color: T.tealD, fontWeight: 700 }}>{saveMsg}</div>
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
              onClick={persistDischarge}
              style={{
                border: "1px solid " + T.border,
                background: T.white,
                color: T.text,
                borderRadius: 12,
                padding: "10px 12px",
                fontSize: 12,
                fontWeight: 800,
              }}
            >
              Save Summary
            </button>
          </div>

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
      <span style={{ fontSize: 11, fontWeight: 800, color: T.tealD }}>{props.k}: </span>
      <span style={{ fontSize: 12, color: T.sub }}>{props.v}</span>
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
              padding: "12px 12px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: T.text }}>{m.name}</div>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  color: m.status === "active" ? T.green : T.muted,
                  textTransform: "uppercase",
                }}
              >
                {m.status}
              </span>
            </div>
            <div style={{ fontSize: 12, color: T.sub, marginTop: 4 }}>
              {m.dose + " · " + m.route + " · " + m.frequency}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DischargeEditor(props: {
  value: DischargeSummary;
  onChange: (field: keyof DischargeSummary, value: any) => void;
}) {
  var d = props.value;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <EditArea label="Diagnosis" value={d.diagnosis} onChange={function (v) { props.onChange("diagnosis", v); }} />
      <EditArea label="Hospital course" value={d.hospitalCourse} onChange={function (v) { props.onChange("hospitalCourse", v); }} />
      <EditArea label="Procedures" value={d.procedures} onChange={function (v) { props.onChange("procedures", v); }} />
      <EditArea label="Follow-up" value={d.followUp} onChange={function (v) { props.onChange("followUp", v); }} />
      <EditArea
        label="Discharge meds (one per line)"
        value={(d.dischargeMeds || []).join("\n")}
        onChange={function (v) {
          props.onChange(
            "dischargeMeds",
            v.split("\n").map(function (x) { return x.trim(); }).filter(Boolean)
          );
        }}
      />
      <EditArea
        label="Home instructions (one per line)"
        value={(d.homeInstructions || []).join("\n")}
        onChange={function (v) {
          props.onChange(
            "homeInstructions",
            v.split("\n").map(function (x) { return x.trim(); }).filter(Boolean)
          );
        }}
      />
    </div>
  );
}

function EditArea(props: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div
      style={{
        background: T.white,
        border: "1px solid " + T.border,
        borderRadius: 14,
        padding: 12,
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 800, color: T.text, marginBottom: 6 }}>
        {props.label}
      </div>
      <textarea
        value={props.value}
        onChange={function (e) {
          props.onChange(e.target.value);
        }}
        rows={3}
        style={{
          width: "100%",
          border: "1px solid " + T.border,
          borderRadius: 10,
          padding: "8px 10px",
          fontSize: 13,
          color: T.text,
          background: T.bg,
          boxSizing: "border-box",
          outline: "none",
        }}
      />
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
      <div style={{ fontSize: 12, fontWeight: 800, color: T.text, marginBottom: 6 }}>
        {props.title}
      </div>
      <div style={{ fontSize: 12, color: T.sub, lineHeight: 1.45 }}>{props.body}</div>
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
    var d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleString();
  } catch (e) {
    return iso;
  }
}
