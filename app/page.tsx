'use client';

import React, { useState } from 'react';
import OnboardingFunnel from './components/OnboardingFunnel';
import ErrorBoundary from './components/ErrorBoundary';

// Dynamic imports with fallbacks to prevent runtime crashes
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
      {/* Safe Render inside ErrorBoundary */}
      <ErrorBoundary>
        <ActivityRings />
      </ErrorBoundary>

      <ErrorBoundary>
        <TimeAwareCard />
      </ErrorBoundary>

      <ErrorBoundary>
        <TriageCard />
      </ErrorBoundary>

      <ErrorBoundary>
        <ClinicalPulseFeed />
      </ErrorBoundary>
    </main>
  );
}
