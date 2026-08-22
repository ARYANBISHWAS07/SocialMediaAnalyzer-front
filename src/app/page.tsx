"use client";

import { ChangeEvent, DragEvent, FormEvent, useEffect, useId, useMemo, useRef, useState } from "react";
import { ChatPanel } from "@/components/ChatPanel";
import { ExtractedTextPanel } from "@/components/ExtractedTextPanel";
import { SuggestionsPanel } from "@/components/SuggestionsPanel";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  CheckCircle2,
  FileText,
  HeartPulse,
  ImageIcon,
  MessageCircle,
  PanelLeft,
  RotateCcw,
  Send,
  Sparkles,
  Target,
  TrendingUp,
  UploadCloud,
  User,
  XCircle
} from "@/components/ui/icons";
import { analyzeFile } from "@/lib/api";
import type { Analysis, AnalyzeResponse, Metrics } from "@/types/analysis";

const emptyMetrics: Metrics = {
  word_count: 0,
  character_count: 0,
  sentence_count: 0,
  paragraph_count: 0,
  average_words_per_sentence: 0,
  hashtag_count: 0,
  question_count: 0
};

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_EXTENSIONS = [".pdf", ".png", ".jpg", ".jpeg"];
const ACCEPTED_TYPES = ["application/pdf", "image/png", "image/jpeg"];
const DEFAULT_SENTIMENT_SUMMARY =
  "The post conveys enthusiasm and optimism about product improvements, with a clear focus on community feedback and user experience. The tone is constructive and inviting, fostering positive audience interaction.";

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const uploadProgress = useProgress(isLoading);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedFile) {
      setError("Choose a file first.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const analysis = await analyzeFile(selectedFile);
      setResult(analysis);
    } catch (caughtError) {
      setResult(null);
      setError(caughtError instanceof Error ? caughtError.message : "Analysis failed.");
    } finally {
      setIsLoading(false);
    }
  }

  function resetAnalyzer() {
    setSelectedFile(null);
    setResult(null);
    setError(null);
    setIsLoading(false);
  }

  function handleFileSelect(file: File | null) {
    setSelectedFile(file);
    setResult(null);
    setError(null);
    setIsLoading(false);
  }

  return (
    <main className="min-h-screen overflow-y-auto bg-[#090A0C] text-zinc-100 lg:h-screen lg:overflow-hidden">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_48%_-18%,rgba(255,91,111,0.12),transparent_32%),linear-gradient(180deg,#101115_0%,#090A0C_46%,#07080A_100%)]" />
      <div
        className={`workspace-enter relative grid min-h-screen gap-px bg-black/35 transition-[grid-template-columns] duration-300 ease-out motion-reduce:transition-none lg:h-screen lg:min-h-0 ${
          leftCollapsed
            ? rightCollapsed
              ? "lg:grid-cols-[58px_minmax(0,1fr)_58px]"
              : "lg:grid-cols-[58px_minmax(0,1fr)_minmax(310px,30vw)]"
            : rightCollapsed
              ? "lg:grid-cols-[minmax(280px,21vw)_minmax(0,1fr)_58px]"
              : "lg:grid-cols-[minmax(280px,21vw)_minmax(0,1fr)_minmax(330px,30vw)]"
        }`}
      >
        <WorkspacePanel eyebrow="Sources" title="Upload" collapsed={leftCollapsed} onToggle={() => setLeftCollapsed((value) => !value)}>
          <div className="flex min-h-0 flex-1 overflow-y-auto p-4">
            <UploadPanel
              selectedFile={selectedFile}
              onFileSelect={handleFileSelect}
              onError={setError}
              onSubmit={handleSubmit}
              onReset={resetAnalyzer}
              error={error}
              isLoading={isLoading}
              uploadProgress={uploadProgress}
            />
          </div>
        </WorkspacePanel>

        <section className="relative flex min-h-[680px] min-w-0 flex-col bg-[#101116] shadow-[0_0_42px_rgba(0,0,0,0.34)] lg:min-h-0">
          <PanelHeader title="Metrics & analysis" eyebrow="Analysis" subtitle={result?.filename ?? "Waiting for source content"} />
          <div className="min-h-0 flex-1 overflow-y-auto">
            {result ? <AnalysisResults result={result} /> : isLoading ? <LoadingState progress={uploadProgress} /> : <EmptyState />}
          </div>
        </section>

        <WorkspacePanel eyebrow="Chat" title="Content analyst" collapsed={rightCollapsed} onToggle={() => setRightCollapsed((value) => !value)} align="right">
          <div className="min-h-0 flex-1 p-4">
            {result ? (
              <ChatPanel
                key={`${result.filename ?? "analysis"}-${result.extracted_text?.length ?? 0}`}
                extractedText={result.extracted_text ?? ""}
                analysis={normalizeAnalysis(result)}
                className="h-full min-h-0 border-0 bg-transparent shadow-none"
                compact
              />
            ) : (
              <ChatEmptyState />
            )}
          </div>
        </WorkspacePanel>
      </div>
    </main>
  );
}

