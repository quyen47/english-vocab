// Types for the English Vocabulary App

export interface Morpheme {
  id: string;
  type: 'root' | 'prefix' | 'suffix';
  meaning: string;
}

export interface WordPart {
  part: string;
  meaning: string;
}

export interface Collocation {
  phrase: string;
  example: string;
}

export interface WordForm {
  word: string;
  type: string; // 'n' | 'v' | 'adj' | 'adv'
  example: string;
}

export interface VocabularyWord {
  word: string;
  level: string; // 'B1' | 'B2' | 'C1'
  breakdown: string;
  parts: WordPart[];
  logic: string;
  meaning_vi: string;
  meaning_en: string;
  example: string;
  collocations: Collocation[];
  forms: WordForm[];
}

export interface MemoryTableRow {
  prefix?: string;
  prefix_meaning?: string;
  suffix?: string;
  suffix_meaning?: string;
  result: string;
}

export interface MemoryLogic {
  root: string;
  meaning: string;
  table: MemoryTableRow[];
}

export interface MorphemeContent {
  id: string;
  type: 'root' | 'prefix' | 'suffix';
  meaning: string;
  origin: string;
  explanation: string;
  level_note: string;
  words: VocabularyWord[];
  memory_logic: MemoryLogic;
}
