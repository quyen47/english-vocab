# 📖 English Vocab

A modern web application for studying English vocabulary through **roots, prefixes, and suffixes**. Built with Next.js and powered by AI (n8n + OpenAI) for vocabulary generation.

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![License](https://img.shields.io/badge/License-MIT-green)

---

## ✨ Features

### 🎓 Learn Mode
- **Root Explanation** — Etymology, origin, and meaning of each morpheme
- **Vocabulary & Morphology** — Words broken down into parts (prefix + root + suffix) with Vietnamese translations
- **Collocations & Word Forms** — Common phrases and grammatical variations
- **Memory Logic Table** — Quick-reference table showing how prefixes/suffixes combine with the root

### 📝 Practice Mode
- Auto-generated quizzes from your vocabulary data
- Three question types: meaning, morphology breakdown, fill-in-the-blank
- Score tracking with instant feedback

### 🤖 AI Generation
- Click **"Generate with AI"** on any morpheme without content
- Connects to an n8n workflow that calls OpenAI to generate structured vocabulary data
- Generated content is saved locally as JSON — works fully offline after generation

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+
- **npm**
- *(Optional)* **n8n** for AI vocabulary generation

### Installation

```bash
# Clone the repo
git clone https://github.com/quyen47/english-vocab.git
cd english-vocab

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🤖 n8n Setup (AI Generation)

To enable the **"Generate with AI"** feature:

### 1. Import the workflow

Open your n8n instance → **Workflows** → **Import from File** → select `n8n/English_Vocab_Generator.json`

### 2. Configure OpenAI credentials

In n8n → **Credentials** → add your **OpenAI API** key → select it in the **"OpenAI - Generate Vocab"** node

### 3. Activate the workflow

Toggle the workflow to **Active**

### 4. Set the webhook URL

Create a `.env.local` file in the project root:

```env
N8N_WEBHOOK_URL=http://localhost:5678/webhook/generate-vocab
```

### 5. Restart the dev server

```bash
npm run dev
```

Now click any morpheme in the sidebar without content → click **"Generate with AI"** → the vocabulary data will be generated and saved automatically.

### Workflow Overview

```
Webhook (POST) → OpenAI gpt-4o-mini → Parse & Validate JSON → Respond
```

The AI generates structured vocabulary including:
- Morphological breakdowns with Vietnamese translations
- CEFR level tags (B1/B2/C1)
- Collocations and word forms
- Memory logic tables

---

## 📁 Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Main page (mode toggle, state management)
│   ├── globals.css             # Design system & styles
│   └── api/
│       ├── morphemes/route.ts  # GET — list all morphemes
│       ├── content/[id]/route.ts # GET — content for one morpheme
│       └── generate/route.ts   # POST — trigger n8n generation
├── components/
│   ├── Sidebar.tsx             # Tab navigation + morpheme list
│   ├── LearnView.tsx           # 3-session learning layout
│   └── PracticeView.tsx        # Quiz interface
├── data/
│   ├── morphemes.json          # Morpheme registry
│   └── content/
│       └── struct.json         # Example content (root: struct)
├── types/
│   └── index.ts                # TypeScript interfaces
n8n/
└── English_Vocab_Generator.json  # n8n importable workflow
```

---

## 📊 Data Format

Each morpheme content file follows this structure:

```json
{
  "id": "struct",
  "type": "root",
  "meaning": "build / construct",
  "origin": "Latin: struere",
  "explanation": "The root **struct** comes from Latin...",
  "level_note": "Words with STRUCT span from B1 to C1",
  "words": [
    {
      "word": "construct",
      "level": "B1",
      "breakdown": "con- + struct",
      "parts": [
        { "part": "con-", "meaning": "cùng nhau (together)" },
        { "part": "struct", "meaning": "xây dựng (build)" }
      ],
      "logic": "xây dựng hoàn chỉnh",
      "meaning_vi": "xây dựng",
      "meaning_en": "to build or make something",
      "example": "They constructed a new bridge.",
      "collocations": [...],
      "forms": [...]
    }
  ],
  "memory_logic": {
    "root": "struct",
    "meaning": "build",
    "table": [
      { "prefix": "con-", "prefix_meaning": "cùng / hoàn toàn", "result": "construct" }
    ]
  }
}
```

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Vanilla CSS |
| Data | Local JSON files |
| AI | n8n + OpenAI GPT-4o-mini |

---

## 📄 License

MIT
