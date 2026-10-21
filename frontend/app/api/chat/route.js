import { streamText, convertToModelMessages } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { auth } from "@clerk/nextjs/server";
import { checkUser } from "@/lib/checkUser";
import { retrieveContext, buildSystemPrompt } from "@/lib/rag";
import { freeChatMessages, proTierLimit } from "@/lib/arcjet";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export async function POST(req) {
  try {
    // 1. Authenticate user
    const { userId: clerkUserId, has } = await auth();
    if (!clerkUserId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get user info from Strapi if available (for user ID and subscription tier)
    let user = null;
    try {
      user = await checkUser();
    } catch (userErr) {
      console.warn("⚠️ checkUser error in chat route:", userErr?.message || userErr);
    }

    // Direct Strapi fallback if checkUser() had Clerk network/auth issues
    if (!user && clerkUserId) {
      try {
        const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || "https://scrapchef.onrender.com";
        const strapiRes = await fetch(
          `${strapiUrl}/api/users?filters[clerkId][$eq]=${clerkUserId}`,
          {
            headers: {
              Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
            },
            cache: "no-store",
          }
        );
        if (strapiRes.ok) {
          const strapiUsers = await strapiRes.json();
          if (Array.isArray(strapiUsers) && strapiUsers.length > 0) {
            user = strapiUsers[0];
          }
        }
      } catch (err) {
        console.warn("⚠️ Direct Strapi user lookup fallback failed:", err?.message || err);
      }
    }

    // 2. Apply Arcjet rate limiting
    const isPro =
      (has && typeof has === "function" && has({ plan: "pro" })) ||
      user?.subscriptionTier === "pro" ||
      false;
    const arcjetClient = isPro ? proTierLimit : freeChatMessages;
    const decision = await arcjetClient.protect(req, {
      userId: clerkUserId,
      requested: 1,
    });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        return new Response(
          JSON.stringify({
            error: `Daily chat limit reached. ${
              isPro
                ? "Please try again tomorrow."
                : "Upgrade to Pro for more messages!"
            }`,
          }),
          {
            status: 429,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
      return new Response(JSON.stringify({ error: "Request denied" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 3. Parse request body
    const { messages, recipeContext } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Messages array is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 4. Get the last user message for RAG retrieval
    const lastUserMessage = [...messages]
      .reverse()
      .find((m) => m.role === "user");
    const userQuery =
      lastUserMessage?.content ||
      lastUserMessage?.parts
        ?.filter((p) => p.type === "text")
        ?.map((p) => p.text)
        ?.join("") ||
      "";

    // 5. Run RAG retrieval pipeline
    const context = await retrieveContext(
      userQuery,
      recipeContext || null,
      user?.id || null
    );

    // 6. Build augmented system prompt
    const systemPrompt = buildSystemPrompt(context);

    // 7. Convert UIMessages to ModelMessages for streamText
    const normalizedMessages = messages.map((m) => {
      if (!m.parts && m.content) {
        return {
          ...m,
          parts: [{ type: "text", text: m.content }],
        };
      }
      return m;
    });
    const modelMessages = await convertToModelMessages(normalizedMessages);

    // 8. Stream response using Vercel AI SDK + Gemini
    const result = streamText({
      model: google("gemini-2.5-flash-lite"),
      system: systemPrompt,
      messages: modelMessages,
      maxTokens: 1024,
      temperature: 0.7,
    });

    // 9. Return streaming response
    if (typeof result.toUIMessageStreamResponse === "function") {
      return result.toUIMessageStreamResponse();
    }
    return result.toDataStreamResponse();
  } catch (error) {
    console.error("❌ Chat API error:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Failed to generate AI response",
        details: "Something went wrong in the API route.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
