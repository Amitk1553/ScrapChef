import { generateEmbedding, buildRecipeText } from "@/lib/embeddings";
import { sql } from "@/lib/db";

const STRAPI_URL =
  process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;

/**
 * Search for similar recipes using pgvector cosine similarity.
 * Falls back gracefully if the recipe_embeddings table doesn't exist yet.
 * @param {number[]} queryEmbedding - The 768-dimensional query vector
 * @param {number} limit - Maximum number of results to return
 * @returns {Promise<Array<{recipe_id: number, recipe_title: string, content: string, similarity: number}>>}
 */
export async function searchSimilarRecipes(queryEmbedding, limit = 5) {
  try {
    const embeddingStr = `[${queryEmbedding.join(",")}]`;

    const results = await sql(
      `SELECT recipe_id, recipe_title, content,
              1 - (embedding <=> $1::vector) AS similarity
       FROM recipe_embeddings
       ORDER BY embedding <=> $1::vector
       LIMIT $2`,
      [embeddingStr, limit]
    );

    return results;
  } catch (error) {
    // Handle case where table doesn't exist yet
    if (
      error.message?.includes("does not exist") ||
      error.message?.includes("recipe_embeddings")
    ) {
      console.warn(
        "⚠️ recipe_embeddings table not found. Run setup-vectors.sql on your Neon dashboard first."
      );
      return [];
    }
    console.error("Error searching similar recipes:", error);
    return [];
  }
}

/**
 * Fetch user's pantry items from Strapi.
 * @param {number} userId - The Strapi user ID
 * @returns {Promise<string[]>} Array of pantry item names
 */
async function fetchPantryItems(userId) {
  try {
    const response = await fetch(
      `${STRAPI_URL}/api/pantry-items?filters[owner][id][$eq]=${userId}`,
      {
        headers: {
          Authorization: `Bearer ${STRAPI_API_TOKEN}`,
        },
        cache: "no-store",
      }
    );

    if (!response.ok) return [];

    const data = await response.json();
    return (data.data || []).map((item) => item.name).filter(Boolean);
  } catch (error) {
    console.error("Error fetching pantry items:", error);
    return [];
  }
}

/**
 * Fetch user's saved recipes collection from Strapi.
 * @param {number} userId - The Strapi user ID
 * @returns {Promise<Array<{id: number, title: string, cuisine?: string, category?: string}>>}
 */
async function fetchSavedRecipes(userId) {
  try {
    const response = await fetch(
      `${STRAPI_URL}/api/saved-recipes?filters[user][id][$eq]=${userId}&populate[recipe][populate]=*&sort=savedAt:desc`,
      {
        headers: {
          Authorization: `Bearer ${STRAPI_API_TOKEN}`,
        },
        cache: "no-store",
      }
    );

    if (!response.ok) return [];

    const data = await response.json();
    return (data.data || [])
      .map((item) => item.recipe)
      .filter(Boolean);
  } catch (error) {
    console.error("Error fetching saved recipes:", error);
    return [];
  }
}

/**
 * Full RAG retrieval pipeline:
 * 1. Generates embedding of the user's question
 * 2. Searches for similar recipes via pgvector
 * 3. Fetches user's pantry items and saved recipes (if userId provided)
 * 4. Returns structured context for prompt augmentation
 *
 * @param {string} userQuery - The user's chat message
 * @param {Object|null} currentRecipe - The recipe the user is currently viewing
 * @param {number|null} userId - Strapi user ID for pantry and saved recipes lookup
 * @returns {Promise<{currentRecipe: Object|null, similarRecipes: Array, pantryItems: string[], savedRecipes: Array}>}
 */
export async function retrieveContext(userQuery, currentRecipe, userId) {
  // Generate embedding for the user's query
  let similarRecipes = [];
  try {
    const queryEmbedding = await generateEmbedding(userQuery);
    similarRecipes = await searchSimilarRecipes(queryEmbedding, 5);

    // Filter out the current recipe from similar results to avoid redundancy
    const curId = currentRecipe?.id || currentRecipe?.recipe_id;
    const curTitle = currentRecipe?.title?.toLowerCase().trim();
    if (curId || curTitle) {
      similarRecipes = similarRecipes.filter((r) => {
        if (curId && r.recipe_id === curId) return false;
        if (curTitle && r.recipe_title?.toLowerCase().trim() === curTitle) return false;
        return true;
      });
    }
  } catch (error) {
    console.error("Error in RAG retrieval:", error);
    // Continue without similar recipes — the chat still works with just currentRecipe
  }

  // Fetch pantry items and saved recipes in parallel
  let pantryItems = [];
  let savedRecipes = [];
  if (userId) {
    const [pantry, saved] = await Promise.all([
      fetchPantryItems(userId),
      fetchSavedRecipes(userId),
    ]);
    pantryItems = pantry;
    savedRecipes = saved;
  }

  return {
    currentRecipe,
    similarRecipes,
    pantryItems,
    savedRecipes,
  };
}

