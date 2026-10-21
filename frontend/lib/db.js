import { neon } from "@neondatabase/serverless";

/**
 * Creates a Neon serverless SQL query function.
 * Uses the DATABASE_URL environment variable for the connection string.
 * This connects directly to Neon PostgreSQL, bypassing Strapi,
 * specifically for pgvector operations on the recipe_embeddings table.
 */
function getDb() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL environment variable is not set. " +
        "Add your Neon PostgreSQL connection string to frontend/.env"
    );
  }

  return neon(databaseUrl);
}

/**
 * Execute a SQL query against the Neon database.
 * @param {string} query - SQL query string with $1, $2, etc. placeholders
 * @param {Array} params - Array of parameter values
 * @returns {Promise<Array>} Query results
 */
export async function sql(query, params = []) {
  const db = getDb();
  return db.query(query, params);
}

export default getDb;
