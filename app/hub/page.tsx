'use client';

import ActivityRings from '../components/ActivityRings';
import TriageCard from '../components/TriageCard';
import ClinicalPulseFeed from '../components/ClinicalPulseFeed';
import TimeAwareCard from '../components/TimeAwareCard';

export default function HubPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white p-4 space-y-6 pb-24">
      <ActivityRings />
      <TimeAwareCard />
      <TriageCard />
      <ClinicalPulseFeed />
    </main>
  );
}
