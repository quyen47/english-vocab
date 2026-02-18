'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Morpheme, MorphemeContent } from '@/types';
import Sidebar from '@/components/Sidebar';
import LearnView from '@/components/LearnView';
import PracticeView from '@/components/PracticeView';

export default function Home() {
  const [mode, setMode] = useState<'learn' | 'practice'>('learn');
  const [morphemes, setMorphemes] = useState<Morpheme[]>([]);
  const [activeTab, setActiveTab] = useState<'root' | 'prefix' | 'suffix'>('root');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [content, setContent] = useState<MorphemeContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [contentNotFound, setContentNotFound] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Fetch morphemes list
  useEffect(() => {
    fetch('/api/morphemes')
      .then((res) => res.json())
      .then((data: Morpheme[]) => {
        setMorphemes(data);
        // Auto-select first root
        const firstRoot = data.find((m) => m.type === 'root');
        if (firstRoot) setSelectedId(firstRoot.id);
      })
      .catch(console.error);
  }, []);

  // Fetch content when selection changes
  useEffect(() => {
    if (!selectedId) return;
    setLoading(true);
    setContentNotFound(false);
    setContent(null);
    fetch(`/api/content/${selectedId}`)
      .then((res) => {
        if (!res.ok) {
          setContentNotFound(true);
          setContent(null);
          setLoading(false);
          return null;
        }
        return res.json();
      })
      .then((data: MorphemeContent | null) => {
        if (data) {
          setContent(data);
          setContentNotFound(false);
        }
        setLoading(false);
      })
      .catch(() => {
        setContent(null);
        setContentNotFound(true);
        setLoading(false);
      });
  }, [selectedId]);

  const filteredMorphemes = morphemes.filter((m) => m.type === activeTab);

  // Generate content for the currently selected morpheme via n8n
  const handleGenerate = useCallback(async () => {
    if (!selectedId) return;
    const selected = morphemes.find((m) => m.id === selectedId);
    if (!selected) return;
    setGenerating(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ morpheme: selectedId, type: selected.type }),
      });
      if (res.ok) {
        const result = await res.json();
        if (result.content) {
          // n8n returned full content — load it directly
          setContent(result.content);
          setContentNotFound(false);
        } else {
          // Refetch from file (placeholder mode or content was saved)
          const contentRes = await fetch(`/api/content/${selectedId}`);
          if (contentRes.ok) {
            const data: MorphemeContent = await contentRes.json();
            setContent(data);
            setContentNotFound(false);
          }
        }
      }
    } finally {
      setGenerating(false);
    }
  }, [selectedId, morphemes]);

  const handleAdd = useCallback(
    async (value: string) => {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ morpheme: value.toLowerCase().trim(), type: activeTab }),
      });
      if (res.ok) {
        // Refresh list
        const listRes = await fetch('/api/morphemes');
        const updated: Morpheme[] = await listRes.json();
        setMorphemes(updated);
        setSelectedId(value.toLowerCase().trim());
      }
    },
    [activeTab]
  );

  return (
    <div className="app-shell">
      {/* Header */}
      <header className="app-header">
        <div className="app-logo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
          English Vocab
        </div>

        <div className="mode-toggle">
          <button
            className={`mode-toggle-btn ${mode === 'learn' ? 'active' : ''}`}
            onClick={() => setMode('learn')}
          >
            Learn Mode
          </button>
          <button
            className={`mode-toggle-btn ${mode === 'practice' ? 'active' : ''}`}
            onClick={() => setMode('practice')}
          >
            Practice Mode
          </button>
        </div>

        <div style={{ width: 120 }} /> {/* Spacer for centering */}
      </header>

      {/* Body */}
      <div className="app-body">
        <Sidebar
          morphemes={filteredMorphemes}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onAdd={handleAdd}
        />

        <main className="main-content">
          {loading ? (
            <div className="loading">
              <div className="spinner" />
            </div>
          ) : mode === 'learn' ? (
            content ? (
              <LearnView content={content} />
            ) : contentNotFound && selectedId ? (
              <div className="generate-state">
                <div className="generate-state-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
                  </svg>
                </div>
                <h3 className="generate-state-title">No content yet for <span style={{color: 'var(--color-primary)', fontFamily: 'var(--font-mono)'}}>{selectedId}</span></h3>
                <p className="generate-state-desc">Use AI to generate vocabulary for this {morphemes.find(m => m.id === selectedId)?.type || 'morpheme'}.</p>
                <button
                  className="generate-btn"
                  onClick={handleGenerate}
                  disabled={generating}
                >
                  {generating ? (
                    <><span className="btn-spinner" /> Generating...</>
                  ) : (
                    <>
                      <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                        <path d="M15.98 1.804a1 1 0 0 0-1.96 0l-.24 1.192a1 1 0 0 1-.784.785l-1.192.238a1 1 0 0 0 0 1.962l1.192.238a1 1 0 0 1 .785.785l.238 1.192a1 1 0 0 0 1.962 0l.238-1.192a1 1 0 0 1 .785-.785l1.192-.238a1 1 0 0 0 0-1.962l-1.192-.238a1 1 0 0 1-.785-.785l-.238-1.192ZM6.949 5.684a1 1 0 0 0-1.898 0l-.683 2.051a1 1 0 0 1-.633.633l-2.051.683a1 1 0 0 0 0 1.898l2.051.684a1 1 0 0 1 .633.632l.683 2.051a1 1 0 0 0 1.898 0l.683-2.051a1 1 0 0 1 .633-.633l2.051-.683a1 1 0 0 0 0-1.898l-2.051-.683a1 1 0 0 1-.633-.633L6.95 5.684Z" />
                      </svg>
                      Generate with AI
                    </>
                  )}
                </button>
                {!process.env.NEXT_PUBLIC_HAS_N8N && (
                  <p className="generate-state-hint">Make sure your n8n workflow is running and <code>N8N_WEBHOOK_URL</code> is set in <code>.env.local</code></p>
                )}
              </div>
            ) : (
              <div className="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <p>Select a morpheme from the sidebar to start learning</p>
              </div>
            )
          ) : (
            <PracticeView morphemes={morphemes} />
          )}
        </main>
      </div>
    </div>
  );
}
