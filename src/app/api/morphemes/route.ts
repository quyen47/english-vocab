import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// GET /api/morphemes — return all morphemes
export async function GET() {
  const filePath = path.join(process.cwd(), 'src/data/morphemes.json');
  const raw = fs.readFileSync(filePath, 'utf-8');
  const morphemes = JSON.parse(raw);
  return NextResponse.json(morphemes);
}
