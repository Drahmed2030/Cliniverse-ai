'use client';

import React, { useState } from 'react';
import OnboardingFunnel from './components/OnboardingFunnel';
import ActivityRings from './components/ActivityRings';
import TimeAwareCard from './components/TimeAwareCard';
import TriageCard from './components/TriageCard';
import ClinicalPulseFeed from './components/ClinicalPulseFeed';

export default function Home() {
  const [showOnboarding, setShowOnboarding] = useState(true);

  if (showOnboarding) {
    return (
      <OnboardingFunnel onComplete={() => setShowOnboarding(false)} />
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-4 space-y-6 pb-24">
      {/* 1. Apple-Style Activity Rings */}
      <ActivityRings />

      {/* 2. Dynamic Time-Aware & Live Triage */}
      <TimeAwareCard />
      <TriageCard />

      {/* 3. Live Pulse Ticker */}
      <ClinicalPulseFeed />
    </main>
  );
}
