"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useChat } from "@ai-sdk/react";
import { Button } from "@/components/ui/button";
import {
  MessageCircle,
  Send,
  X,
  ChefHat,
  Loader2,
  AlertCircle,
  Sparkles,
  ArrowDown,
} from "lucide-react";

export default function AiChefChat({ recipeContext }) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [showScrollDown, setShowScrollDown] = useState(false);

  const recipeName = recipeContext?.title || "this recipe";

  const [input, setInput] = useState("");
  
  const recipeId = recipeContext?.id || recipeContext?.documentId || recipeContext?.title;
  const welcomeText = `Hi! I'm your AI chef for **${recipeName}** 🧑‍🍳\n\nAsk me anything about cooking this dish — substitutions, techniques, timing, or troubleshooting!`;

  const {
    messages,
    error,
    sendMessage,
    regenerate,
    status,
  } = useChat({
    id: `recipe-chat-${recipeId || "default"}`,
    api: "/api/chat",
    body: { recipeContext },
    initialMessages: [
      {
        id: "welcome",
        role: "assistant",
        content: welcomeText,
        parts: [
          {
            type: "text",
            text: welcomeText,
          },
        ],
      },
    ],
    onError: (err) => {
      console.error("Chat error:", err);
    },
  });

  const isLoading = status === "submitted" || status === "streaming";

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Track scroll position to show/hide scroll-down indicator
  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const { scrollTop, scrollHeight, clientHeight } = container;
    setShowScrollDown(scrollHeight - scrollTop - clientHeight > 100);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Handle quick action button clicks
  const handleQuickAction = (text) => {
    setHasInteracted(true);
    sendMessage({ text }, { body: { recipeContext } });
  };

  // Count user messages (excluding welcome)
  const userMessageCount = messages.filter((m) => m.role === "user").length;

  const quickActions = [
    { label: "🔄 Substitutions?", text: "What substitutions can I make for this recipe?" },
    { label: "🥗 Make it healthier?", text: "How can I make this recipe healthier?" },
    { label: "🍽️ Serving tips?", text: "What are some good serving tips for this dish?" },
  ];

  return (
    <>
      {/* Toggle Button — Fixed Bottom Right */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setHasInteracted(true);
        }}
        className={`fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 ${
          isOpen
            ? "bg-stone-800 hover:bg-stone-900"
            : "bg-burntOrange-600 hover:bg-burntOrange-700"
        }`}
        aria-label={isOpen ? "Close AI Chef Chat" : "Open AI Chef Chat"}
        id="ai-chef-toggle"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <>
            <MessageCircle className="w-6 h-6 text-white" />
            {/* Message count badge */}
            {userMessageCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-stone-900 text-white text-xs flex items-center justify-center rounded-full font-bold">
                {userMessageCount > 9 ? "9+" : userMessageCount}
              </span>
            )}
          </>
        )}
      </button>

      {/* Chat Panel */}
      <div
        className={`fixed z-40 transition-all duration-300 ease-in-out ${
          isOpen
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-4 pointer-events-none"
        } 
        /* Mobile: full-width bottom sheet */
        bottom-0 left-0 right-0 h-[75vh]
        /* Desktop: side panel */
        md:bottom-6 md:right-24 md:left-auto md:w-[400px] md:h-[600px] md:rounded-2xl
        bg-white border-2 border-stone-200 shadow-2xl flex flex-col overflow-hidden
        md:max-h-[calc(100vh-6rem)]
        `}
        role="dialog"
        aria-label="AI Chef Chat"
        id="ai-chef-panel"
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-burntOrange-600 to-burntOrange-500 text-white shrink-0">
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
            <ChefHat className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm leading-tight">AI Chef</h3>
            <p className="text-xs text-white/80 truncate">
              Cooking assistant for {recipeName}
            </p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors md:hidden"
            aria-label="Close chat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages Container */}
        <div
          ref={messagesContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-stone-50 scroll-smooth"
          id="chat-messages"
        >
          {messages.map((message) => (
            <ChatBubble key={message.id} message={message} />
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-full bg-burntOrange-100 flex items-center justify-center shrink-0">
                <ChefHat className="w-3.5 h-3.5 text-burntOrange-600" />
              </div>
              <div className="bg-white border border-stone-200 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%]">
                <div className="flex items-center gap-2 text-stone-500 text-sm">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Cooking up a response...</span>
                </div>
              </div>
            </div>
          )}

          {/* Error display */}
          {error && (
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <AlertCircle className="w-3.5 h-3.5 text-red-600" />
              </div>
              <div className="bg-red-50 border border-red-200 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%]">
                <p className="text-sm text-red-700">
                  {error.message?.includes("limit")
                    ? error.message
                    : "Something went wrong. Please try again."}
                </p>
                <button
                  onClick={() => regenerate({ body: { recipeContext } })}
                  className="text-xs text-red-600 font-medium mt-1 hover:underline"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Scroll to bottom indicator */}
        {showScrollDown && (
          <button
            onClick={scrollToBottom}
            className="absolute bottom-32 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white border border-stone-200 shadow-md flex items-center justify-center hover:bg-stone-50 transition-colors z-10"
            aria-label="Scroll to bottom"
          >
            <ArrowDown className="w-4 h-4 text-stone-600" />
          </button>
        )}

        {/* Quick Actions — Only show before first user message */}
        {userMessageCount === 0 && !isLoading && (
          <div className="px-4 py-2 border-t border-stone-100 bg-white shrink-0">
            <div className="flex items-center gap-1.5 mb-2">
              <Sparkles className="w-3 h-3 text-burntOrange-500" />
              <span className="text-xs font-medium text-stone-500">
                Quick questions
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => handleQuickAction(action.text)}
                  className="text-xs px-3 py-1.5 rounded-full bg-stone-100 text-stone-700 hover:bg-burntOrange-50 hover:text-burntOrange-700 border border-stone-200 hover:border-burntOrange-200 transition-colors"
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Bar */}
        <form
          id="chat-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (!input?.trim() || isLoading) return;
            setHasInteracted(true);
            sendMessage({ text: input }, { body: { recipeContext } });
            setInput("");
          }}
          className="flex items-center gap-2 px-4 py-3 border-t-2 border-stone-200 bg-white shrink-0"
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about this recipe..."
            className="flex-1 text-sm bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 outline-none focus:border-burntOrange-400 focus:ring-2 focus:ring-burntOrange-100 transition-all placeholder:text-stone-400"
            disabled={isLoading}
            id="chat-input"
          />
          <Button
            type="submit"
            disabled={!input?.trim() || isLoading}
            size="icon"
            className="bg-burntOrange-600 hover:bg-burntOrange-700 text-white rounded-xl w-10 h-10 shrink-0 disabled:opacity-40"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </form>
      </div>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}

