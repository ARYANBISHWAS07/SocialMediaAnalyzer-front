"use client";

import { FormEvent, useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HeartPulse, Lightbulb, LoaderCircle, MessageCircle, Send, Sparkles, Target, TrendingUp, User } from "@/components/ui/icons";
import { sendChatMessage } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { Analysis, ChatMessage } from "@/types/analysis";

const starterQuestions = [
  {
    label: "Diagnose engagement",
    detail: "Find what is holding response back.",
    question: "Why is my engagement score low?",
    icon: HeartPulse
  },
  {
    label: "Improve the post",
    detail: "Get the highest-impact edits first.",
    question: "How can I improve this post?",
    icon: Lightbulb
  },
  {
    label: "Rewrite for reach",
    detail: "Make the caption sharper and more clickable.",
    question: "Rewrite this post to get more engagement.",
    icon: TrendingUp
  },
  {
    label: "Hashtag set",
    detail: "Generate discovery tags for this content.",
    question: "Give me better hashtags.",
    icon: Target
  },
  {
    label: "Read the tone",
    detail: "Understand sentiment and audience feel.",
    question: "What is the sentiment of this post?",
    icon: MessageCircle
  }
];

interface ChatPanelProps {
  extractedText: string;
  analysis: Analysis;
  className?: string;
  compact?: boolean;
}

