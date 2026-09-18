import type { Metadata } from 'next'
import ClinicalReferenceWorkspace from './ClinicalReferenceWorkspace'

export const metadata: Metadata = {
  title: 'Clinical Reference · Cliniverse AI',
  description: 'A governed, evidence-first clinical reference workspace — calculators, drug identity, interactions and renal dosing, every result sourced.',
}

export default function ClinicalReferencePage() {
  return <ClinicalReferenceWorkspace />
}
