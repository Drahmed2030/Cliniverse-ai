"use client";
import { useEffect, useRef, useState } from "react";
import RelatedEvidencePanel from "./RelatedEvidencePanel";
import ClinicalPanelV2 from "./ClinicalPanelV2";
import { STEMI_CLINICAL_BUNDLE } from "./stemiClinicalSeed";
import { getTemplate } from "../../lib/ward/templates";
import {
  PRIORITY_LABEL,
  caseStatusLabel,
  learnerDecisionStages,
  orderedTimeline,
} from "../../lib/ward/journeyPresentation";
import {
  NATIVE_SAFE_AREA_BOTTOM,
  NATIVE_SAFE_AREA_TOP,
} from "../../lib/nativeSafeArea";

import type { WardPatient, WorkupItem, OrderItem } from "../../lib/ward/types";

// Ward v2 patient journey. Presentation around the existing Ward engine: the patient record, the template decision points,
// the local consult request, the evidence panel and the notes panel are all the existing ones, unchanged in behaviour.
// Order: who the patient is and where the case stands, the record, one decision step at a time with the reason behind it,
// orders and consult, evidence, then notes and discharge. Styling lives in ward-v2.css (scoped, semantic tokens).

const WORKUP_STATUS: Record<WorkupItem["status"], string> = { pending: "Pending", ready: "Ready", reviewed: "Reviewed" };
const ORDER_STATUS: Record<OrderItem["status"], string> = { pending: "Pending", done: "Done", cancelled: "Cancelled" };

interface Props {
  patient: WardPatient;
  onClose: () => void;
  onRequestConsult?: (patientId: string) => void;
  consultRequested?: boolean;
  isPro?: boolean;
  onUpgrade?: () => void;
}