export function ChatPanel({ extractedText, analysis, className, compact = false }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [question, setQuestion] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await sendQuestion(question);
  }

  async function sendQuestion(nextQuestion: string) {
    const trimmedQuestion = nextQuestion.trim();

    if (!trimmedQuestion || isSending) {
      return;
    }

    const userMessage: ChatMessage = { role: "user", content: trimmedQuestion };
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setQuestion("");
    setError(null);
    setIsSending(true);

    try {
      const response = await sendChatMessage({
        extracted_text: extractedText,
        analysis,
        question: trimmedQuestion,
        messages: messages.slice(-8)
      });

      setMessages((currentMessages) => [
        ...currentMessages,
        { role: "assistant", content: response.answer || "I could not generate an answer for that question." }
      ]);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Chat failed. Please try again.");
      setMessages(messages);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <Card
      className={cn(
        "flex min-h-[520px] flex-col rounded-2xl border-0 bg-[#0F1014] shadow-none ring-1 ring-inset ring-white/[0.05]",
        compact ? "min-h-0 rounded-none bg-transparent ring-0" : "",
        className
      )}
    >
      {!compact ? (
        <CardHeader className="space-y-0 p-5 pb-3">
          <div className="min-w-0">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-600">Conversation</p>
            <CardTitle className="mt-1 text-xl tracking-tight">Content analyst</CardTitle>
            <p className="mt-2 text-sm text-zinc-500">Ask questions about this analyzed post.</p>
          </div>
        </CardHeader>
      ) : null}

      <CardContent className={cn("flex min-h-0 flex-1 flex-col gap-4 p-5 pt-0", compact ? "p-0" : "")}>
        {compact ? (
          <div className="flex shrink-0 items-center justify-between gap-3 rounded-2xl bg-[#15161B] px-4 py-3 shadow-[0_14px_30px_rgba(0,0,0,0.18)] ring-1 ring-inset ring-white/[0.05]">
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#20161B] text-[#FF8C9A] ring-1 ring-inset ring-[#FF5B6F]/20">
                <Sparkles className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-zinc-100">Analysis context loaded</p>
                <p className="mt-0.5 truncate text-xs text-zinc-600">Ask for rewrites, hooks, comments, or conversion cues.</p>
              </div>
            </div>
            <span className="rounded-full bg-black/20 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500">
              Live
            </span>
          </div>
        ) : null}

        <div className="shrink-0">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-600">Prompt starters</p>
            <span className="font-mono text-[10px] text-zinc-700">Click to ask</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {starterQuestions.map((starterQuestion) => {
              const Icon = starterQuestion.icon;

              return (
              <button
                key={starterQuestion.question}
                type="button"
                onClick={() => sendQuestion(starterQuestion.question)}
                disabled={isSending}
                className="group grid w-[168px] shrink-0 gap-2 rounded-2xl bg-[#17181D] p-3 text-left ring-1 ring-inset ring-white/[0.06] transition hover:-translate-y-0.5 hover:bg-[#202129] hover:ring-[#FF5B6F]/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5B6F]/70 disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none"
              >
                <span className="flex items-center gap-2">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-[#20161B] text-[#FF8C9A] ring-1 ring-inset ring-[#FF5B6F]/20 transition group-hover:bg-[#FF5B6F] group-hover:text-[#170A0D]">
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-xs font-semibold text-zinc-200">{starterQuestion.label}</span>
                </span>
                <span className="text-[11px] leading-4 text-zinc-500">{starterQuestion.detail}</span>
              </button>
              );
            })}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto rounded-2xl bg-[#101115] px-4 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] ring-1 ring-inset ring-white/[0.04]">
          {messages.length > 0 ? (
            <div className="grid gap-5">
              {messages.map((message, index) => (
                <div key={`${message.role}-${index}`} className={cn("flex animate-[workspace-enter_220ms_ease_both] gap-3", message.role === "user" ? "justify-end" : "justify-start")}>
                  {message.role === "assistant" ? <ChatAvatar role="assistant" /> : null}
                  <div
                    className={cn(
                      "max-w-[86%] text-sm leading-6",
                      compact ? "text-xs leading-5" : "",
                      message.role === "user"
                        ? "rounded-2xl rounded-br-sm bg-[#262832] px-4 py-3 font-medium text-zinc-100 shadow-[0_10px_24px_rgba(0,0,0,0.18)]"
                        : "text-zinc-300"
                    )}
                  >
                    {message.role === "user" ? <p className="mb-1 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">Question asked</p> : null}
                    {message.role === "assistant" ? <p className="mb-1 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-600">Assistant</p> : null}
                    <MarkdownText content={message.content} />
                  </div>
                  {message.role === "user" ? <ChatAvatar role="user" /> : null}
                </div>
              ))}
              {isSending ? (
                <div className="flex items-center gap-3 text-sm text-zinc-500">
                  <ChatAvatar role="assistant" />
                  <span className="inline-flex items-center gap-2 rounded-2xl bg-[#17181D] px-4 py-3">
                    <LoaderCircle className="h-4 w-4 animate-spin text-[#FF5B6F]" />
                    Thinking
                  </span>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="grid min-h-full place-items-center py-8 text-center">
              <div className="w-full">
                <span className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-[#17181D] text-zinc-400 ring-1 ring-inset ring-white/[0.06]">
                  <MessageCircle className="h-5 w-5" />
                </span>
                <p className="mt-4 text-base font-semibold tracking-tight text-zinc-100">What should we improve first?</p>
                <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-zinc-500">Use the analysis as context and ask for captions, hooks, hashtags, or audience-fit edits.</p>
              </div>
            </div>
          )}
        </div>

        {error ? <Alert variant="destructive">{error}</Alert> : null}

        <form onSubmit={handleSubmit} className="flex items-end gap-2 rounded-2xl bg-[#1A1B22] p-2 shadow-[0_18px_38px_rgba(0,0,0,0.28)] ring-1 ring-inset ring-white/[0.08] focus-within:ring-[#FF5B6F]/45">
          <textarea
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                event.currentTarget.form?.requestSubmit();
              }
            }}
            disabled={isSending}
            rows={1}
            placeholder="Message the content analyst..."
            className={cn(
              "max-h-36 min-h-11 flex-1 resize-none border-0 bg-transparent px-3 py-3 text-sm leading-5 text-white outline-none placeholder:text-zinc-600 disabled:cursor-not-allowed disabled:opacity-70",
              compact ? "text-xs" : ""
            )}
          />
          <Button
            type="submit"
            disabled={!question.trim() || isSending}
            className="mb-1 grid h-9 min-h-9 w-9 place-items-center rounded-full bg-none bg-[#FF5B6F] p-0 text-[#170A0D] shadow-[0_10px_22px_rgba(255,91,111,0.24)] hover:bg-[#FF7A8A]"
            aria-label="Send message"
          >
            {isSending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function ChatAvatar({ role }: { role: "assistant" | "user" }) {
  return (
    <span
      className={cn(
        "mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full ring-1 ring-inset",
        role === "assistant"
          ? "bg-[#18191F] text-[#FF8C9A] ring-white/[0.06]"
          : "bg-[#23252C] text-zinc-300 ring-white/[0.08]"
      )}
      aria-hidden="true"
    >
      {role === "assistant" ? <Sparkles className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
    </span>
  );
}

function MarkdownText({ content }: { content: string }) {
  return (
    <div className="space-y-2 whitespace-pre-wrap break-words">
      {content.split(/\n{2,}/).map((block, blockIndex) => {
        const trimmedBlock = block.trim();

        if (!trimmedBlock) {
          return null;
        }

        if (/^[-*]\s+/m.test(trimmedBlock)) {
          return (
            <ul key={blockIndex} className="list-disc space-y-1 pl-4 text-left">
              {trimmedBlock.split(/\n/).map((item, itemIndex) => (
                <li key={itemIndex}>{renderInlineMarkdown(item.replace(/^[-*]\s+/, ""))}</li>
              ))}
            </ul>
          );
        }

        return <p key={blockIndex}>{renderInlineMarkdown(trimmedBlock)}</p>;
      })}
    </div>
  );
}

function renderInlineMarkdown(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index} className="font-semibold text-zinc-200">{part.slice(2, -2)}</strong>;
    }

    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={index} className="rounded bg-zinc-900 px-1 py-0.5 font-mono text-[0.92em] text-[#FFB0BA]">{part.slice(1, -1)}</code>;
    }

    return part;
  });
}
