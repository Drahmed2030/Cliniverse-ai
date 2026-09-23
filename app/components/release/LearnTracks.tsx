'use client'

import Link from 'next/link'
import type { CSSProperties, ReactNode } from 'react'
import { CONTENT_COLLECTIONS, collectionNodes } from '../../lib/content/contentCollections'
import { makeCliniverseEvent } from '../../lib/platform/events'
import { appendCliniverseEvent } from '../../lib/platform/eventStore'

type Workspace = 'ward' | 'handover' | 'codelab' | 'cardiology' | 'nexus'
type Entry = { id:string; verb:string; title:string; description:string; accent:string; href?:string; workspace?:Workspace }

const CORE: Entry[] = [
  { id:'ecg', verb:'INTERPRET', title:'ECG', description:'Read the tracing, commit an interpretation, then review the reasoning.', accent:'var(--cv-teal)', href:'/learn/ecg' },
  { id:'echo', verb:'OBSERVE', title:'Echo', description:'Start with the cine, organize findings, then assign meaning.', accent:'var(--cv-violet)', href:'/learn/echo' },
  { id:'ward', verb:'DECIDE', title:'Ward', description:'Follow a changing patient state and work through the next clinical decision.', accent:'var(--cv-blue)', workspace:'ward' },
]
const ADVANCED: Entry[] = [
  { id:'resuscitation', verb:'SIMULATE', title:'Resuscitation', description:'Move between foundations, practice, simulation, replay and progress.', accent:'var(--cv-blue)', href:'/labs/resuscitation-hub' },
  { id:'handover', verb:'COMMUNICATE', title:'Handover Practice', description:'Separate known facts from gaps, draft a structured handover, and resume saved practice.', accent:'var(--cv-blue)', workspace:'handover' },
  { id:'codelab', verb:'BUILD', title:'Code Lab', description:'Work through BLS and ACLS lessons with knowledge checks.', accent:'var(--cv-teal)', workspace:'codelab' },
  { id:'pathway', verb:'REPLAY', title:'Pathway Replay', description:'Inspect a fictional pathway and the decisions that shaped it.', accent:'var(--cv-violet)', href:'/labs/pathway-replay' },
]
const SYSTEMS: Entry[] = [
  { id:'reference', verb:'REFERENCE', title:'Clinical Reference', description:'Use source-linked drug identity and label lookups.', accent:'var(--cv-blue)', href:'/labs/clinical-reference' },
  { id:'cardiology', verb:'OPERATE', title:'Cardiology Operations', description:'Practise workflow, coordination, pathway and handover operations.', accent:'var(--cv-teal)', workspace:'cardiology' },
  { id:'nexus', verb:'COLLABORATE', title:'Nexus Learning', description:'Practise a four-role cardiovascular huddle.', accent:'var(--cv-violet)', workspace:'nexus' },
]

const LEARN_COLLECTION_IDS = ['cardiology-practice','acute-care-foundations'] as const

const COLLECTION_DESTINATIONS: Record<string, { verb:string; href?:string; workspace?:Workspace }> = {
  'ecg-record-10': { verb:'INTERPRET', href:'/learn/ecg' },
  'echo-a4c-normal': { verb:'OBSERVE', href:'/learn/echo' },
  'ward-current-set': { verb:'DECIDE', workspace:'ward' },
  'pathway-replay': { verb:'REPLAY', href:'/labs/pathway-replay' },
  'resuscitation-hub': { verb:'SIMULATE', href:'/labs/resuscitation-hub' },
  'code-lab-bls': { verb:'PRACTISE', workspace:'codelab' },
  'handover-practice': { verb:'COMMUNICATE', workspace:'handover' },
}

