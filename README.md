# ScrapChef 🧑‍🍳

A full-stack, AI-powered recipe discovery, meal planning, and interactive cooking assistant platform. ScrapChef enables users to find recipes based on ingredients they already have, manage a digital pantry, save collections, and chat in real-time with an **AI Chef** powered by **RAG (Retrieval-Augmented Generation)**, **Neon pgvector**, and **Google Gemini**.

**Live Demo:** [https://scrap-chef.vercel.app](https://scrap-chef.vercel.app)

---

## ✨ Key Features

- **🧑‍🍳 RAG-Powered AI Chef Assistant:**
  - Real-time streaming conversational assistant on every recipe page.
  - Understands the active recipe's ingredients, step-by-step instructions, and chef tips.
  - Accesses user's saved recipe collection and pantry ingredients for personalized suggestions.
  - Semantic similarity search powered by **Neon PostgreSQL pgvector** (3072 dimensions) to recommend relevant cooking techniques and related dishes.
- **🔍 Smart Recipe Discovery & Generation:**
  - Generate new recipes on-demand with Gemini AI based on ingredients or dish names.
  - Automatically fetches high-resolution food photography via Unsplash.
  - Auto-embeds generated and saved recipes directly into the vector database.
- **🧊 Digital Pantry Management:**
  - Track and organize your refrigerator and pantry items.
  - Use pantry ingredients to generate recipes with minimal food waste.
- **📚 Digital Cookbook & PDF Export:**
  - Save and organize favorite recipes with one-click bookmarking.
  - Export beautifully formatted, printable PDF recipe cards (`@react-pdf/renderer`).
- **🛡️ Enterprise Security & Rate Limiting:**
  - Protected with **Arcjet**: Bot protection, WAF shield, and token-bucket chat rate limiting (tiered for Free and Pro users).
- **🔐 Secure Authentication & User Tiers:**
  - Seamless authentication and session management via **Clerk**.
  - Pro Chef tier support with subscription gating and pricing modal.

---

## 🛠 Tech Stack

### Frontend & AI
- **Framework:** Next.js 16 (App Router with Turbopack)
- **UI Library:** React 19, Tailwind CSS 4, Radix UI, Shadcn/ui, Lucide Icons
- **AI SDK:** Vercel AI SDK (`ai` v7, `@ai-sdk/react`, `@ai-sdk/google`)
- **AI Models:**
  - Chat & Generation: `gemini-2.5-flash-lite` (Google Gemini)
  - Vector Embeddings: `gemini-embedding-2` (3072 dimensions)
- **Document Export:** `@react-pdf/renderer`

### Backend & Database
- **CMS / Backend:** Strapi v5 (Headless CMS, hosted on Render)
- **Vector Database:** Neon PostgreSQL Serverless (`@neondatabase/serverless`) with `pgvector`
- **Authentication:** Clerk (`@clerk/nextjs`)
- **Security & Limiting:** Arcjet (`@arcjet/next`)
- **Image Assets:** Unsplash API

---

## 🏗️ Architecture & RAG Pipeline

```
┌────────────────────────────────────────────────────────┐
│                   Next.js Frontend                     │
│  - Recipe Page (/recipe)                                │
│  - Floating AI Chef Chat Component (useChat)           │
└──────────────────────────┬─────────────────────────────┘
                           │ POST /api/chat
                           ▼
┌────────────────────────────────────────────────────────┐
│                  App Route: /api/chat                  │
│  1. Clerk Session Authentication                       │
│  2. Arcjet Rate Limiting (Token Bucket: Free vs Pro)   │
└──────────────────────────┬─────────────────────────────┘
                           │ RAG Retrieval Pipeline (retrieveContext)
            ┌──────────────┴──────────────┐
            ▼                             ▼
┌─────────────────────────┐   ┌──────────────────────────┐
│     Neon PostgreSQL     │   │   Strapi Headless CMS    │
│  (recipe_embeddings)    │   │  - User's Pantry Items   │
│  - Cosine Distance <=>  │   │  - User's Saved Recipes  │
│  - 3072-dim Vectors     │   │  - Active Recipe Data    │
└─────────────────────────┘   └──────────────────────────┘
            │                             │
            └──────────────┬──────────────┘
                           ▼
┌────────────────────────────────────────────────────────┐
│           Augmented System Prompt Builder              │
│  - Active Recipe details, tips, & instructions         │
│  - User's Saved Recipes count & titles                 │
│  - User's Pantry items for substitutions               │
│  - Top semantically similar recipes                    │
└──────────────────────────┬─────────────────────────────┘
                           │ streamText({ model: 'gemini-2.5-flash-lite' })
                           ▼
┌────────────────────────────────────────────────────────┐
│             Real-Time Streaming Response               │
│      (toUIMessageStreamResponse / Data Stream)         │
└────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### 1. Clone Repository & Install Dependencies

```bash
git clone https://github.com/Amitk1553/ScrapChef.git
cd ScrapChef

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies (if running local Strapi)
cd ../backend
npm install
```

---

### 2. Environment Variables

Create `frontend/.env` (or `.env.local`) in the `frontend/` directory:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Google Gemini API
GEMINI_API_KEY=AIzaSy...

# Arcjet Security & Rate Limiting
ARCJET_KEY=ajkey_...

# Strapi CMS
NEXT_PUBLIC_STRAPI_URL=https://scrapchef.onrender.com
STRAPI_API_TOKEN=your_strapi_api_token

# Unsplash Images
UNSPLASH_ACCESS_KEY=your_unsplash_access_key

# Neon PostgreSQL (Vector Database for RAG)
DATABASE_URL="postgresql://neondb_owner:password@ep-...neon.tech/neondb?sslmode=require"
```

---

### 3. Setup Neon pgvector (RAG Database)

1. Open your **Neon Console** -> **SQL Editor** on your PostgreSQL project.
2. Run the migration script located at [`frontend/scripts/setup-vectors.sql`](frontend/scripts/setup-vectors.sql):

```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS recipe_embeddings (
    id SERIAL PRIMARY KEY,
    recipe_id INTEGER UNIQUE NOT NULL,
    recipe_title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    embedding VECTOR(3072) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS recipe_embeddings_hnsw_idx
    ON recipe_embeddings
    USING hnsw (embedding vector_cosine_ops);
```

3. Run the batch embedding script to populate embeddings for all existing recipes:

```bash
cd frontend
node scripts/embed-all-recipes.mjs
```

---

### 4. Run Locally

Start the development server:

```bash
cd frontend
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to start cooking with ScrapChef!

---

## 📜 Key Project Structure

```
ScrapChef/
├── frontend/
│   ├── actions/                  # Next.js Server Actions
│   │   ├── recipe.actions.js     # Recipe generation, saving, & auto-embedding
│   │   └── pantry.actions.js     # Pantry CRUD operations
│   ├── app/
│   │   ├── (main)/
│   │   │   ├── recipe/           # Interactive Recipe view with AI Chef
│   │   │   ├── recipes/          # My Saved Recipes cookbook collection
│   │   │   └── pantry/           # Digital Pantry management
│   │   ├── api/
│   │   │   └── chat/route.js     # Streaming AI Chef RAG API route
│   │   └── layout.js             # Root layout with Clerk & theme providers
│   ├── components/
│   │   ├── AiChefChat.jsx        # Floating RAG chat panel component
│   │   ├── Header.jsx            # Responsive navigation & user profile
│   │   ├── PricingModal.jsx      # Pro Chef upgrade modal
│   │   └── RecipePDF.jsx         # Printable PDF recipe template
│   ├── lib/
│   │   ├── arcjet.js             # Arcjet WAF & Token Bucket rules
│   │   ├── checkUser.js          # Resilient Clerk-Strapi user sync
│   │   ├── db.js                 # Neon serverless database client
│   │   ├── embeddings.js         # Gemini 3072-dim vector generation
│   │   └── rag.js                # RAG retrieval & system prompt augmentation
│   └── scripts/
│       ├── setup-vectors.sql     # Neon pgvector table & HNSW index schema
│       └── embed-all-recipes.mjs # Batch recipe vectorization CLI script
└── backend/                      # Strapi Headless CMS (Render)
```

---

## 📄 License

This project is licensed under the MIT License.