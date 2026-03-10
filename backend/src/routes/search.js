// AI Semantic Search Routes
// Re-Route - Reverse Logistics SaaS Platform

import "dotenv/config";
import express from "express";

const router = express.Router();

// Configuration
const MAX_RETRIES = 3;
const INITIAL_DELAY_MS = 1000;

// Check if external services are configured
const isConfigured = () => {
  return {
    supabase: !!(process.env.SUPABASE_URL && process.env.SUPABASE_KEY),
    gemini: !!process.env.GEMINI_API_KEY,
  };
};

/**
 * Sleep function for retry delays
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Check if error is a rate limit (429) error
 */
const isRateLimitError = (error) => {
  return (
    error.status === 429 ||
    error.message?.includes("429") ||
    error.message?.includes("Too Many Requests") ||
    error.message?.includes("rate limit") ||
    error.message?.includes("quota")
  );
};

/**
 * Generate embedding with retry logic
 */
async function generateEmbeddingWithRetry(query, retries = MAX_RETRIES) {
  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const result = await Promise.race([
        model.embedContent(query),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Request timeout")), 30000),
        ),
      ]);
      return result.embedding.values;
    } catch (error) {
      console.error(`Embedding attempt ${attempt + 1} failed:`, error.message);

      if (isRateLimitError(error) && attempt < retries - 1) {
        const delay = INITIAL_DELAY_MS * Math.pow(2, attempt);
        console.log(`Rate limit detected. Retrying in ${delay}ms...`);
        await sleep(delay);
        continue;
      }
      throw error;
    }
  }
  throw new Error("Max retries exceeded for embedding generation");
}

// POST /api/search - Semantic search using AI
router.post("/", async (req, res) => {
  const config = isConfigured();

  // Check if services are configured
  if (!config.supabase || !config.gemini) {
    return res.status(503).json({
      success: false,
      message:
        "Search service is not configured. Please set SUPABASE_URL, SUPABASE_KEY, and GEMINI_API_KEY in .env file.",
      configured: config,
    });
  }

  const timeoutId = setTimeout(() => {
    if (!res.headersSent) {
      res.status(504).json({
        success: false,
        message: "Request timeout - taking too long to process",
      });
    }
  }, 60000);

  try {
    const { query } = req.body;

    if (!query) {
      clearTimeout(timeoutId);
      return res.status(400).json({
        success: false,
        message: "Query is required",
      });
    }

    if (typeof query !== "string" || query.trim().length === 0) {
      clearTimeout(timeoutId);
      return res.status(400).json({
        success: false,
        message: "Query must be a non-empty string",
      });
    }

    console.log(`[Search] Processing query: "${query}"`);

    // Import Supabase client
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY,
    );

    // Generate embedding
    let embeddingVector;
    try {
      embeddingVector = await generateEmbeddingWithRetry(query);
    } catch (embeddingError) {
      console.error("Embedding generation failed:", embeddingError.message);

      if (isRateLimitError(embeddingError)) {
        clearTimeout(timeoutId);
        return res.status(429).json({
          success: false,
          message: "Rate limit exceeded. Please try again later.",
          retryAfter: 60,
          error: "GEMINI_RATE_LIMIT",
        });
      }

      clearTimeout(timeoutId);
      return res.status(503).json({
        success: false,
        message: "Failed to generate embedding. Please try again.",
        error: embeddingError.message,
      });
    }

    // Perform semantic search
    const { data, error } = await supabase.rpc("match_my_apps_data", {
      query_embedding: embeddingVector,
      match_threshold: 0.4,
      match_count: 5,
    });

    if (error) {
      console.error("Supabase RPC error:", error);
      clearTimeout(timeoutId);
      return res.status(500).json({
        success: false,
        message: "Failed to perform semantic search",
        error: error.message,
      });
    }

    clearTimeout(timeoutId);
    res.json({
      success: true,
      query,
      results: data || [],
    });
  } catch (error) {
    console.error("Search error:", error);

    clearTimeout(timeoutId);
    const errorMessage =
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : error.message;

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: errorMessage,
    });
  }
});

// GET /api/search/health - Health check for search service
router.get("/health", (req, res) => {
  const config = isConfigured();
  res.json({
    status: "ok",
    service: "Search API",
    gemini: config.gemini ? "configured" : "missing",
    supabase: config.supabase ? "configured" : "missing",
  });
});

export default router;
