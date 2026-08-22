import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Lightbulb } from "@/components/ui/icons";

interface SuggestionsPanelProps {
  title: string;
  items: string[];
  tone: "positive" | "improvement";
}

export function SuggestionsPanel({ title, items, tone }: SuggestionsPanelProps) {
  const toneStyles =
    tone === "positive"
      ? "text-zinc-300 before:bg-emerald-300"
      : "text-zinc-300 before:bg-amber-300";
  const Icon = tone === "positive" ? CheckCircle2 : Lightbulb;

  return (
    <Card className="flex h-full min-h-[260px] flex-col rounded-md border-0 bg-[#15161B] shadow-[0_18px_38px_rgba(0,0,0,0.22)] ring-1 ring-inset ring-white/[0.05]">
      <CardHeader className="flex-row items-center justify-between gap-3 space-y-0 p-5 pb-4">
        <CardTitle className="text-lg">{title}</CardTitle>
        <Badge variant="outline" className="shrink-0 gap-1.5 border-white/10 bg-white/[0.03] font-mono text-zinc-300">
          <Icon className="h-3.5 w-3.5" />
          {items.length}
        </Badge>
      </CardHeader>
      <CardContent className="min-h-0 flex-1 overflow-y-auto p-5 pt-0">
        {items.length > 0 ? (
          <ul className="grid gap-3">
            {items.map((item, index) => (
              <li
                key={`${title}-${index}`}
                className={`relative rounded-md bg-[#101115] py-3.5 pl-5 pr-4 text-sm font-medium leading-6 ring-1 ring-inset ring-white/[0.05] before:absolute before:left-0 before:top-3.5 before:h-6 before:w-1 before:rounded-r ${toneStyles}`}
              >
                {item}
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-md bg-[#101115] p-4 text-sm text-zinc-500 ring-1 ring-inset ring-white/[0.05]">None.</p>
        )}
      </CardContent>
    </Card>
  );
}
