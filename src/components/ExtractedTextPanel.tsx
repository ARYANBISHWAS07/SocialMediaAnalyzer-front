import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "@/components/ui/icons";

interface ExtractedTextPanelProps {
  text: string;
}

export function ExtractedTextPanel({ text }: ExtractedTextPanelProps) {
  return (
    <Card className="rounded-md border-0 bg-[#15161B] shadow-[0_18px_38px_rgba(0,0,0,0.22)] ring-1 ring-inset ring-white/[0.05]">
      <CardHeader className="flex-row items-center justify-between gap-3 space-y-0 p-5 pb-4">
        <CardTitle className="text-lg">Extracted text</CardTitle>
        <Badge variant="outline" className="shrink-0 gap-1.5 border-white/10 bg-white/[0.03] text-zinc-300">
          <FileText className="h-3.5 w-3.5" />
          Text
        </Badge>
      </CardHeader>
      <CardContent className="p-5 pt-0">
        <div className="max-h-56 overflow-y-auto rounded-md bg-[#101115] p-4 ring-1 ring-inset ring-white/[0.05]">
          <pre className="whitespace-pre-wrap break-words text-sm leading-7 text-zinc-400">
            {text || "No readable text was found in this file."}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
}
