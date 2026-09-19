import type { Metadata } from 'next'
import ClinicalReferenceWorkspace from './ClinicalReferenceWorkspace'

export const metadata: Metadata = {
  title: 'Clinical Reference · Cliniverse AI',
  description: 'Source-linked drug identity and label lookups. Calculators, dosing and interaction tools appear once they clear clinical review.',
}

export default function ClinicalReferencePage() {
  return <ClinicalReferenceWorkspace />
}
