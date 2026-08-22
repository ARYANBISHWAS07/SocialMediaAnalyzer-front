"use client";

import { ChangeEvent, DragEvent, KeyboardEvent, useEffect, useId, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, UploadCloud, XCircle } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_EXTENSIONS = [".pdf", ".png", ".jpg", ".jpeg"];
const ACCEPTED_TYPES = ["application/pdf", "image/png", "image/jpeg"];

interface FileUploadProps {
  selectedFile: File | null;
  onFileSelect: (file: File | null) => void;
  onError: (message: string | null) => void;
  disabled?: boolean;
  className?: string;
}

export function FileUpload({ selectedFile, onFileSelect, onError, disabled = false, className }: FileUploadProps) {
  const inputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!selectedFile && fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [selectedFile]);

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

    if (disabled) {
      return;
    }

    handleFile(event.dataTransfer.files[0]);
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    handleFile(event.target.files?.[0]);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLLabelElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      fileInputRef.current?.click();
    }
  }

  return (
    <Card className={cn("flex flex-col overflow-hidden bg-slate-950/80", className)}>
      <CardHeader className="p-4 pb-3">
        <CardTitle>Upload</CardTitle>
      </CardHeader>

      <label
        htmlFor={inputId}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={handleKeyDown}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "group mx-4 flex min-h-60 flex-1 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed px-5 py-8 text-center transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950",
          isDragging
            ? "border-cyan-300 bg-cyan-400/10 shadow-[0_0_40px_rgba(34,211,238,0.18)]"
            : "border-white/15 bg-white/[0.035] hover:border-cyan-300/70 hover:bg-cyan-400/5 hover:shadow-[0_0_34px_rgba(124,58,237,0.16)]",
          disabled ? "cursor-not-allowed opacity-70" : ""
        )}
        aria-label="Upload a PDF, PNG, JPG, or JPEG file"
      >
        <span className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 via-blue-500 to-cyan-400 text-white shadow-[0_0_42px_rgba(34,211,238,0.3)] transition duration-200 group-hover:-translate-y-0.5">
          <UploadCloud className="h-7 w-7" />
        </span>
        <span className="mt-5 text-base font-semibold text-white">Drop or browse</span>
        <span className="mt-2 text-xs font-medium text-slate-500">PDF · PNG · JPG · JPEG · 10 MB</span>
        <input
          ref={fileInputRef}
          id={inputId}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
          onChange={handleInputChange}
          disabled={disabled}
          className="sr-only"
        />
      </label>

      {selectedFile ? (
        <CardContent className="p-4 pt-3">
          <div className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <Badge variant="success" className="gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Ready
              </Badge>
              <Button
                type="button"
                variant="ghost"
                onClick={() => onFileSelect(null)}
                className="min-h-8 px-2 text-xs"
                disabled={disabled}
              >
                <XCircle className="h-3.5 w-3.5" />
                Remove
              </Button>
            </div>
            <dl className="grid gap-3 text-sm">
              <div className="min-w-0">
                <dt className="font-medium text-slate-400">Filename</dt>
                <dd className="mt-1 break-words font-semibold text-white">{selectedFile.name}</dd>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <dt className="font-medium text-slate-400">File type</dt>
                  <dd className="mt-1 font-semibold uppercase text-white">{getFileExtension(selectedFile.name)}</dd>
                </div>
                <div>
                  <dt className="font-medium text-slate-400">File size</dt>
                  <dd className="mt-1 font-semibold text-white">{formatFileSize(selectedFile.size)}</dd>
                </div>
              </div>
            </dl>
          </div>
        </CardContent>
      ) : null}
      <CardContent className={selectedFile ? "p-4 pt-0" : "p-4 pt-3"}>
        <div className="grid grid-cols-4 gap-2">
          {ACCEPTED_EXTENSIONS.map((extension) => (
            <Badge key={extension} variant="outline" className="justify-center py-2 uppercase">
              {extension.replace(".", "")}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
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

function getFileExtension(filename: string) {
  return filename.split(".").pop() || "unknown";
}

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
