import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// POST /api/suggest — get AI-suggested morphemes
export async function POST(request: Request) {
  const body = await request.json();
  const { type, input } = body; // type: root|prefix|suffix, input: optional user text

  if (!type) {
    return NextResponse.json({ error: 'type is required' }, { status: 400 });
  }

  // Read existing morphemes to exclude them from suggestions
  const morphemesPath = path.join(process.cwd(), 'src/data/morphemes.json');
  const morphemesRaw = fs.readFileSync(morphemesPath, 'utf-8');
  const morphemes = JSON.parse(morphemesRaw);
  const existingIds = morphemes
    .filter((m: { type: string }) => m.type === type)
    .map((m: { id: string }) => m.id);

  const n8nBaseUrl = process.env.N8N_WEBHOOK_URL;
  if (!n8nBaseUrl) {
    // Fallback: return some hardcoded common suggestions
    return NextResponse.json({ suggestions: getFallbackSuggestions(type, existingIds, input) });
  }

  // Call the n8n suggest webhook (same base but different path)
  const suggestUrl = n8nBaseUrl.replace(/\/generate-vocab$/, '/suggest-vocab');

  try {
    const res = await fetch(suggestUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type,
        input: input || '',
        existing: existingIds.join(', ') || 'none',
      }),
    });

    if (!res.ok) {
      // Fallback if n8n suggest webhook isn't set up
      return NextResponse.json({ suggestions: getFallbackSuggestions(type, existingIds, input) });
    }

    const data = await res.json();
    // Expect: { suggestions: [{ id: "rupt", meaning: "break" }, ...] }
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ suggestions: getFallbackSuggestions(type, existingIds, input) });
  }
}

// Fallback suggestions when n8n is not available
function getFallbackSuggestions(
  type: string,
  existingIds: string[],
  input?: string
): { id: string; meaning: string }[] {
  const allSuggestions: Record<string, { id: string; meaning: string }[]> = {
    root: [
      { id: 'rupt', meaning: 'break' },
      { id: 'scrib', meaning: 'write' },
      { id: 'duct', meaning: 'lead' },
      { id: 'tract', meaning: 'pull / draw' },
      { id: 'ject', meaning: 'throw' },
      { id: 'mit', meaning: 'send' },
      { id: 'cred', meaning: 'believe' },
      { id: 'vis', meaning: 'see' },
      { id: 'aud', meaning: 'hear' },
      { id: 'ven', meaning: 'come' },
      { id: 'voc', meaning: 'call / voice' },
      { id: 'form', meaning: 'shape' },
      { id: 'pend', meaning: 'hang / weigh' },
      { id: 'pos', meaning: 'put / place' },
      { id: 'cept', meaning: 'take / seize' },
    ],
    prefix: [
      { id: 'un-', meaning: 'not / reverse' },
      { id: 're-', meaning: 'again / back' },
      { id: 'pre-', meaning: 'before' },
      { id: 'mis-', meaning: 'wrong / bad' },
      { id: 'dis-', meaning: 'not / apart' },
      { id: 'over-', meaning: 'excessive' },
      { id: 'sub-', meaning: 'under / below' },
      { id: 'inter-', meaning: 'between' },
      { id: 'anti-', meaning: 'against' },
      { id: 'super-', meaning: 'above / beyond' },
    ],
    suffix: [
      { id: '-tion', meaning: 'state / action' },
      { id: '-ment', meaning: 'result / action' },
      { id: '-ness', meaning: 'state / quality' },
      { id: '-able', meaning: 'capable of' },
      { id: '-ful', meaning: 'full of' },
      { id: '-less', meaning: 'without' },
      { id: '-ous', meaning: 'having quality' },
      { id: '-ive', meaning: 'tending to' },
      { id: '-ly', meaning: 'in manner of' },
      { id: '-er', meaning: 'one who' },
    ],
  };

  let pool = allSuggestions[type] || allSuggestions.root;

  // Filter out existing morphemes
  pool = pool.filter((s) => !existingIds.includes(s.id));

  // If user typed something, filter by input
  if (input && input.trim()) {
    const q = input.trim().toLowerCase();
    const matching = pool.filter(
      (s) => s.id.includes(q) || s.meaning.toLowerCase().includes(q)
    );
    if (matching.length > 0) {
      pool = matching;
    }
  }

  // Shuffle and return 5
  const shuffled = pool.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 5);
}
