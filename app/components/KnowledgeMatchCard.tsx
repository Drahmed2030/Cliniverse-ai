
'use client';
import { useState, useEffect } from 'react';

const L = {
  canvas:'#F8FAFC', surface:'#FFFFFF', border:'#E2E8F0',
  teal:'#0D9488', cobalt:'#1E40AF', sage:'#10B981', amber:'#F5B731', red:'#EF4444',
  textPrimary:'#0F172A', textSub:'#475569', textMuted:'#94A3B8',
};

interface Match {
  id: number;
  diagnosis: string;
  specialty: string;
  similarity: number;
  summary: string;
  keyFindings: Record<string, any>;
}

interface KnowledgeMatchCardProps {
  /** The clinical text to search against past cases (e.g. a case summary or uploaded note) */
  queryText: string;
  /** Optional: findings for the CURRENT case, used to compute variance callouts */
  currentFindings?: Record<string, any>;
}

function similarityColor(pct: number) {
  if (pct >= 80) return L.sage;
  if (pct >= 60) return L.teal;
  if (pct >= 40) return L.amber;
  return L.textMuted;
}

/** Compare two findings objects and describe what differs, in plain language. */
function describeVariance(current: Record<string, any> | undefined, matched: Record<string, any>): string[] {
  if (!current) return [];
  const diffs: string[] = [];
  const keys = new Set([...Object.keys(current), ...Object.keys(matched)]);
  keys.forEach(key => {
    const a = current[key];
    const b = matched[key];
    if (a === undefined || b === undefined) return;
    if (String(a) !== String(b)) {
      const label = key.replace(/_/g, ' ');
      diffs.push(`Differs in ${label}: ${b} → ${a}`);
    }
  });
  return diffs.slice(0, 3);
}

export default function KnowledgeMatchCard({ queryText, currentFindings }: KnowledgeMatchCardProps) {
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<Match[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    if (!queryText?.trim()) return;
    let cancelled = false;

    const fetchMatches = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/knowledge-graph/match', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ queryText, matchThreshold: 0.4, matchCount: 3 }),
        });
        const data = await res.json();
        if (cancelled) return;
        if (data.error) {
          setError(data.error);
        } else {
          setMatches(data.matches || []);
        }
      } catch (e: any) {
        if (!cancelled) setError('Network error — could not check for similar cases');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchMatches();
    return () => { cancelled = true; };
  }, [queryText]);

  if (!queryText?.trim()) return null;

  return (
    <div style={{
      background: L.surface, border: `1px solid ${L.border}`, borderRadius: 18,
      padding: '14px 16px', marginBottom: 14,
      fontFamily: '-apple-system, "SF Pro Display", sans-serif',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: loading || matches.length || error ? 10 : 0 }}>
        <span style={{ fontSize: 18 }}>🧠</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: L.textPrimary }}>Similar Past Cases</span>
        {loading && <span style={{ fontSize: 11, color: L.textMuted, marginLeft: 'auto' }}>Searching…</span>}
      </div>

      {loading && (
        <div style={{ display: 'flex', gap: 6 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              flex: 1, height: 46, borderRadius: 12, background: '#F1F5F9',
              animation: `kmc-pulse 1.2s ${i * 0.15}s ease infinite`,
            }} />
          ))}
        </div>
      )}

      {error && !loading && (
        <div style={{ fontSize: 12, color: L.textMuted }}>
          {error}
        </div>
      )}

      {!loading && !error && matches.length === 0 && (
        <div style={{ fontSize: 12, color: L.textMuted }}>
          No sufficiently similar past cases found.
        </div>
      )}

      {!loading && matches.map(m => {
        const pct = m.similarity;
        const color = similarityColor(pct);
        const variances = describeVariance(currentFindings, m.keyFindings || {});
        const isOpen = expandedId === m.id;

        return (
          <div
            key={m.id}
            onClick={() => setExpandedId(isOpen ? null : m.id)}
            style={{
              border: `1px solid ${isOpen ? color : L.border}`,
              borderLeft: `4px solid ${color}`,
              borderRadius: 14, padding: '10px 12px', marginBottom: 8,
              cursor: 'pointer', transition: 'all 0.2s',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: L.textPrimary }}>{m.diagnosis}</div>
                <div style={{ fontSize: 11, color: L.textMuted, marginTop: 1 }}>{m.specialty}</div>
              </div>
              <div style={{
                fontSize: 14, fontWeight: 800, color,
                background: `${color}15`, borderRadius: 20, padding: '3px 10px',
              }}>
                {pct}% match
              </div>
            </div>

            {isOpen && (
              <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${L.border}` }}>
                <div style={{ fontSize: 12, color: L.textSub, lineHeight: 1.6, marginBottom: variances.length ? 8 : 0 }}>
                  {m.summary?.slice(0, 200)}{m.summary?.length > 200 ? '…' : ''}
                </div>
                {variances.length > 0 && (
                  <div style={{
                    background: '#FEF3C7', borderRadius: 10, padding: '8px 10px',
                  }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#92400E', marginBottom: 4, letterSpacing: 0.5 }}>
                      KEY DIFFERENCES
                    </div>
                    {variances.map((v, i) => (
                      <div key={i} style={{ fontSize: 11, color: '#92400E', lineHeight: 1.5 }}>• {v}</div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      <style>{`@keyframes kmc-pulse { 0%,100%{opacity:0.5} 50%{opacity:1} }`}</style>
    </div>
  );
}
