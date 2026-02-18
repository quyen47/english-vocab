'use client';

import type { MorphemeContent, VocabularyWord } from '@/types';

interface LearnViewProps {
  content: MorphemeContent;
}

function VocabItem({ word, index }: { word: VocabularyWord; index: number }) {
  const levelClass = word.level.toLowerCase().replace('+', '');

  return (
    <div className="vocab-item">
      <div className="vocab-item-header">
        <span className="vocab-number">{index + 1}</span>
        <span className="vocab-word">{word.word}</span>
        <span className="vocab-breakdown">{word.breakdown}</span>
        <span className={`vocab-level ${levelClass}`}>{word.level}</span>
      </div>
      <div className="vocab-item-body">
        {/* Morphology */}
        <div className="morphology">
          {word.parts.map((p, i) => (
            <span key={i}>
              {i > 0 && <span className="morph-arrow"> + </span>}
              <span className="morph-part">
                <span className="morph-part-name">{p.part}</span>
                <span className="morph-part-meaning">{p.meaning}</span>
              </span>
            </span>
          ))}
          <span className="morph-arrow"> → </span>
          <span className="morph-result">{word.logic}</span>
        </div>

        {/* Meaning */}
        <div className="vocab-meaning">
          <span className="vocab-meaning-en">{word.meaning_en}</span>
          <span className="vocab-meaning-vi">({word.meaning_vi})</span>
        </div>

        {/* Example */}
        <div className="vocab-example">{word.example}</div>

        {/* Collocations */}
        {word.collocations.length > 0 && (
          <div>
            <div className="collocations-title">Common Collocations</div>
            <div className="collocation-list">
              {word.collocations.map((c, i) => (
                <div key={i} className="collocation-item">
                  <span className="collocation-phrase">{c.phrase}</span>
                  <span className="collocation-example">→ {c.example}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Word Forms */}
        {word.forms.length > 0 && (
          <div>
            <div className="forms-title">Word Forms</div>
            <div className="forms-list">
              {word.forms.map((f, i) => (
                <div key={i} className="form-tag">
                  <div>
                    <span className="form-word">{f.word}</span>
                    <span className="form-type"> ({f.type})</span>
                  </div>
                  <span className="form-example">{f.example}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LearnView({ content }: LearnViewProps) {
  return (
    <div className="learn-view">
      {/* Session 1: Explanation */}
      <section className="section-card">
        <span className="section-label">Session 1</span>
        <div className="root-hero">
          <div className="root-badge">{content.id.toUpperCase()}</div>
          <div className="root-meta">
            <h2>
              {content.type === 'root' ? 'Root' : content.type === 'prefix' ? 'Prefix' : 'Suffix'}:{' '}
              <span style={{ color: 'var(--color-primary)' }}>{content.id}</span>
            </h2>
            <div className="root-meaning">= {content.meaning}</div>
            <div className="origin">{content.origin}</div>
          </div>
        </div>
        <p
          className="explanation-text"
          dangerouslySetInnerHTML={{ __html: content.explanation.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>') }}
        />
        {content.level_note && <div className="level-note">{content.level_note}</div>}
      </section>

      {/* Session 2: Vocabulary List */}
      <section className="section-card">
        <span className="section-label">Session 2</span>
        <h3 className="section-title">Vocabulary &amp; Morphology</h3>
        <p className="section-subtitle">
          Words built from <strong>{content.id}</strong> ({content.meaning}), organized by CEFR level.
        </p>
        <div className="vocab-list">
          {content.words.map((word, i) => (
            <VocabItem key={word.word} word={word} index={i} />
          ))}
        </div>
      </section>

      {/* Session 3: Memory Logic */}
      <section className="section-card">
        <span className="section-label">Session 3</span>
        <h3 className="section-title">
          Logic Ghi nhớ {content.type === 'root' ? 'Root' : content.type} {content.id.toUpperCase()}
        </h3>
        <p className="section-subtitle">
          {content.id} = <strong>{content.memory_logic.meaning}</strong>
        </p>
        <table className="memory-table">
          <thead>
            <tr>
              <th>Affix</th>
              <th>Ý nghĩa</th>
              <th>Từ hình thành</th>
            </tr>
          </thead>
          <tbody>
            {content.memory_logic.table.map((row, i) => (
              <tr key={i}>
                <td className="affix">{row.prefix || row.suffix || ''}</td>
                <td>{row.prefix_meaning || row.suffix_meaning || ''}</td>
                <td className="result-word">{row.result}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
