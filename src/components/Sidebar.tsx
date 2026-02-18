'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Morpheme } from '@/types';

interface Suggestion {
  id: string;
  meaning: string;
}

interface SidebarProps {
  morphemes: Morpheme[];
  activeTab: 'root' | 'prefix' | 'suffix';
  onTabChange: (tab: 'root' | 'prefix' | 'suffix') => void;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAdd: (value: string) => Promise<void>;
}

export default function Sidebar({
  morphemes,
  activeTab,
  onTabChange,
  selectedId,
  onSelect,
  onAdd,
}: SidebarProps) {
  const [addOpen, setAddOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [addingTag, setAddingTag] = useState<string | null>(null);

  // Fetch suggestions when the section opens or tab changes
  const fetchSuggestions = useCallback(async (input?: string) => {
    setLoadingSuggestions(true);
    try {
      const res = await fetch('/api/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: activeTab, input: input || '' }),
      });
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data.suggestions || []);
      }
    } catch {
      // Silently fail
    } finally {
      setLoadingSuggestions(false);
    }
  }, [activeTab]);

  // Fetch suggestions when panel opens
  useEffect(() => {
    if (addOpen) {
      fetchSuggestions();
    }
  }, [addOpen, activeTab, fetchSuggestions]);

  // Debounced fetch when user types
  useEffect(() => {
    if (!addOpen) return;
    const timer = setTimeout(() => {
      fetchSuggestions(inputValue);
    }, 400);
    return () => clearTimeout(timer);
  }, [inputValue, addOpen, fetchSuggestions]);

  const handleSubmit = async () => {
    if (!inputValue.trim() || isAdding) return;
    setIsAdding(true);
    await onAdd(inputValue);
    setInputValue('');
    setIsAdding(false);
    // Refresh suggestions after adding
    fetchSuggestions();
  };

  const handleTagClick = async (suggestion: Suggestion) => {
    setAddingTag(suggestion.id);
    await onAdd(suggestion.id);
    // Remove from suggestions
    setSuggestions((prev) => prev.filter((s) => s.id !== suggestion.id));
    setAddingTag(null);
  };

  const tabs: { key: 'root' | 'prefix' | 'suffix'; label: string }[] = [
    { key: 'root', label: 'Roots' },
    { key: 'prefix', label: 'Prefixes' },
    { key: 'suffix', label: 'Suffixes' },
  ];

  return (
    <aside className="sidebar">
      {/* Tabs */}
      <div className="sidebar-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`sidebar-tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => onTabChange(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="sidebar-list">
        {morphemes.length === 0 ? (
          <div style={{ padding: '20px 12px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
            No {activeTab}s yet. Add one below.
          </div>
        ) : (
          morphemes.map((m) => (
            <div
              key={m.id}
              className={`sidebar-item ${selectedId === m.id ? 'active' : ''}`}
              onClick={() => onSelect(m.id)}
            >
              <span className="sidebar-item-id">{m.id}</span>
              <span className="sidebar-item-meaning">{m.meaning}</span>
            </div>
          ))
        )}
      </div>

      {/* Footer — Add New with AI Suggestions */}
      <div className="sidebar-footer">
        <button
          className={`sidebar-add-toggle ${addOpen ? 'open' : ''}`}
          onClick={() => setAddOpen(!addOpen)}
        >
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
          </svg>
          Suggest new {activeTab}
        </button>

        {addOpen && (
          <div className="sidebar-suggest-panel">
            {/* AI Suggestion Tags */}
            <div className="suggest-tags-section">
              <div className="suggest-tags-header">
                <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
                  <path d="M15.98 1.804a1 1 0 0 0-1.96 0l-.24 1.192a1 1 0 0 1-.784.785l-1.192.238a1 1 0 0 0 0 1.962l1.192.238a1 1 0 0 1 .785.785l.238 1.192a1 1 0 0 0 1.962 0l.238-1.192a1 1 0 0 1 .785-.785l1.192-.238a1 1 0 0 0 0-1.962l-1.192-.238a1 1 0 0 1-.785-.785l-.238-1.192ZM6.949 5.684a1 1 0 0 0-1.898 0l-.683 2.051a1 1 0 0 1-.633.633l-2.051.683a1 1 0 0 0 0 1.898l2.051.684a1 1 0 0 1 .633.632l.683 2.051a1 1 0 0 0 1.898 0l.683-2.051a1 1 0 0 1 .633-.633l2.051-.683a1 1 0 0 0 0-1.898l-2.051-.683a1 1 0 0 1-.633-.633L6.95 5.684Z" />
                </svg>
                <span>AI Suggestions</span>
                <button
                  className="suggest-refresh-btn"
                  onClick={() => fetchSuggestions(inputValue)}
                  disabled={loadingSuggestions}
                  title="Refresh suggestions"
                >
                  <svg viewBox="0 0 20 20" fill="currentColor" width="12" height="12" className={loadingSuggestions ? 'spinning' : ''}>
                    <path fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H4.598a.75.75 0 00-.75.75v3.634a.75.75 0 001.5 0v-2.033l.312.311a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39zm-10.624-2.85a5.5 5.5 0 019.201-2.465l.312.31H11.77a.75.75 0 000 1.5h3.634a.75.75 0 00.75-.75V3.535a.75.75 0 00-1.5 0v2.033l-.312-.311A7 7 0 002.63 8.396a.75.75 0 001.45.39l-.006.001.614-.213z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              {loadingSuggestions && suggestions.length === 0 ? (
                <div className="suggest-tags-loading">
                  <div className="suggest-tag-skeleton" />
                  <div className="suggest-tag-skeleton" />
                  <div className="suggest-tag-skeleton" />
                </div>
              ) : suggestions.length > 0 ? (
                <div className="suggest-tags">
                  {suggestions.map((s) => (
                    <button
                      key={s.id}
                      className={`suggest-tag ${addingTag === s.id ? 'adding' : ''}`}
                      onClick={() => handleTagClick(s)}
                      disabled={addingTag !== null}
                      title={`Add "${s.id}" — ${s.meaning}`}
                    >
                      {addingTag === s.id ? (
                        <span className="suggest-tag-spinner" />
                      ) : (
                        <svg viewBox="0 0 20 20" fill="currentColor" width="10" height="10">
                          <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                        </svg>
                      )}
                      <span className="suggest-tag-id">{s.id}</span>
                      <span className="suggest-tag-meaning">{s.meaning}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="suggest-tags-empty">No more suggestions</div>
              )}
            </div>

            {/* Manual input */}
            <div className="sidebar-add-divider">
              <span>or type manually</span>
            </div>
            <div className="sidebar-add-form">
              <input
                className="sidebar-add-input"
                placeholder={`Enter ${activeTab}...`}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              />
              <button
                className="sidebar-add-btn"
                onClick={handleSubmit}
                disabled={!inputValue.trim() || isAdding}
              >
                {isAdding ? '...' : 'Add'}
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
