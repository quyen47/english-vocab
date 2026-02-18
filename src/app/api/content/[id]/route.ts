import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// GET /api/content/[id] — return content for a specific morpheme
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const filePath = path.join(process.cwd(), `src/data/content/${id}.json`);

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: 'Content not found' }, { status: 404 });
  }

  const raw = fs.readFileSync(filePath, 'utf-8');
  const content = JSON.parse(raw);
  return NextResponse.json(content);
}
