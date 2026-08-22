import type { Metrics } from "@/types/analysis";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { BarChart3 } from "@/components/ui/icons";

interface MetricsGridProps {
  metrics: Metrics;
}

const metricItems: Array<{ label: string; key: keyof Metrics; format?: (value: number) => string }> = [
  { label: "Words", key: "word_count" },
  { label: "Characters", key: "character_count" },
  { label: "Sentences", key: "sentence_count" },
  { label: "Paragraphs", key: "paragraph_count" },
  {
    label: "Avg. sentence",
    key: "average_words_per_sentence",
    format: (value) => value.toFixed(1)
  },
  { label: "Hashtags", key: "hashtag_count" },
  { label: "Questions", key: "question_count" }
];

export function MetricsGrid({ metrics }: MetricsGridProps) {
  return (
    <Card className="h-full min-h-[220px]">
      <CardHeader className="p-5 pb-4">
        <Badge variant="outline" className="w-fit gap-1.5">
          <BarChart3 className="h-3.5 w-3.5" />
          Metrics
        </Badge>
      </CardHeader>
      <CardContent className="p-5 pt-0">
        <div className="grid auto-rows-fr grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {metricItems.map((item) => {
            const value = metrics[item.key];

            return (
              <div key={item.key} className="flex min-h-24 flex-col justify-between rounded-xl border border-white/10 bg-white/[0.04] p-4">
                <p className="text-sm font-medium leading-5 text-slate-400">{item.label}</p>
                <p className="mt-4 text-2xl font-semibold tabular-nums tracking-tight text-white">
                  {item.format ? item.format(value) : value.toLocaleString()}
                </p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
