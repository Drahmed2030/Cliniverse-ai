
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
    } catch {
      setResult({ error: 'Analysis failed — please try again' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      padding: '20px 16px 100px',
      fontFamily: '-apple-system, "SF Pro Display", sans-serif',
      minHeight: '100vh',
      background: '#F8FAFC',
    }}>
      <div style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>
        📄 Document Analyzer
      </div>
      <div style={{ fontSize: 13, color: '#64748B', marginBottom: 20 }}>
        Upload any medical PDF or document — AI extracts clinical insights instantly
      </div>

      {/* Upload Card */}
      <div style={{
        background: '#FFFFFF', borderRadius: 20, padding: 20,
        border: '1px solid #E2E8F0', marginBottom: 16,
        boxShadow: '0 2px 12px rgba(15,23,42,0.06)',
      }}>
        <div
          onClick={() => fileRef.current?.click()}
          style={{
            border: `2px dashed ${file ? '#0D9488' : '#CBD5E1'}`,
            borderRadius: 16, padding: 32, textAlign: 'center',
            cursor: 'pointer', background: file ? '#F0FDF9' : '#F8FAFC',
            transition: 'all 0.2s',
          }}>
          <div style={{ fontSize: 40 }}>{file ? '📋' : '📤'}</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', marginTop: 8 }}>
            {file ? file.name : 'Tap to upload document'}
          </div>
          <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>
            PDF, DOCX, TXT — Discharge summaries, Guidelines, Reports
          </div>
        </div>
        <input
          ref={fileRef} type="file" accept=".pdf,.docx,.doc,.txt"
          style={{ display: 'none' }}
          onChange={e => setFile(e.target.files?.[0] || null)}
        />

        <input
          style={{
            width: '100%', padding: '10px 14px', marginTop: 12,
            border: '1px solid #E2E8F0', borderRadius: 12,
            fontSize: 14, outline: 'none', fontFamily: 'inherit',
            boxSizing: 'border-box' as const,
          }}
          placeholder="Optional: Ask a specific question about the document..."
          value={question}
          onChange={e => setQuestion(e.target.value)}
        />

        <button
          onClick={analyze}
          disabled={!file || loading}
          style={{
            width: '100%', padding: 14, marginTop: 12,
            background: !file || loading
              ? '#E2E8F0'
              : 'linear-gradient(135deg, #0D9488, #1E40AF)',
            color: !file || loading ? '#94A3B8' : '#FFFFFF',
            border: 'none', borderRadius: 14,
            fontSize: 15, fontWeight: 700, cursor: !file || loading ? 'not-allowed' : 'pointer',
          }}>
          {loading ? '⏳ Analyzing…' : '🔬 Analyze Document'}
        </button>
      </div>

      {result?.error && (
        <div style={{
          background: '#FEE2E2', borderRadius: 14, padding: 16,
          color: '#991B1B', fontSize: 13,
        }}>
          ❌ {result.error}
        </div>
      )}

      {result?.analysis && (
        <div style={{
          background: '#FFFFFF', borderRadius: 20, padding: 20,
          border: '1px solid #E2E8F0',
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#0D9488', marginBottom: 12 }}>
            ✅ {result.filename} — Analysis Complete
          </div>
          <div style={{ fontSize: 14, color: '#0F172A', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
            {result.analysis}
          </div>
          <div style={{
            marginTop: 12, padding: '8px 12px',
            background: '#F0FDF9', borderRadius: 10,
            fontSize: 11, color: '#047857',
          }}>
            ⚠️ Educational use only. Verify all clinical information independently.
          </div>
        </div>
      )}
    </div>
  );
}
