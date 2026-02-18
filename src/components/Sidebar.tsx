'use client';

import { useState } from 'react';
import type { Morpheme } from '@/types';

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

  const handleSubmit = async () => {
    if (!inputValue.trim() || isAdding) return;
    setIsAdding(true);
    await onAdd(inputValue);
    setInputValue('');
    setIsAdding(false);
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

      {/* Footer — Add New */}
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
        )}
      </div>
    </aside>
  );
}
