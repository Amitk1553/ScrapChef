-- ScrapChef RAG: Vector Embeddings Setup
-- Run this SQL on your Neon PostgreSQL dashboard (SQL Editor)
-- This creates the pgvector extension and recipe_embeddings table

-- Step 1: Enable the pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Step 2: Create the recipe_embeddings table
-- Uses 3072 dimensions to match Gemini's gemini-embedding-2 output
CREATE TABLE IF NOT EXISTS recipe_embeddings (
  id SERIAL PRIMARY KEY,
  recipe_id INTEGER NOT NULL,
  recipe_title TEXT NOT NULL,
  content TEXT NOT NULL,
  embedding VECTOR(3072) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Step 3: Create a unique index on recipe_id for upsert operations
CREATE UNIQUE INDEX IF NOT EXISTS idx_recipe_embeddings_recipe_id
  ON recipe_embeddings (recipe_id);

-- Step 4: Create an IVFFlat index for fast cosine similarity search
-- NOTE: This index requires at least 1 row in the table to build.
-- If the table is empty, this will fail. Run it AFTER embedding at least one recipe.
-- You can also run it after running the batch embedding script.
--
-- For tables with < 1000 rows, use lists = number_of_rows / 10 (minimum 1)
-- For larger tables, use lists = sqrt(number_of_rows)
--
-- Uncomment and run AFTER you have data:
-- CREATE INDEX IF NOT EXISTS idx_recipe_embeddings_vector
--   ON recipe_embeddings USING ivfflat (embedding vector_cosine_ops)
--   WITH (lists = 10);

-- Alternatively, for small datasets you can use an exact search index (hnsw):
-- This works even on empty tables and is better for < 10,000 rows
CREATE INDEX IF NOT EXISTS idx_recipe_embeddings_hnsw
  ON recipe_embeddings USING hnsw (embedding vector_cosine_ops);
