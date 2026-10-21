/**
 * Batch Embedding Script for ScrapChef
 *
 * Fetches all recipes from Strapi and generates vector embeddings
 * for each one, storing them in the recipe_embeddings table.
 *
 * Usage: node frontend/scripts/embed-all-recipes.mjs
 *
 * Prerequisites:
 * 1. Run setup-vectors.sql on your Neon dashboard first
 * 2. Ensure DATABASE_URL is set in frontend/.env
 * 3. Ensure STRAPI_API_TOKEN and GEMINI_API_KEY are set in frontend/.env
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// Load env vars from frontend/.env
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = resolve(__dirname, "..", ".env");

try {
  const envContent = readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim();
    if (!process.env[key]) {
      process.env[key] = value.replace(/^"/, "").replace(/"$/, "");
    }
  }
  console.log("✅ Loaded environment variables from .env");
} catch (err) {
  console.error("❌ Failed to load .env file:", err.message);
  console.error("   Make sure you run this from the project root.");
  process.exit(1);
}

// Dynamic imports after env vars are loaded
const { neon } = await import("@neondatabase/serverless");
const { GoogleGenerativeAI } = await import("@google/generative-ai");

// Config
const STRAPI_URL =
  process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const DATABASE_URL = process.env.DATABASE_URL;

if (!STRAPI_API_TOKEN) {
  console.error("❌ STRAPI_API_TOKEN not found in .env");
  process.exit(1);
}
if (!GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY not found in .env");
  process.exit(1);
}
if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL not found in .env");
  process.exit(1);
}

// Initialize clients
const sqlClient = neon(DATABASE_URL);
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

/**
 * Build text representation of a recipe for embedding
 */
function buildRecipeText(recipe) {
  const parts = [];
  if (recipe.title) parts.push(`Recipe: ${recipe.title}`);
  if (recipe.description) parts.push(`Description: ${recipe.description}`);
  if (recipe.cuisine) parts.push(`Cuisine: ${recipe.cuisine}`);
  if (recipe.category) parts.push(`Category: ${recipe.category}`);

  if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
    const ingredientNames = recipe.ingredients
      .map((ing) => ing.item || ing.name)
      .filter(Boolean)
      .join(", ");
    if (ingredientNames) parts.push(`Ingredients: ${ingredientNames}`);
  }

  if (recipe.instructions && Array.isArray(recipe.instructions)) {
    const steps = recipe.instructions
      .map((step) => step.instruction || step.text || "")
      .filter(Boolean)
      .join(" ");
    if (steps) parts.push(`Instructions: ${steps}`);
  }

  if (recipe.tips && Array.isArray(recipe.tips)) {
    const tips = recipe.tips.filter(Boolean).join(" ");
    if (tips) parts.push(`Tips: ${tips}`);
  }

  return parts.join("\n\n");
}

/**
 * Generate embedding using Gemini text-embedding-004
 */
async function generateEmbedding(text) {
  const model = genAI.getGenerativeModel({ model: "gemini-embedding-2" });
  const result = await model.embedContent(text);
  return result.embedding.values;
}

/**
 * Check if an embedding already exists for a recipe
 */
async function embeddingExists(recipeId) {
  try {
    const rows = await sqlClient.query(
      "SELECT id FROM recipe_embeddings WHERE recipe_id = $1",
      [recipeId]
    );
    return rows.length > 0;
  } catch (error) {
    // Table might not exist
    if (error.message?.includes("does not exist")) {
      console.error(
        "❌ recipe_embeddings table not found! Run setup-vectors.sql first."
      );
      process.exit(1);
    }
    throw error;
  }
}

/**
 * Store embedding in the database
 */
async function storeEmbedding(recipeId, title, content, embedding) {
  const embeddingStr = `[${embedding.join(",")}]`;
  await sqlClient.query(
    `INSERT INTO recipe_embeddings (recipe_id, recipe_title, content, embedding)
     VALUES ($1, $2, $3, $4::vector)
     ON CONFLICT (recipe_id)
     DO UPDATE SET
       recipe_title = EXCLUDED.recipe_title,
       content = EXCLUDED.content,
       embedding = EXCLUDED.embedding,
       updated_at = NOW()`,
    [recipeId, title, content, embeddingStr]
  );
}

/**
 * Fetch all recipes from Strapi with pagination
 */
async function fetchAllRecipes() {
  const allRecipes = [];
  let page = 1;
  const pageSize = 25;

  while (true) {
    const url = `${STRAPI_URL}/api/recipes?populate=*&pagination[page]=${page}&pagination[pageSize]=${pageSize}`;
    console.log(`  Fetching page ${page}...`);

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${STRAPI_API_TOKEN}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Strapi API error (page ${page}): ${errorText}`);
    }

    const data = await response.json();

    if (!data.data || data.data.length === 0) break;

    allRecipes.push(...data.data);

    // Check if there are more pages
    const pagination = data.meta?.pagination;
    if (!pagination || page >= pagination.pageCount) break;

    page++;
  }

  return allRecipes;
}

// Main execution
async function main() {
  console.log("\n🧑‍🍳 ScrapChef Batch Embedding Script");
  console.log("=".repeat(50));

  // Fetch all recipes
  console.log("\n📥 Fetching recipes from Strapi...");
  const recipes = await fetchAllRecipes();
  console.log(`   Found ${recipes.length} recipes total.\n`);

  if (recipes.length === 0) {
    console.log("No recipes found. Nothing to embed.");
    return;
  }

  let embedded = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < recipes.length; i++) {
    const recipe = recipes[i];
    const recipeId = recipe.id;
    const title = recipe.title || "Untitled";

    try {
      // Check if already embedded
      const exists = await embeddingExists(recipeId);
      if (exists) {
        skipped++;
        console.log(
          `  ⏭️  [${i + 1}/${recipes.length}] Skipping "${title}" (already embedded)`
        );
        continue;
      }

      // Build text and generate embedding
      const content = buildRecipeText(recipe);
      const embedding = await generateEmbedding(content);

      // Store in database
      await storeEmbedding(recipeId, title, content, embedding);

      embedded++;
      console.log(
        `  ✅ [${i + 1}/${recipes.length}] Embedded "${title}"`
      );

      // Small delay to avoid hitting Gemini rate limits
      if (i < recipes.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
    } catch (error) {
      failed++;
      console.error(
        `  ❌ [${i + 1}/${recipes.length}] Failed "${title}": ${error.message}`
      );
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log("📊 Embedding Summary:");
  console.log(`   ✅ Embedded: ${embedded}`);
  console.log(`   ⏭️  Skipped:  ${skipped}`);
  console.log(`   ❌ Failed:   ${failed}`);
  console.log(`   📋 Total:    ${recipes.length}`);
  console.log("=".repeat(50) + "\n");
}

main().catch((error) => {
  console.error("\n💥 Fatal error:", error);
  process.exit(1);
});