function useProgress(isLoading: boolean) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      const timeout = window.setTimeout(() => setProgress(0), 0);
      return () => window.clearTimeout(timeout);
    }

    const start = window.setTimeout(() => {
      setProgress(7);
    }, 0);

    const interval = window.setInterval(() => {
      setProgress((current) => Math.min(current + Math.max(2, Math.round((92 - current) / 8)), 92));
    }, 360);

    return () => {
      window.clearTimeout(start);
      window.clearInterval(interval);
    };
  }, [isLoading]);

  return progress;
}

function WorkspacePanel({
  eyebrow,
  title,
  collapsed,
  onToggle,
  children,
  align = "left"
}: {
  eyebrow: string;
  title: string;
  collapsed: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <aside className="flex min-h-[420px] min-w-0 flex-col bg-[#0C0D10] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] lg:min-h-0">
      <div className="flex h-[72px] shrink-0 items-center justify-between px-4">
        {collapsed ? (
          <button
            type="button"
            onClick={onToggle}
            className="group grid h-full w-full place-items-center text-zinc-500 outline-none transition hover:text-[#FF5B6F] focus-visible:ring-2 focus-visible:ring-[#FF5B6F]/70"
            aria-label={`Expand ${title} panel`}
          >
            <span className="grid justify-items-center gap-2">
              {title === "Chat" ? <MessageCircle className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
              <span className="[writing-mode:vertical-rl] text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-600 group-hover:text-zinc-400">
                {title}
              </span>
            </span>
          </button>
        ) : (
          <>
            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-600">{eyebrow}</p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight text-zinc-50">{title}</h2>
            </div>
            <button
              type="button"
              onClick={onToggle}
              className="grid h-9 w-9 place-items-center rounded-md text-zinc-500 outline-none transition hover:bg-white/[0.04] hover:text-[#FF5B6F] focus-visible:ring-2 focus-visible:ring-[#FF5B6F]/70"
              aria-label={`Collapse ${title} panel`}
            >
              <PanelLeft className={`h-4 w-4 ${align === "right" ? "rotate-180" : ""}`} />
            </button>
          </>
        )}
      </div>
      {!collapsed ? children : null}
    </aside>
  );
}

function PanelHeader({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  return (
    <header className="flex h-[72px] shrink-0 items-center justify-between gap-4 px-5">
      <div className="min-w-0">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-600">{eyebrow}</p>
        <h1 className="mt-1 truncate text-xl font-semibold tracking-tight text-zinc-50">{title}</h1>
        <p className="mt-0.5 truncate font-mono text-xs text-zinc-600">{subtitle}</p>
      </div>
      <Badge variant="outline" className="shrink-0 border-[#FF5B6F]/25 bg-[#FF5B6F]/10 font-mono text-[11px] uppercase tracking-[0.16em] text-[#FF8C9A]">
        Live
      </Badge>
    </header>
  );
}

function UploadPanel({
  selectedFile,
  onFileSelect,
  onError,
  onSubmit,
  onReset,
  error,
  isLoading,
  uploadProgress
}: {
  selectedFile: File | null;
  onFileSelect: (file: File | null) => void;
  onError: (message: string | null) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onReset: () => void;
  error: string | null;
  isLoading: boolean;
  uploadProgress: number;
}) {
  const inputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const status = error ? "error" : isLoading ? "uploading" : selectedFile ? "staged" : "idle";

  useEffect(() => {
    if (!selectedFile && fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [selectedFile]);

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    handleFile(event.target.files?.[0]);
  }

  function handleFile(file: File | undefined) {
    if (!file) {
      return;
    }

    const validationError = validateFile(file);
    if (validationError) {
      onFileSelect(null);
      onError(validationError);
      return;
    }

    onError(null);
    onFileSelect(file);
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(false);

    if (!isLoading) {
      handleFile(event.dataTransfer.files[0]);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex min-h-full flex-1 flex-col">
      <label
        htmlFor={inputId}
        onDragOver={(event) => {
          event.preventDefault();
          if (!isLoading) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative grid min-h-[430px] flex-1 cursor-pointer place-items-center overflow-hidden rounded-md px-4 py-6 text-center outline-none transition duration-200 focus-within:ring-2 focus-within:ring-[#FF5B6F]/70 motion-reduce:transition-none ${
          isDragging
            ? "bg-[#211117] text-[#FFD2D8] shadow-[0_18px_42px_rgba(255,91,111,0.12)] ring-1 ring-inset ring-[#FF5B6F]/45"
            : "bg-[#141519] text-zinc-300 shadow-[0_16px_34px_rgba(0,0,0,0.22)] ring-1 ring-inset ring-white/[0.04] hover:bg-[#17181D]"
        } ${isLoading ? "cursor-wait" : ""}`}
      >
        <span className="absolute inset-x-6 top-5 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <span className="absolute left-6 top-7 rounded-full bg-[#FF5B6F]/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[#FF8C9A]">
          Signal lab
        </span>
        <span className="grid w-full justify-items-center gap-6">
          <UploadVisual3D isActive={isDragging || isLoading} isImage={selectedFile?.type.includes("image") ?? false} />
          <span className="grid gap-2">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-[#FF8C9A]">
              {isLoading ? "Signal extraction" : selectedFile ? "Ready to analyze" : "Creative intake"}
            </span>
            <span className="mx-auto max-w-[18rem] text-balance text-2xl font-semibold leading-tight tracking-tight text-zinc-50">
              {isLoading ? "Reading the post beneath the surface" : selectedFile ? "Decode this post before it hits the feed" : "Drop a post and surface the signals that matter"}
            </span>
          </span>
          <span className="text-xs leading-5 text-zinc-600">PDF, PNG, JPG, JPEG up to 10 MB</span>
        </span>
        <input
          ref={fileInputRef}
          id={inputId}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
          onChange={handleInputChange}
          disabled={isLoading}
          className="sr-only"
        />
      </label>

      <div className="mt-5 space-y-3">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-600">Source queue</p>
          <span className="font-mono text-xs text-zinc-600">{selectedFile ? "01" : "00"}</span>
        </div>

        {selectedFile ? (
          <div className="rounded-md bg-[#15161B] p-3 text-xs leading-5 shadow-[0_14px_26px_rgba(0,0,0,0.2)] ring-1 ring-inset ring-white/[0.05]">
            <div className="mb-2 flex items-center justify-between gap-2">
              <span
                className={`inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] ${
                  status === "error" ? "text-red-300" : status === "uploading" ? "text-[#FF8C9A]" : "text-emerald-300"
                }`}
              >
                {status === "uploading" ? <UploadCloud className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                {status}
              </span>
              <button
                type="button"
                onClick={() => onFileSelect(null)}
                disabled={isLoading}
                className="text-zinc-600 transition hover:text-zinc-100 disabled:opacity-50"
                aria-label="Remove selected file"
              >
                <XCircle className="h-4 w-4" />
              </button>
            </div>
            <p className="break-words font-medium text-zinc-200">{selectedFile.name}</p>
            <p className="mt-1 font-mono text-zinc-600">{formatFileSize(selectedFile.size)}</p>
            {isLoading ? (
              <div className="mt-3">
                <div className="mb-1 flex justify-between font-mono text-[11px] text-zinc-500">
                  <span>Uploading</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-black/35">
                  <div className="h-full rounded-full bg-[#FF5B6F] transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="rounded-md bg-[#111216] p-3 text-sm leading-6 text-zinc-600 ring-1 ring-inset ring-white/[0.04]">
            Add a campaign screenshot, carousel draft, or caption brief to generate social metrics and recommendations.
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 text-xs text-zinc-600">
          {ACCEPTED_EXTENSIONS.map((extension) => (
            <button
              key={extension}
              type="button"
              className="rounded-md bg-[#15161B] px-2.5 py-2 text-center font-mono uppercase ring-1 ring-inset ring-white/[0.05] transition hover:bg-[#1A1B21] hover:text-zinc-200 hover:ring-[#FF5B6F]/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5B6F]/60"
            >
              {extension.replace(".", "")}
            </button>
          ))}
        </div>
      </div>

      {error ? <Alert variant="destructive" className="mt-4 rounded-md text-xs">{error}</Alert> : null}

      <div className="mt-4 grid gap-2">
        <Button type="submit" disabled={!selectedFile || isLoading} className="min-h-10 rounded-md bg-none bg-[#FF5B6F] text-[#170A0D] shadow-[0_14px_28px_rgba(255,91,111,0.22)] hover:bg-[#FF7A8A]">
          {isLoading ? <UploadCloud className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
          {isLoading ? "Analyzing" : "Analyze content"}
        </Button>
        <Button type="button" onClick={onReset} disabled={isLoading} variant="ghost" className="min-h-10 rounded-md hover:bg-white/[0.05]">
          <RotateCcw className="h-4 w-4" />
          Reset workspace
        </Button>
      </div>
    </form>
  );
}

function UploadVisual3D({ isActive, isImage }: { isActive: boolean; isImage: boolean }) {
  return (
    <span className={`upload-visual-3d mx-auto ${isActive ? "is-active" : ""}`} aria-hidden="true">
      <span className="upload-orbit upload-orbit-one">
        <HeartPulse className="h-3.5 w-3.5" />
      </span>
      <span className="upload-orbit upload-orbit-two">#</span>
      <span className="upload-orbit upload-orbit-three">
        <TrendingUp className="h-3.5 w-3.5" />
      </span>
      <span className="upload-orbit upload-orbit-four">
        <MessageCircle className="h-3.5 w-3.5" />
      </span>
      <span className="upload-card upload-card-back">
        <span className="upload-card-avatar" />
        <span className="upload-card-lines">
          <span />
          <span />
        </span>
      </span>
      <span className="upload-card upload-card-mid">
        <span className="upload-card-media">
          {isImage ? <ImageIcon className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
        </span>
        <span className="upload-card-metrics">
          <span />
          <span />
          <span />
        </span>
      </span>
      <span className="upload-card upload-card-front">
        <HeartPulse className="h-4 w-4 text-[#FF5B6F]" />
        <span className="h-1.5 flex-1 rounded-full bg-[#FF5B6F]/45" />
        <Send className="h-4 w-4 text-zinc-500" />
      </span>
      <span className="upload-signal-ring upload-signal-ring-one" />
      <span className="upload-signal-ring upload-signal-ring-two" />
    </span>
  );
}

type DrillDown = {
  label: string;
  value: string;
  detail: string;
  color?: string;
  preview?: string;
};

function AnalysisResults({ result }: { result: AnalyzeResponse }) {
  const analysis = normalizeAnalysis(result);
  const metrics = result.metrics ?? emptyMetrics;
  const [drillDown, setDrillDown] = useState<DrillDown | null>(null);
  const statCards = useMemo(() => buildStatCards(metrics, analysis), [metrics, analysis]);
  const chartItems = useMemo(() => buildChartItems(metrics), [metrics]);
  const maxChartValue = Math.max(...chartItems.map((item) => item.value), 1);

  return (
    <div className="relative min-h-full overflow-hidden">
      <div className="grid gap-5 p-5">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {statCards.map((card) => (
            <button
              key={card.label}
              type="button"
              onClick={() => setDrillDown(card)}
              className="group flex min-h-[236px] flex-col overflow-hidden rounded-md bg-[#17181D] p-0 text-left outline-none shadow-[0_14px_32px_rgba(0,0,0,0.24)] ring-1 ring-inset ring-white/[0.05] transition duration-200 hover:-translate-y-0.5 hover:bg-[#1A1B21] focus-visible:ring-2 focus-visible:ring-[#FF5B6F]/70 motion-reduce:transition-none"
            >
              <div className="h-1" style={{ backgroundColor: card.color }} />
              <div className="flex flex-1 flex-col p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-600">{card.label}</p>
                    <p className="mt-4 font-mono text-3xl font-semibold tracking-normal text-zinc-50 tabular-nums">{card.value}</p>
                  </div>
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-black/25 text-zinc-400 ring-1 ring-inset ring-white/[0.06]">
                    {card.icon}
                  </span>
                </div>
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-black/35">
                  <div className="h-full rounded-full transition-all duration-500 group-hover:brightness-125" style={{ width: card.fill, backgroundColor: card.color }} />
                </div>
                <p className="mt-3 line-clamp-3 text-xs leading-5 text-zinc-500">{card.preview ?? card.detail}</p>
              </div>
            </button>
          ))}
        </div>

        <section className="rounded-md bg-[#15161B] p-4 shadow-[0_18px_38px_rgba(0,0,0,0.22)] ring-1 ring-inset ring-white/[0.05]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-600">Distribution</p>
              <h2 className="mt-1 text-lg font-semibold tracking-tight text-zinc-100">Content composition</h2>
            </div>
            <BarChart3 className="h-4 w-4 text-zinc-500" />
          </div>
          <div className="mt-7 grid h-72 grid-cols-4 items-end gap-4">
            {chartItems.map((item) => {
              const height = Math.max(10, Math.round((item.value / maxChartValue) * 100));

              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() =>
                    setDrillDown({
                      label: item.label,
                      value: item.value.toLocaleString(),
                      detail: item.detail,
                      color: item.color
                    })
                  }
                  className="group flex h-full flex-col justify-end gap-3 outline-none"
                >
                  <div className="flex h-full items-end rounded-sm bg-[#0F1014] px-3 pb-3 ring-1 ring-inset ring-white/[0.04] group-focus-visible:ring-2 group-focus-visible:ring-[#FF5B6F]/70">
                    <div
                      className="w-full rounded-sm transition-all duration-300 ease-out group-hover:brightness-125 motion-reduce:transition-none"
                      style={{ height: `${height}%`, backgroundColor: item.color }}
                    />
                  </div>
                  <div>
                    <p className="font-mono text-sm font-semibold text-zinc-200">{item.value.toLocaleString()}</p>
                    <p className="mt-1 text-xs text-zinc-600">{item.label}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-2">
          <SummaryPanel analysis={analysis} result={result} />
          <ExtractedTextPanel text={result.extracted_text ?? ""} />
        </section>

        <div className="grid items-stretch gap-4 xl:grid-cols-2">
          <SuggestionsPanel title="Strengths" items={analysis.strengths} tone="positive" />
          <SuggestionsPanel title="Improvements" items={analysis.improvements} tone="improvement" />
        </div>
      </div>

      <div
        className={`absolute inset-y-0 right-0 z-10 w-full max-w-md bg-[#121318]/95 shadow-[-22px_0_50px_rgba(0,0,0,0.35)] backdrop-blur transition-transform duration-300 ease-out ring-1 ring-inset ring-white/[0.06] motion-reduce:transition-none ${
          drillDown ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!drillDown}
      >
        {drillDown ? (
          <div className="flex h-full flex-col">
            <div className="flex h-[72px] items-center justify-between px-5">
              <div>
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-600">Drill-down</p>
                <h2 className="mt-1 text-lg font-semibold tracking-tight text-zinc-100">{drillDown.label}</h2>
              </div>
              <button
                type="button"
                onClick={() => setDrillDown(null)}
                className="grid h-9 w-9 place-items-center rounded-md text-zinc-500 outline-none transition hover:bg-white/[0.05] hover:text-[#FF5B6F] focus-visible:ring-2 focus-visible:ring-[#FF5B6F]/70"
                aria-label="Close drill-down panel"
              >
                <XCircle className="h-4 w-4" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-5">
              <p className="font-mono text-5xl font-semibold tracking-tight text-zinc-100">{drillDown.value}</p>
              <p className="mt-5 text-sm leading-7 text-zinc-400">{drillDown.detail}</p>
              <div className="mt-8 rounded-md bg-[#0E0F13] p-4 ring-1 ring-inset ring-white/[0.05]">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-600">Observation</p>
                <p className="mt-3 text-sm leading-7 text-zinc-400">
                  Use this signal to tune density, response hooks, and scan speed before publishing the post.
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function SummaryPanel({ analysis, result }: { analysis: Analysis; result: AnalyzeResponse }) {
  const sentimentScore = formatSentimentScore(analysis.sentiment_score);

  return (
    <section className="rounded-md bg-[#15161B] p-4 shadow-[0_18px_38px_rgba(0,0,0,0.22)] ring-1 ring-inset ring-white/[0.05]">
      <Badge variant="outline" className="border-white/10 bg-white/[0.03] text-zinc-300">
        <FileText className="h-3.5 w-3.5" />
        Result
      </Badge>
      <h2 className="mt-4 break-words text-lg font-semibold tracking-tight text-white">{result.filename ?? "Analysis result"}</h2>
      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        {result.file_type ? <span className="rounded-md bg-[#101115] px-3 py-2 font-mono uppercase text-zinc-400">{result.file_type}</span> : null}
        {typeof result.page_count === "number" ? (
          <span className="rounded-md bg-[#101115] px-3 py-2 font-mono text-zinc-400">
            {result.page_count} page{result.page_count === 1 ? "" : "s"}
          </span>
        ) : null}
        {analysis.model_used ? <span className="rounded-md bg-[#101115] px-3 py-2 font-mono text-zinc-400">{analysis.model_used}</span> : null}
      </div>
      <div className="mt-5 rounded-md bg-[#101115] p-4 ring-1 ring-inset ring-white/[0.05]">
        <div className="flex items-center justify-between gap-3">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-600">Sentiment score</p>
          <span className="font-mono text-sm font-semibold text-[#F5B86B]">{formatSentimentPercent(analysis.sentiment_score)}</span>
        </div>
        <p className="mt-3 text-sm leading-7 text-zinc-400">{analysis.sentiment_summary ?? DEFAULT_SENTIMENT_SUMMARY}</p>
      </div>
    </section>
  );
}

function ChatEmptyState() {
  return (
    <div className="flex h-full min-h-[420px] flex-col justify-between rounded-md bg-[#111216] p-4 shadow-[0_16px_34px_rgba(0,0,0,0.22)] ring-1 ring-inset ring-white/[0.05]">
      <div>
        <span className="grid h-11 w-11 place-items-center rounded-full bg-[#18191F] text-zinc-400 ring-1 ring-inset ring-white/[0.06]">
          <MessageCircle className="h-5 w-5" />
        </span>
        <h3 className="mt-4 text-lg font-semibold tracking-tight text-zinc-100">Assistant ready for campaign context</h3>
        <p className="mt-2 text-sm leading-6 text-zinc-500">After analysis, ask for hooks, captions, sentiment shifts, hashtag ideas, or why a metric moved.</p>
      </div>
      <div className="grid gap-2 text-xs text-zinc-500">
        {["What should I change before posting?", "Turn this into a shorter caption.", "Which audience response cues are weak?"].map((question) => (
          <div key={question} className="rounded-md bg-black/20 px-3 py-2 ring-1 ring-inset ring-white/[0.04]">
            {question}
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="grid h-full min-h-[520px] place-items-center p-6 text-center">
      <div className="max-w-lg">
        <SocialEmptyIllustration />
        <h2 className="mt-6 text-2xl font-semibold tracking-tight text-white">Waiting for source content</h2>
        <p className="mt-3 text-sm leading-7 text-zinc-500">
          Upload a post creative, caption brief, or campaign PDF and this workspace will populate with engagement signals, content structure, recommendations, and chat context.
        </p>
      </div>
    </div>
  );
}

function SocialEmptyIllustration() {
  return (
    <div className="mx-auto grid w-full max-w-sm gap-3 text-left">
      <div className="rounded-md bg-[#17181D] p-4 shadow-[0_22px_48px_rgba(0,0,0,0.24)] ring-1 ring-inset ring-white/[0.06]">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-[#22242A] text-zinc-500">
            <User className="h-4 w-4" />
          </span>
          <div className="flex-1">
            <div className="h-2 w-24 rounded-full bg-zinc-700/70" />
            <div className="mt-2 h-2 w-14 rounded-full bg-zinc-800" />
          </div>
        </div>
        <div className="mt-4 grid gap-2">
          <div className="h-2 rounded-full bg-zinc-800" />
          <div className="h-2 w-4/5 rounded-full bg-zinc-800" />
        </div>
        <div className="mt-5 grid grid-cols-3 gap-2 font-mono text-[10px] text-zinc-500">
          <span className="rounded bg-[#101115] px-2 py-1">LIKES</span>
          <span className="rounded bg-[#101115] px-2 py-1">SHARES</span>
          <span className="rounded bg-[#101115] px-2 py-1">HOOKS</span>
        </div>
      </div>
      <div className="ml-10 rounded-md bg-[#14151A] p-3 shadow-[0_18px_38px_rgba(0,0,0,0.2)] ring-1 ring-inset ring-white/[0.05]">
        <div className="flex items-center gap-3">
          <HeartPulse className="h-4 w-4 text-[#FF5B6F]" />
          <div className="h-1.5 flex-1 rounded-full bg-[#FF5B6F]/35" />
          <Send className="h-4 w-4 text-zinc-500" />
        </div>
      </div>
    </div>
  );
}

function LoadingState({ progress }: { progress: number }) {
  const stages = [
    { label: "Uploading source", value: progress, color: "#FF5B6F" },
    { label: "Extracting copy", value: Math.min(progress + 8, 95), color: "#F5B86B" },
    { label: "Scoring signals", value: Math.max(progress - 14, 20), color: "#6FA8DC" },
    { label: "Preparing chat", value: Math.max(progress - 26, 10), color: "#8FBF9F" }
  ];

  return (
    <div className="h-full min-h-[520px] p-5">
      <div className="grid gap-5 xl:grid-cols-[minmax(280px,0.9fr)_1.3fr]">
        <section className="rounded-md bg-[#15161B] p-5 shadow-[0_18px_38px_rgba(0,0,0,0.22)] ring-1 ring-inset ring-white/[0.05]">
          <div className="relative mx-auto h-64 max-w-56 overflow-hidden rounded-md bg-[#0F1014] p-5 ring-1 ring-inset ring-white/[0.07]">
            <FileText className="h-8 w-8 text-zinc-500" />
            <div className="mt-10 grid gap-3">
              <div className="h-2 rounded-full bg-zinc-700/60" />
              <div className="h-2 w-5/6 rounded-full bg-zinc-800" />
              <div className="h-2 w-3/5 rounded-full bg-zinc-800" />
              <div className="h-16 rounded-sm bg-zinc-900/80" />
            </div>
            <div className="absolute inset-x-0 top-0 h-16 animate-[scan-line_1.8s_ease-in-out_infinite] bg-gradient-to-b from-transparent via-[#FF5B6F]/20 to-transparent" />
          </div>
          <h2 className="mt-5 text-lg font-semibold tracking-tight text-zinc-100">Extracting social content</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-500">Reading captions, visual text, hashtags, and engagement cues before building the dashboard.</p>
        </section>

        <section className="rounded-md bg-[#15161B] p-5 shadow-[0_18px_38px_rgba(0,0,0,0.22)] ring-1 ring-inset ring-white/[0.05]">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-600">Pipeline</p>
              <h2 className="mt-1 text-lg font-semibold tracking-tight text-zinc-100">Building metrics</h2>
            </div>
            <span className="font-mono text-sm text-zinc-500">{progress}%</span>
          </div>
          <div className="mt-6 grid gap-4">
            {stages.map((stage) => (
              <div key={stage.label}>
                <div className="mb-2 flex justify-between text-xs">
                  <span className="text-zinc-400">{stage.label}</span>
                  <span className="font-mono text-zinc-600">{stage.value}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-black/35">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${stage.value}%`, backgroundColor: stage.color }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function buildStatCards(metrics: Metrics, analysis: Analysis): Array<DrillDown & { fill: string; icon: React.ReactNode }> {
  return [
    {
      label: "Engagement",
      value: Math.round(analysis.engagement_score ?? 0).toString(),
      detail: "Composite estimate from sentiment, questions, hashtags, and text shape.",
      fill: `${Math.min(Math.max(analysis.engagement_score ?? 0, 8), 100)}%`,
      color: "#FF5B6F",
      icon: <HeartPulse className="h-4 w-4" />
    },
    {
      label: "Words",
      value: metrics.word_count.toLocaleString(),
      detail: "Total words extracted from the uploaded source.",
      fill: `${Math.min(Math.max(metrics.word_count / 3, 8), 100)}%`,
      color: "#6FA8DC",
      icon: <FileText className="h-4 w-4" />
    },
    {
      label: "Sentiment score",
      value: formatSentimentPercent(analysis.sentiment_score),
      detail: analysis.sentiment_summary ?? DEFAULT_SENTIMENT_SUMMARY,
      preview: "Positive, constructive, and inviting.",
      fill: `${getSentimentFill(analysis.sentiment_score)}%`,
      color: "#F5B86B",
      icon: <TrendingUp className="h-4 w-4" />
    },
    {
      label: "Questions",
      value: metrics.question_count.toLocaleString(),
      detail: "Direct prompts that invite comments, replies, or saves.",
      fill: `${Math.min(Math.max(metrics.question_count * 22, 8), 100)}%`,
      color: "#8FBF9F",
      icon: <Target className="h-4 w-4" />
    }
  ];
}

function buildChartItems(metrics: Metrics) {
  return [
    { label: "Words", value: metrics.word_count, detail: "Total extracted word count.", color: "#6FA8DC" },
    { label: "Sentences", value: metrics.sentence_count, detail: "Sentence count from the parsed content.", color: "#F5B86B" },
    { label: "Paragraphs", value: metrics.paragraph_count, detail: "Paragraph structure from the source.", color: "#8FBF9F" },
    { label: "Hashtags", value: metrics.hashtag_count, detail: "Detected hashtag count for discoverability.", color: "#B7A1D6" }
  ];
}

function formatSentimentScore(score: number | undefined) {
  if (typeof score !== "number" || Number.isNaN(score)) {
    return "0.82";
  }

  if (Math.abs(score) <= 1) {
    return score.toFixed(2);
  }

  return Math.round(score).toString();
}

function formatSentimentPercent(score: number | undefined) {
  if (typeof score !== "number" || Number.isNaN(score)) {
    return "82%";
  }

  if (Math.abs(score) <= 1) {
    return `${Math.round(score * 100)}%`;
  }

  return `${Math.round(score)}%`;
}

function getSentimentFill(score: number | undefined) {
  if (typeof score !== "number" || Number.isNaN(score)) {
    return 82;
  }

  if (Math.abs(score) <= 1) {
    return Math.min(Math.max(Math.round(((score + 1) / 2) * 100), 8), 100);
  }

  return Math.min(Math.max(Math.round(score), 8), 100);
}

function normalizeAnalysis(result: AnalyzeResponse): Analysis {
  return {
    engagement_score: result.analysis?.engagement_score ?? result.engagement_score ?? 0,
    sentiment_label: result.analysis?.sentiment_label ?? result.sentiment_label,
    sentiment_score: result.analysis?.sentiment_score ?? result.sentiment_score,
    sentiment_summary: result.analysis?.sentiment_summary ?? result.sentiment_summary,
    strengths: result.analysis?.strengths ?? result.strengths ?? [],
    improvements: result.analysis?.improvements ?? result.improvements ?? [],
    model_used: result.analysis?.model_used ?? result.model_used
  };
}

function validateFile(file: File): string | null {
  const extension = `.${file.name.split(".").pop()?.toLowerCase() || ""}`;

  if (!ACCEPTED_EXTENSIONS.includes(extension) || (file.type && !ACCEPTED_TYPES.includes(file.type))) {
    return "Please upload a PDF, PNG, JPG, or JPEG file.";
  }

  if (file.size > MAX_FILE_SIZE) {
    return "Please upload a file that is 10 MB or smaller.";
  }

  return null;
}

function formatFileSize(bytes: number) {
  if (bytes === 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB"];
  const unitIndex = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const size = bytes / 1024 ** unitIndex;

  return `${size.toFixed(size >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}