export default function PatientJourney({
  patient,
  onClose,
  onRequestConsult,
  consultRequested = false,
  isPro = false,
  onUpgrade,
}: Props) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [stageIndex, setStageIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  // Move focus to the case heading when the journey opens, so keyboard and screen-reader users start at the patient.
  useEffect(() => { headingRef.current?.focus({ preventScroll: true }); }, []);

  const stages = learnerDecisionStages(getTemplate(patient.templateId));
  const stage = stages[Math.min(stageIndex, stages.length - 1)];
  const chosen = stage ? stage.options.find(option => option.id === selectedOptions[stage.id]) : undefined;
  const timeline = orderedTimeline(patient.timeline);

  return (
    <article
      data-patient-journey
      data-ward-v2
      className="wj"
      aria-labelledby="wj-name"
    >
      <div
        className="wj-frame"
        style={{ paddingBottom: `calc(100px + ${NATIVE_SAFE_AREA_BOTTOM})` }}
      >
        <header data-patient-journey-top className="wj-head" style={{ paddingTop: `calc(16px + ${NATIVE_SAFE_AREA_TOP})` }}>
          <div className="wj-head-row">
            <div style={{ minWidth: 0 }}>
              <p className="wj-kicker">PATIENT JOURNEY</p>
              <h1 id="wj-name" ref={headingRef} tabIndex={-1} className="wj-name">{patient.name}</h1>
              <p className="wj-demo">
                {patient.age}
                {patient.sex} · {patient.department.toUpperCase()}
                {patient.bed ? " · Bed " + patient.bed : ""}
              </p>
            </div>
            <button type="button" className="wj-close" onClick={onClose}>Close</button>
          </div>
          <div>
            <p className="wj-state">{patient.diagnosis}</p>
            <p className="wj-state-meta">{caseStatusLabel(patient.status)} · {PRIORITY_LABEL[patient.priority]} priority</p>
          </div>
        </header>

        <div className="wj-main">
          <section className="wj-sec" aria-labelledby="wj-record">
            <h2 id="wj-record" className="wj-h">Case record</h2>
            {patient.workup && patient.workup.length > 0 ? (
              <div className="wj-sec">
                <p className="wj-sub">WORKUP</p>
                <ul className="wj-rows">
                  {patient.workup.map((w: WorkupItem) => (
                    <li key={w.id}>
                      <div className="wj-row-top">
                        <span className="wj-row-title">{w.title}</span>
                        <span className="wj-row-status">
                          {w.critical ? <span className="wj-flag">Critical · </span> : null}
                          {WORKUP_STATUS[w.status] ?? w.status}
                        </span>
                      </div>
                      {w.summary ? <p className="wj-row-detail">{w.summary}</p> : null}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {timeline.length > 0 ? (
              <div className="wj-sec">
                <p className="wj-sub">COURSE SO FAR</p>
                <ol className="wj-rows">
                  {timeline.map(ev => (
                    <li key={ev.id}>
                      <span className="wj-row-title">{ev.title}</span>
                      {ev.detail ? <p className="wj-row-detail">{ev.detail}</p> : null}
                      <p className="wj-row-status">{formatTime(ev.at)}</p>
                    </li>
                  ))}
                </ol>
              </div>
            ) : null}
            {(!patient.workup || patient.workup.length === 0) && timeline.length === 0 ? (
              <p className="wj-note">No workup or course has been recorded for this simulated case.</p>
            ) : null}
          </section>

          <section className="wj-sec" aria-labelledby="wj-decision">
            <h2 id="wj-decision" className="wj-h">Decision</h2>
            {stage ? (
              <div className="wj-decision wj-sec">
                <p className="wj-step">STEP {Math.min(stageIndex, stages.length - 1) + 1} OF {stages.length}</p>
                <fieldset className="wj-options">
                  <legend>{stage.prompt}</legend>
                  {stage.options.map(opt => (
                    <label key={opt.id} className="wj-option">
                      <input
                        type="radio"
                        name={"wj-" + stage.id}
                        value={opt.id}
                        checked={selectedOptions[stage.id] === opt.id}
                        onChange={() => setSelectedOptions(prev => ({ ...prev, [stage.id]: opt.id }))}
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </fieldset>
                <div role="status" aria-live="polite">
                  {chosen ? (
                    <div className="wj-response">
                      <p className="wj-response-label">RESPONSE AND REASONING</p>
                      <p className="wj-choice">Your choice: {chosen.label}</p>
                      <p>{chosen.effect}</p>
                    </div>
                  ) : (
                    <p className="wj-note">Choose an option to see the response and the reasoning behind it.</p>
                  )}
                </div>
                <div className="wj-stepnav">
                  {stageIndex > 0 ? (
                    <button type="button" className="wj-btn" onClick={() => setStageIndex(index => Math.max(0, index - 1))}>Previous step</button>
                  ) : null}
                  {stageIndex < stages.length - 1 ? (
                    <button type="button" className="wj-btn" data-primary disabled={!chosen} onClick={() => setStageIndex(index => index + 1)}>Next step</button>
                  ) : (
                    <p className="wj-note">{chosen ? "That is the last step for this case." : "This is the last step for this case."}</p>
                  )}
                </div>
                <p className="wj-note">Each step moves the case forward. The record shows the case at the start; later steps describe how it has changed.</p>
              </div>
            ) : (
              <p className="wj-note">No decision practice is available for this case yet.</p>
            )}
          </section>

          <section className="wj-sec wj-wide" aria-labelledby="wj-orders">
            <h2 id="wj-orders" className="wj-h">Orders and consult</h2>
            {patient.orders && patient.orders.length > 0 ? (
              <ul className="wj-rows">
                {patient.orders.map((o: OrderItem) => (
                  <li key={o.id}>
                    <div className="wj-row-top">
                      <span className="wj-row-title">{o.label}</span>
                      <span className="wj-row-status">{ORDER_STATUS[o.status] ?? o.status}</span>
                    </div>
                    {o.impact ? <p className="wj-row-detail">{o.impact}</p> : null}
                  </li>
                ))}
              </ul>
            ) : <p className="wj-note">No orders yet.</p>}

            {patient.consults && patient.consults.length > 0 ? (
              <ul className="wj-rows">
                {patient.consults.map(c => (
                  <li key={c.id}>
                    <div className="wj-row-top">
                      <span className="wj-row-title">{c.fromDept.toUpperCase()} → {c.toDept.toUpperCase()}</span>
                      <span className="wj-row-status">{c.status === "answered" ? "Answered" : "Requested"}</span>
                    </div>
                    <p className="wj-row-detail">{c.reason}</p>
                    {c.answer ? <p className="wj-row-detail">{c.answer}</p> : null}
                  </li>
                ))}
              </ul>
            ) : null}

            <button
              type="button"
              className="wj-btn wj-consult-btn"
              onClick={function () { if (onRequestConsult) onRequestConsult(patient.id); }}
              disabled={consultRequested}
            >
              {consultRequested ? "Consult Requested" : "Request Consult"}
            </button>
            {consultRequested ? (
              <p role="status" aria-live="polite" className="wj-note">
                Simulated consult request recorded locally. No external message was sent.
              </p>
            ) : null}
          </section>

          <section className="wj-sec wj-wide" aria-label="Related evidence">
            <RelatedEvidencePanel templateId={patient.templateId} diagnosis={patient.diagnosis} isPro={isPro} onUpgrade={onUpgrade} />
          </section>

          <details className="wj-fold wj-wide">
            <summary>Notes, medications and discharge</summary>
            <div className="wj-fold-body">
              <ClinicalPanelV2
                patientId={patient.id}
                patientName={patient.name}
                diagnosis={patient.diagnosis}
                bundle={patient.templateId === "stemi_anterior" ? STEMI_CLINICAL_BUNDLE : { metrics: [], medications: [], soapNotes: [], alerts: [] }}
                canDischarge={patient.status === "ready_for_discharge" || patient.status === "discharged"}
              />
            </div>
          </details>

          <p className="wj-foot wj-wide">
            AI assistance is not enabled in this release flow. Simulation only · Practice safely · No real patient data
          </p>
        </div>
      </div>
    </article>
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
