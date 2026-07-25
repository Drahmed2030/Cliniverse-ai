'use client';

import React, { useState, useEffect } from 'react';
import OnboardingFunnel from './components/OnboardingFunnel';
import ErrorBoundary from './components/ErrorBoundary';

import ActivityRings from './components/ActivityRings';
import TimeAwareCard from './components/TimeAwareCard';
import TriageCard from './components/TriageCard';
import ClinicalPulseFeed from './components/ClinicalPulseFeed';

export default function Home() {
  const [showOnboarding, setShowOnboarding] = useState(true);

  // Auto-recovery: force clear bad old state on mount if needed
  useEffect(() => {
    const hasCompleted = localStorage.getItem('onboarding_completed');
    if (hasCompleted === 'true') {
      setShowOnboarding(false);
    }
  }, []);

  const handleComplete = () => {
    try {
      localStorage.setItem('onboarding_completed', 'true');
    } catch (e) {
      console.error(e);
    }
    setShowOnboarding(false);
  };

  if (showOnboarding) {
    return (
      <OnboardingFunnel onComplete={handleComplete} />
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-4 space-y-6 pb-24">
      <button 
        onClick={() => {
          localStorage.removeItem('onboarding_completed');
          setShowOnboarding(true);
        }}
        className="text-xs text-slate-500 hover:text-slate-300 underline mb-2"
      >
        🔄 Reset Onboarding
      </button>

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
