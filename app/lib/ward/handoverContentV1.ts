import type { WardPatient } from './types'
// Frozen fictional source for persisted handover v1. Do not edit; add a new version.
export const HANDOVER_CONTENT_VERSION = 'w1-handover-1.0.0'
export const HANDOVER_SOURCE_V1: WardPatient = {
  "id": "w1",
  "templateId": "stemi_anterior",
  "name": "Hassan Al-Amri",
  "age": 62,
  "sex": "M",
  "bed": "CCU-1",
  "department": "cards",
  "diagnosis": "Anterior STEMI — Post PCI Day 2",
  "priority": "urgent",
  "status": "in_treatment",
  "assignedToMe": true,
  "assignedTo": "local-user",
  "admittedAt": "2026-08-11T08:00:00Z",
  "expectedStayHours": 72,
  "timeline": [
    {
      "id": "t1",
      "at": "2026-08-11T06:10:00Z",
      "title": "ED arrival",
      "detail": "Crushing chest pain 2h",
      "type": "arrival"
    },
    {
      "id": "t2",
      "at": "2026-08-11T06:25:00Z",
      "title": "ECG STEMI",
      "detail": "Anterior ST elevation",
      "type": "result"
    },
    {
      "id": "t3",
      "at": "2026-08-11T08:00:00Z",
      "title": "Admitted CCU post PCI",
      "type": "decision"
    }
  ],
  "workup": [
    {
      "id": "wu1",
      "kind": "ecg",
      "title": "12-lead ECG",
      "status": "reviewed",
      "summary": "Evolving anterior changes",
      "critical": true
    },
    {
      "id": "wu2",
      "kind": "troponin",
      "title": "Troponin",
      "status": "ready",
      "summary": "Elevated",
      "critical": true
    }
  ],
  "orders": [
    {
      "id": "o1",
      "label": "DAPT",
      "status": "done"
    },
    {
      "id": "o2",
      "label": "Post-PCI monitoring",
      "status": "pending"
    }
  ],
  "consults": []
}
