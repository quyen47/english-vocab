'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Morpheme, MorphemeContent, VocabularyWord } from '@/types';

interface PracticeViewProps {
  morphemes: Morpheme[];
}

interface QuizQuestion {
  type: 'meaning' | 'breakdown' | 'fill';
  word: VocabularyWord;
  question: string;
  options: string[];
  correctIndex: number;
  source: string; // morpheme id
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function generateQuestions(allWords: { word: VocabularyWord; source: string }[]): QuizQuestion[] {
  if (allWords.length < 2) return [];

  const questions: QuizQuestion[] = [];

  for (const { word, source } of allWords) {
    // Type 1: What does the word mean?
    const otherMeanings = allWords
      .filter((w) => w.word.word !== word.word)
      .map((w) => w.word.meaning_en);
    const uniqueOther = [...new Set(otherMeanings)];

    if (uniqueOther.length >= 3) {
      const wrongOptions = shuffleArray(uniqueOther).slice(0, 3);
      const options = shuffleArray([word.meaning_en, ...wrongOptions]);
      questions.push({
        type: 'meaning',
        word,
        question: `What does "${word.word}" mean?`,
        options,
        correctIndex: options.indexOf(word.meaning_en),
        source,
      });
    }

    // Type 2: Which breakdown is correct?
    const otherBreakdowns = allWords
      .filter((w) => w.word.word !== word.word)
      .map((w) => w.word.breakdown);
    const uniqueBreakdowns = [...new Set(otherBreakdowns)];

    if (uniqueBreakdowns.length >= 3) {
      const wrongOptions = shuffleArray(uniqueBreakdowns).slice(0, 3);
      const options = shuffleArray([word.breakdown, ...wrongOptions]);
      questions.push({
        type: 'breakdown',
        word,
        question: `What is the morphological breakdown of "${word.word}"?`,
        options,
        correctIndex: options.indexOf(word.breakdown),
        source,
      });
    }
  }

  return shuffleArray(questions);
}

export default function PracticeView({ morphemes }: PracticeViewProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [loadingContent, setLoadingContent] = useState(true);

  // Load all content
  useEffect(() => {
    const loadAll = async () => {
      setLoadingContent(true);
      const allWords: { word: VocabularyWord; source: string }[] = [];

      for (const m of morphemes) {
        try {
          const res = await fetch(`/api/content/${m.id}`);
          if (res.ok) {
            const data: MorphemeContent = await res.json();
            for (const w of data.words) {
              allWords.push({ word: w, source: m.id });
            }
          }
        } catch {
          // skip missing content
        }
      }

      const generated = generateQuestions(allWords);
      setQuestions(generated);
      setCurrentIndex(0);
      setScore(0);
      setAnswered(0);
      setSelectedOption(null);
      setLoadingContent(false);
    };

    loadAll();
  }, [morphemes]);

  const handleSelect = useCallback(
    (optionIndex: number) => {
      if (selectedOption !== null) return; // already answered
      setSelectedOption(optionIndex);
      setAnswered((a) => a + 1);
      if (optionIndex === questions[currentIndex].correctIndex) {
        setScore((s) => s + 1);
      }
    },
    [selectedOption, questions, currentIndex]
  );

  const handleNext = useCallback(() => {
    setCurrentIndex((i) => i + 1);
    setSelectedOption(null);
  }, []);

  const handleRestart = useCallback(() => {
    setQuestions(shuffleArray(questions));
    setCurrentIndex(0);
    setScore(0);
    setAnswered(0);
    setSelectedOption(null);
  }, [questions]);

  if (loadingContent) {
    return (
      <div className="loading">
        <div className="spinner" />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <p>No practice content available yet. Add vocabulary in Learn Mode first!</p>
      </div>
    );
  }

  // Completed
  if (currentIndex >= questions.length) {
    return (
      <div className="practice-view">
        <div className="practice-complete section-card">
          <h2>Practice Complete!</h2>
          <p>
            You scored <strong>{score}</strong> out of <strong>{answered}</strong> (
            {answered > 0 ? Math.round((score / answered) * 100) : 0}%)
          </p>
          <button className="practice-restart-btn" onClick={handleRestart}>
            Practice Again
          </button>
        </div>
      </div>
    );
  }

  const q = questions[currentIndex];
  const isCorrect = selectedOption !== null && selectedOption === q.correctIndex;

  return (
    <div className="practice-view">
      {/* Score header */}
      <div className="practice-header">
        <div className="practice-score">
          <span>Question</span>
          <span className="practice-score-value">
            {currentIndex + 1}/{questions.length}
          </span>
        </div>
        <div className="practice-score">
          <span>Score</span>
          <span className="practice-score-value">
            {score}/{answered}
          </span>
        </div>
      </div>

      {/* Quiz card */}
      <div className="quiz-card">
        <div className="quiz-question">{q.question}</div>
        <div className="quiz-hint">
          Source: <strong>{q.source}</strong> · Level: <strong>{q.word.level}</strong>
        </div>

        <div className="quiz-options">
          {q.options.map((opt, i) => {
            let cls = 'quiz-option';
            if (selectedOption !== null) {
              if (i === q.correctIndex) cls += ' correct';
              else if (i === selectedOption) cls += ' wrong';
            }
            return (
              <button key={i} className={cls} onClick={() => handleSelect(i)}>
                {opt}
              </button>
            );
          })}
        </div>

        {selectedOption !== null && (
          <>
            <div className={`quiz-feedback ${isCorrect ? 'correct' : 'wrong'}`}>
              {isCorrect
                ? 'Correct! Well done.'
                : `Incorrect. The answer is: ${q.options[q.correctIndex]}`}
            </div>
            <button className="quiz-next-btn" onClick={handleNext}>
              {currentIndex + 1 < questions.length ? 'Next Question' : 'See Results'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