/**
 * Extract text from message regardless of whether it has .content or .parts
 */
function getMessageText(message) {
  if (typeof message?.content === "string") return message.content;
  if (Array.isArray(message?.parts)) {
    return message.parts
      .filter((p) => p.type === "text")
      .map((p) => p.text)
      .join("");
  }
  return "";
}

/**
 * Individual chat message bubble.
 * AI messages: left-aligned with chef avatar
 * User messages: right-aligned, accent colored
 */
function ChatBubble({ message }) {
  const isUser = message.role === "user";
  const content = getMessageText(message);

  return (
    <div
      className={`flex items-start gap-2.5 ${
        isUser ? "flex-row-reverse" : ""
      }`}
    >
      {/* Avatar */}
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-burntOrange-100 flex items-center justify-center shrink-0">
          <ChefHat className="w-3.5 h-3.5 text-burntOrange-600" />
        </div>
      )}

      {/* Message Bubble */}
      <div
        className={`max-w-[85%] px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? "bg-burntOrange-600 text-white rounded-2xl rounded-tr-sm"
            : "bg-white border border-stone-200 text-stone-800 rounded-2xl rounded-tl-sm"
        }`}
      >
        <MessageContent content={content} isUser={isUser} />
      </div>
    </div>
  );
}

/**
 * Render message content with basic markdown formatting.
 * Supports: **bold**, bullet points (• or -), and line breaks.
 */
function MessageContent({ content, isUser }) {
  if (!content) return null;

  // Split into paragraphs
  const paragraphs = content.split("\n\n");

  return (
    <div className="space-y-2">
      {paragraphs.map((paragraph, pIdx) => {
        const lines = paragraph.split("\n");

        return (
          <div key={pIdx}>
            {lines.map((line, lIdx) => {
              const trimmed = line.trim();

              // Bullet point lines
              if (
                trimmed.startsWith("• ") ||
                trimmed.startsWith("- ") ||
                trimmed.startsWith("* ")
              ) {
                const bulletContent = trimmed.slice(2);
                return (
                  <div
                    key={lIdx}
                    className={`flex items-start gap-2 ${lIdx > 0 ? "mt-1" : ""}`}
                  >
                    <span className="shrink-0 mt-0.5">•</span>
                    <span>{renderInlineFormatting(bulletContent, isUser)}</span>
                  </div>
                );
              }

              // Regular lines
              if (!trimmed) return <br key={lIdx} />;

              return (
                <p key={lIdx} className={lIdx > 0 ? "mt-1" : ""}>
                  {renderInlineFormatting(trimmed, isUser)}
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

/**
 * Render inline formatting (**bold**)
 */
function renderInlineFormatting(text, isUser) {
  // Split by **bold** patterns
  const parts = text.split(/(\*\*[^*]+\*\*)/g);

  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong
          key={i}
          className={isUser ? "font-bold" : "font-bold text-stone-900"}
        >
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}
