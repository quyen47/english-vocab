import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// POST /api/generate — trigger n8n or save generated content
export async function POST(request: Request) {
  const body = await request.json();
  const { morpheme, type } = body;

  if (!morpheme || !type) {
    return NextResponse.json({ error: 'morpheme and type are required' }, { status: 400 });
  }

  // Check if n8n webhook URL is configured
  const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;

  if (n8nWebhookUrl) {
    try {
      // Call n8n to generate vocabulary
      const n8nResponse = await fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ morpheme, type }),
      });

      if (!n8nResponse.ok) {
        return NextResponse.json({ error: 'n8n webhook failed' }, { status: 502 });
      }

      const generatedContent = await n8nResponse.json();

      // Save content locally
      const contentPath = path.join(process.cwd(), `src/data/content/${morpheme}.json`);
      fs.writeFileSync(contentPath, JSON.stringify(generatedContent, null, 2));

      // Update morphemes list
      const morphemesPath = path.join(process.cwd(), 'src/data/morphemes.json');
      const morphemesRaw = fs.readFileSync(morphemesPath, 'utf-8');
      const morphemes = JSON.parse(morphemesRaw);

      const exists = morphemes.some((m: { id: string }) => m.id === morpheme);
      if (!exists) {
        morphemes.push({
          id: morpheme,
          type,
          meaning: generatedContent.meaning || '',
        });
        fs.writeFileSync(morphemesPath, JSON.stringify(morphemes, null, 2));
      }

      return NextResponse.json({ success: true, content: generatedContent });
    } catch {
      return NextResponse.json({ error: 'Failed to call n8n' }, { status: 500 });
    }
  } else {
    // n8n not configured — add a placeholder entry
    const morphemesPath = path.join(process.cwd(), 'src/data/morphemes.json');
    const morphemesRaw = fs.readFileSync(morphemesPath, 'utf-8');
    const morphemes = JSON.parse(morphemesRaw);

    const exists = morphemes.some((m: { id: string }) => m.id === morpheme);
    if (!exists) {
      morphemes.push({
        id: morpheme,
        type,
        meaning: '(pending generation)',
      });
      fs.writeFileSync(morphemesPath, JSON.stringify(morphemes, null, 2));
    }

    return NextResponse.json({
      success: true,
      message: 'Added to list. Configure N8N_WEBHOOK_URL to enable AI generation.',
    });
  }
}