export default function LearnTracks({ onOpenWorkspace, actorId }: { onOpenWorkspace:(workspace:Workspace)=>void; actorId:string }) {
  return <div data-commercial-surface="learn" data-commercial-learn-surface>
    <section className="cv-learn-collections" aria-labelledby="connected-practice-title">
      <div className="cv-learn-group-head">
        <h2 id="connected-practice-title">Connected practice</h2>
        <p>Move across signals, simulation, decisions and communication without leaving one learning path.</p>
      </div>
      {LEARN_COLLECTION_IDS.map(collectionId => <ConnectedPractice key={collectionId} collectionId={collectionId} actorId={actorId} onOpenWorkspace={onOpenWorkspace}/>)}
    </section>
    <TrackGroup title="Core practice" description="Interpret signals, observe media and make decisions." entries={CORE} onOpenWorkspace={onOpenWorkspace}/>
    <TrackGroup title="Advanced practice" description="Build depth through simulation, curriculum and replay." entries={ADVANCED} onOpenWorkspace={onOpenWorkspace}/>
    <TrackGroup title="Clinical systems" description="Reference and operational practice when you need the wider context." entries={SYSTEMS} onOpenWorkspace={onOpenWorkspace}/>
  </div>
}
function TrackGroup({title,description,entries,onOpenWorkspace}:{title:string;description:string;entries:Entry[];onOpenWorkspace:(workspace:Workspace)=>void}) {
  const id='learn-'+title.toLowerCase().replace(/\s+/g,'-')
  return <section className="cv-learn-group" aria-labelledby={id}>
    <div className="cv-learn-group-head"><h2 id={id}>{title}</h2><p>{description}</p></div>
    <ul className="cv-learn-list">{entries.map(entry=><li key={entry.id}><TrackEntry entry={entry} onOpenWorkspace={onOpenWorkspace}/></li>)}</ul>
  </section>
}
function TrackEntry({entry,onOpenWorkspace}:{entry:Entry;onOpenWorkspace:(workspace:Workspace)=>void}) {
  const body:ReactNode=<><span><span className="cv-learn-track-verb">{entry.verb}</span><span className="cv-learn-track-title">{entry.title}</span><span className="cv-learn-track-text">{entry.description}</span></span><span className="cv-learn-track-go" aria-hidden="true">→</span></>
  const style={'--track-accent':entry.accent} as CSSProperties
  if(entry.href) return <Link className="cv-learn-track" href={entry.href} style={style}>{body}</Link>
  return <button type="button" className="cv-learn-track" onClick={()=>entry.workspace&&onOpenWorkspace(entry.workspace)} style={style}>{body}</button>
}


function ConnectedPractice({collectionId,actorId,onOpenWorkspace}:{collectionId:string;actorId:string;onOpenWorkspace:(workspace:Workspace)=>void}) {
  const collection=CONTENT_COLLECTIONS.find(item=>item.id===collectionId)
  if(!collection) return null
  const nodes=collectionNodes(collection)
  const totalMinutes=nodes.reduce((sum,node)=>sum+(node.durationMinutes??0),0)
  return <article className="cv-learn-collection" aria-labelledby={collectionId+'-title'}>
    <div className="cv-learn-collection-head">
      <div>
        <span className="cv-learn-collection-eyebrow">CONNECTED PRACTICE</span>
        <h3 id={collectionId+'-title'}>{collection.title}</h3>
        <p>{collection.description}</p>
      </div>
      <span className="cv-learn-collection-meta">{nodes.length} steps · {totalMinutes} min</span>
    </div>
    <ol className="cv-learn-collection-steps">
      {nodes.map((node,index)=>{
        const destination=COLLECTION_DESTINATIONS[node.id]
        if(!destination) return null
        const recordOpen=()=> {
          if (typeof window === 'undefined') return
          appendCliniverseEvent(window.localStorage, actorId, makeCliniverseEvent({
            name:'collection.started',
            actorId,
            collectionId,
            contentId:node.id,
            payload:{ source:'learn-connected-practice' },
          }))
        }
        const body=<>
          <span className="cv-learn-collection-index">{String(index+1).padStart(2,'0')}</span>
          <span className="cv-learn-collection-copy">
            <span className="cv-learn-collection-verb">{destination.verb}</span>
            <strong>{node.title}</strong>
            <small>{node.durationMinutes ? `${node.durationMinutes} min` : 'Open practice'}</small>
          </span>
          <span className="cv-learn-track-go" aria-hidden="true">→</span>
        </>
        return <li key={node.id}>
          {destination.href
            ? <Link className="cv-learn-collection-row" href={destination.href} onClick={recordOpen}>{body}</Link>
            : <button type="button" className="cv-learn-collection-row" onClick={()=>{ recordOpen(); if(destination.workspace) onOpenWorkspace(destination.workspace) }}>{body}</button>}
        </li>
      })}
    </ol>
  </article>
}
