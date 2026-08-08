
'use client';
import { useState, useRef } from 'react';

export default function DocAnalyzer() {
  const [file, setFile] = useState<File | null>(null);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const analyze = async () => {
    if (!file || loading) return;
    setLoading(true);
    setResult(null);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('question', question || 'Summarize this document clinically');
    try {
      const res = await fetch('/api/analyze-doc', { method: 'POST', body: fd });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      setResult({ error: 'Analysis failed' });
    } finally {
      setLoading(false);
    }
  };

  const S = {
    wrap: { padding: '20px 16px', fontFamily: '-apple-system, "SF Pro Display", sans-serif' },
    card: { background: '#FFFFFF', borderRadius: 20, padding: 20, border: '1px solid #E2E8F0', marginBottom: 16 },
    dropZone: {
      border: '2px dashed #0D9488',
      borderRadius: 16,
      padding: 32,
      textAlign: 'center' as const,
      cursor: 'pointer',
      background: file ? '#F0FDF9' : '#F8FAFC',
    },
    btn: (disabled: boolean) => ({
      width: '100%',
      padding: 14,
      background: disabled ? '#E2E8F0' : 'linear-gradient(135deg, #0D9488, #1E40AF)',
      color: disabled ? '#94A3B8' : '#FFFFFF',
      border: 'none',
      borderRadius: 14,
      fontSize: 15,
      fontWeight: 700,
      cursor: disabled ? 'not-allowed' : 'pointer',
    }),
    input: {
      width: '100%',
      padding: '10px 14px',
      border: '1px solid #E2E8F0',
      borderRadius: 12,
      fontSize: 14,
      outline: 'none',
      marginBottom: 12,
      fontFamily: 'inherit',
    } as React.CSSProperties,
  };

  return (
    <div style={S.wrap}>
      <div style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>
        📄 Document Analyzer
      </div>
      <div style={{ fontSize: 13, color: '#64748B', marginBottom: 16 }}>
        Upload any medical PDF, Word, or document — AI extracts clinical insights instantly
      </div>

      <div style={S.card}>
        <div style={S.dropZone} onClick={() => fileRef.current?.click()}>
          <div style={{ fontSize: 32 }}>{file ? '📋' : '📤'}</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', marginTop: 8 }}>
            {file ? file.name : 'Tap to upload document'}
          </div>
          <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>
            PDF, DOCX, TXT — Discharge summaries, Guidelines, Reports
          </div>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.docx,.doc,.txt"
          style={{ display: 'none' }}
          onChange={e => setFile(e.target.files?.[0] || null)}
        />

        <input
          style={{ ...S.input, marginTop: 12 }}
          placeholder="Optional: Ask a specific question about the document..."
          value={question}
          onChange={e => setQuestion(e.target.value)}
        />

        <button style={S.btn(!file || loading)} onClick={analyze} disabled={!file || loading}>
          {loading ? '⏳ Analyzing…' : '🔬 Analyze Document'}
        </button>
      </div>

      {result?.error && (
        <div style={{ background: '#FEE2E2', borderRadius: 12, padding: 16, color: '#991B1B', fontSize: 13 }}>
          ❌ {result.error}
        </div>
      )}

      {result?.analysis && (
        <div style={S.card}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#0D9488', marginBottom: 12 }}>
            ✅ {result.filename} — Analysis Complete
          </div>
          <div style={{
            fontSize: 14,
            color: '#0F172A',
            lineHeight: 1.7,
            whiteSpace: 'pre-wrap',
          }}>
            {result.analysis}
          </div>
          <div style={{
            marginTop: 12,
            padding: '8px 12px',
            background: '#F0FDF9',
            borderRadius: 10,
            fontSize: 11,
            color: '#047857',
          }}>
            ⚠️ Educational use only. Verify all clinical information independently.
          </div>
        </div>
      )}
    </div>
  );
}
