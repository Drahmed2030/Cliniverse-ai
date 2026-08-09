
'use client';
import { useState } from 'react';

const L = {
  canvas:'#F8FAFC', surface:'#FFFFFF', border:'#E2E8F0',
  teal:'#0D9488', cobalt:'#1E40AF', red:'#EF4444', amber:'#F5B731',
  textPrimary:'#0F172A', textSub:'#475569', textMuted:'#94A3B8',
};

interface Props {
  onBack: () => void;
}

export default function SymptomChecker({ onBack }: Props) {
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const check = async () => {
    if (!symptoms.trim() || loading) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/symptom-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptoms }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ error: 'Something went wrong — please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: L.canvas,
      fontFamily: '-apple-system, "SF Pro Display", sans-serif',
      padding: '16px 16px 100px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <button onClick={onBack} style={{
          background: L.surface, border: `1px solid ${L.border}`,
          borderRadius: 12, width: 36, height: 36, fontSize: 16,
          cursor: 'pointer', color: L.textSub,
        }}>←</button>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: L.textPrimary }}>🔍 Symptom Checker</div>
          <div style={{ fontSize: 12, color: L.textMuted }}>AI-powered health guidance</div>
        </div>
      </div>

      <div style={{
        background: L.surface, borderRadius: 20, padding: 18,
        border: `1px solid ${L.border}`, marginBottom: 12,
      }}>
        <textarea
          value={symptoms}
          onChange={e => setSymptoms(e.target.value)}
          placeholder="Describe what you're experiencing — e.g. 'headache and mild fever since yesterday'"
          style={{
            width: '100%', minHeight: 90, border: 'none', outline: 'none',
            resize: 'none', fontSize: 15, color: L.textPrimary,
            fontFamily: 'inherit', lineHeight: 1.6, boxSizing: 'border-box',
          }}
        />

        {/* Transparency notice — agreed as required, shown clearly */}
        <div style={{ fontSize: 11, color: L.textMuted, marginTop: 8, lineHeight: 1.5 }}>
          ℹ️ Your description may be used, fully anonymously (no name or personal
          info), to help improve health guidance for everyone.
        </div>

        <button
          onClick={check}
          disabled={!symptoms.trim() || loading}
          style={{
            width: '100%', padding: 14, marginTop: 14, borderRadius: 14,
            border: 'none', fontSize: 15, fontWeight: 700,
            background: !symptoms.trim() || loading ? '#E2E8F0' : 'linear-gradient(135deg,#0D9488,#1E40AF)',
            color: !symptoms.trim() || loading ? '#94A3B8' : '#FFFFFF',
            cursor: !symptoms.trim() || loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? '⏳ Analyzing…' : '🔍 Check Symptoms'}
        </button>
      </div>

      {result?.error && (
        <div style={{ background: '#FEE2E2', borderRadius: 14, padding: 16, color: '#991B1B', fontSize: 13 }}>
          ❌ {result.error}
        </div>
      )}

      {result?.guidance && (
        <>
          {result.emergencyFlag && (
            <div style={{
              background: '#FEE2E2', border: '1.5px solid #FCA5A5',
              borderRadius: 16, padding: '14px 16px', marginBottom: 12,
              display: 'flex', gap: 10, alignItems: 'flex-start',
            }}>
              <span style={{ fontSize: 22 }}>🚨</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#991B1B', marginBottom: 4 }}>
                  This may need urgent attention
                </div>
                <div style={{ fontSize: 12, color: '#991B1B', lineHeight: 1.6 }}>
                  If you're experiencing a medical emergency, call your local emergency
                  number or go to the nearest emergency department immediately.
                </div>
              </div>
            </div>
          )}

          <div style={{
            background: L.surface, borderRadius: 20, padding: 18,
            border: `1px solid ${L.border}`, marginBottom: 12,
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: L.teal, marginBottom: 10 }}>
              💬 Health Guidance
            </div>
            <div style={{ fontSize: 14, color: L.textPrimary, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
              {result.guidance}
            </div>
          </div>

          <div style={{
            background: '#FEF3C7', borderRadius: 14, padding: '12px 14px',
            fontSize: 11, color: '#92400E', lineHeight: 1.6,
          }}>
            ⚠️ <strong>This is not a medical diagnosis.</strong> Always consult a
            doctor for symptoms that are severe, persistent, or concerning —
            especially if they worsen or don't improve.
          </div>
        </>
      )}
    </div>
  );
}
