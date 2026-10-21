import { GoogleGenerativeAI } from "@google/generative-ai";
import { sql } from "@/lib/db";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

/**
 * Generate a 3072-dimensional embedding vector for text using Gemini's gemini-embedding-2 model.
 * @param {string} text - The text to embed
 * @returns {Promise<number[]>} A 3072-dimensional vector
 */
export async function generateEmbedding(text) {
  const model = genAI.getGenerativeModel({ model: "gemini-embedding-2" });
  const result = await model.embedContent(text);
  return result.embedding.values;
}

/**
 * Build a single text string from a recipe object for embedding.
 * Combines all meaningful textual content: title, description, ingredients,
 * instructions, cuisine, category, and tips.
 * @param {Object} recipe - The recipe object from Strapi
 * @returns {string} Concatenated text representation
 */
export function buildRecipeText(recipe) {
  const parts = [];

  // Title and description
  if (recipe.title) parts.push(`Recipe: ${recipe.title}`);
  if (recipe.description) parts.push(`Description: ${recipe.description}`);

  // Cuisine and category
  if (recipe.cuisine) parts.push(`Cuisine: ${recipe.cuisine}`);
  if (recipe.category) parts.push(`Category: ${recipe.category}`);

  // Ingredients
  if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
    const ingredientNames = recipe.ingredients
      .map((ing) => ing.item || ing.name)
      .filter(Boolean)
      .join(", ");
    if (ingredientNames) parts.push(`Ingredients: ${ingredientNames}`);
  }

  // Instructions
  if (recipe.instructions && Array.isArray(recipe.instructions)) {
    const steps = recipe.instructions
      .map((step) => {
        const text = step.instruction || step.text || "";
        const title = step.title ? `${step.title}: ` : "";
        const tip = step.tip ? ` (Tip: ${step.tip})` : "";
        return `${title}${text}${tip}`.trim();
      })
      .filter(Boolean)
      .join(" ");
    if (steps) parts.push(`Instructions: ${steps}`);
  }

  // Tips
  if (recipe.tips && Array.isArray(recipe.tips)) {
    const tips = recipe.tips.filter(Boolean).join(" ");
    if (tips) parts.push(`Tips: ${tips}`);
  }

  return parts.join("\n\n");
}

/**
 * Store a recipe embedding in the recipe_embeddings table.
 * Uses INSERT ... ON CONFLICT for upsert behavior.
 * @param {number} recipeId - The Strapi recipe ID
 * @param {string} title - The recipe title
 * @param {string} content - The full text content that was embedded
 * @param {number[]} embedding - The 768-dimensional vector
 */
export async function storeRecipeEmbedding(
  recipeId,
  title,
  content,
  embedding
) {
  const embeddingStr = `[${embedding.join(",")}]`;

  await sql(
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
 * Full embedding pipeline for a single recipe:
 * 1. Build text from recipe object
 * 2. Generate embedding via Gemini
 * 3. Store in database
 * @param {Object} recipe - The recipe object (must have id, title, and other fields)
 */
export async function embedRecipe(recipe) {
  const recipeId = recipe.id || recipe.documentId;
  const content = buildRecipeText(recipe);
  const embedding = await generateEmbedding(content);
  await storeRecipeEmbedding(recipeId, recipe.title, content, embedding);
  console.log(`✅ Embedded recipe: "${recipe.title}" (ID: ${recipeId})`);
}
