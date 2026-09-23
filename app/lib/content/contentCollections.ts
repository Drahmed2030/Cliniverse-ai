import type { ContentNode } from './contentGraph.ts'
import { CONTENT_NODES, contentNodeLearnerReady } from './contentGraph.ts'

export interface ContentCollection {
  id: string
  title: string
  description: string
  nodeIds: string[]
  audience: 'individual' | 'team' | 'institution'
}

export const CONTENT_COLLECTIONS: ContentCollection[] = [
  {
    id: 'acute-care-foundations',
    title: 'Acute Care Foundations',
    description: 'Signal interpretation, resuscitation, bedside decisions and communication in one connected path.',
    nodeIds: ['ecg-record-10','resuscitation-hub','code-lab-bls','ward-current-set','handover-practice'],
    audience: 'individual',
  },
  {
    id: 'cardiology-practice',
    title: 'Cardiology Practice',
    description: 'ECG, Echo, ward decisions and replay connected as one practice sequence.',
    nodeIds: ['ecg-record-10','echo-a4c-normal','ward-current-set','pathway-replay'],
    audience: 'individual',
  },
  {
    id: 'resident-onboarding',
    title: 'Resident Onboarding',
    description: 'A reusable institutional collection spanning acute care, decisions and handover.',
    nodeIds: ['code-lab-bls','code-lab-acls','ward-current-set','handover-practice'],
    audience: 'institution',
  },
]

export function collectionNodes(collection: ContentCollection): ContentNode[] {
  return collection.nodeIds
    .map(id => CONTENT_NODES.find(node => node.id === id))
    .filter((node): node is ContentNode => Boolean(node) && contentNodeLearnerReady(node))
}