/**
 * Build the augmented system prompt with all retrieved context.
 * This is the core of RAG — injecting relevant data into the LLM prompt.
 * @param {Object} context - The context object from retrieveContext()
 * @returns {string} The complete system prompt
 */
export function buildSystemPrompt(context) {
  const parts = [];

  parts.push(`You are ScrapChef's AI Chef assistant 🧑‍🍳 — a friendly, knowledgeable cooking expert.

RULES:
- When the user asks about "this recipe", "this dish", substitutions, techniques, timing, serving tips, or cooking troubleshooting, they are asking about the CURRENT RECIPE provided below. Always focus your answer on the CURRENT RECIPE.
- When the user asks how many recipes are in their saved recipes collection or asks to list them down, look at the USER'S SAVED RECIPES list below. State the exact count and list them.
- When the user asks about their pantry ingredients, look at the USER'S PANTRY ITEMS below.
- Base your answers on the provided recipe data. If the user asks for tips, side dishes, serving presentations, beverage pairings, or variations that are not explicitly detailed in the recipe, provide expert culinary recommendations that best complement this dish.
- Do NOT contradict the provided ingredients, steps, or cooking facts.
- Stay on cooking-related topics. If asked about non-cooking topics, politely redirect.
- Be concise and helpful. Use emojis sparingly (max 1-2 per message).
- Format lists with bullet points (•). Use **bold** for emphasis.
- When referencing similar recipes, mention them by name as sources.`);

  // Current recipe context
  if (context.currentRecipe) {
    const recipe = context.currentRecipe;
    const recipeText = buildRecipeText(recipe);
    parts.push(`\n--- CURRENT RECIPE (the user is viewing this recipe: "${recipe.title || "Untitled"}") ---\n${recipeText}`);

    // Include substitutions if available
    if (recipe.substitutions && recipe.substitutions.length > 0) {
      const subs = recipe.substitutions
        .map(
          (s) => `• ${s.original} → ${s.alternatives?.join(", ") || "N/A"}`
        )
        .join("\n");
      parts.push(`\nKnown substitutions:\n${subs}`);
    }

    // Include nutrition if available
    if (recipe.nutrition) {
      parts.push(
        `\nNutrition (per serving): ${recipe.nutrition.calories} cal, ${recipe.nutrition.protein}g protein, ${recipe.nutrition.carbs}g carbs, ${recipe.nutrition.fat}g fat`
      );
    }
  }

  // User's saved recipes collection
  if (context.savedRecipes && context.savedRecipes.length > 0) {
    const savedList = context.savedRecipes
      .map(
        (r, i) =>
          `• ${r.title || "Untitled"}${r.cuisine ? ` (${r.cuisine})` : ""}${r.category ? ` - ${r.category}` : ""}`
      )
      .join("\n");
    parts.push(
      `\n--- USER'S SAVED RECIPES (${context.savedRecipes.length} recipes total in their saved collection) ---\n${savedList}\nWhen the user asks about how many recipes they have saved or asks to list them, use this list of ${context.savedRecipes.length} recipes.`
    );
  } else if (context.savedRecipes !== undefined && context.savedRecipes.length === 0) {
    parts.push(
      `\n--- USER'S SAVED RECIPES ---\nThe user currently has 0 saved recipes in their collection.`
    );
  }

  // Similar recipes from vector search
  if (context.similarRecipes && context.similarRecipes.length > 0) {
    const similarText = context.similarRecipes
      .map(
        (r, i) =>
          `${i + 1}. ${r.recipe_title} (similarity: ${(
            r.similarity * 100
          ).toFixed(0)}%)\n${r.content.substring(0, 500)}`
      )
      .join("\n\n");
    parts.push(
      `\n--- SIMILAR RECIPES (for additional culinary suggestions) ---\n${similarText}`
    );
  }

  // User's pantry items
  if (context.pantryItems && context.pantryItems.length > 0) {
    parts.push(
      `\n--- USER'S PANTRY ITEMS ---\nThe user has these ingredients available: ${context.pantryItems.join(
        ", "
      )}\nWhen suggesting substitutions, prioritize ingredients the user already has.`
    );
  }

  return parts.join("\n");
}
