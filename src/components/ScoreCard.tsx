import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gauge } from "@/components/ui/icons";

interface ScoreCardProps {
  score: number;
  sentimentLabel?: string;
  sentimentScore?: number;
}

export function ScoreCard({ score, sentimentLabel, sentimentScore }: ScoreCardProps) {
  const normalizedScore = Math.min(100, Math.max(0, Math.round(score)));
  const scoreLabel = normalizedScore >= 75 ? "Strong" : normalizedScore >= 50 ? "Promising" : "Needs work";
  const ringColor = normalizedScore >= 75 ? "#059669" : normalizedScore >= 50 ? "#0891b2" : "#d97706";

  return (
    <Card className="flex h-full min-h-[220px] flex-col">
      <CardHeader className="p-5 pb-0">
        <Badge variant="outline" className="w-fit gap-1.5">
          <Gauge className="h-3.5 w-3.5" />
          Engagement score
        </Badge>
      </CardHeader>
      <CardContent className="grid flex-1 gap-5 p-5 pt-4 sm:grid-cols-[1fr_auto] sm:items-center xl:grid-cols-1 xl:content-between">
        <div className="min-w-0">
          <CardTitle className="text-2xl">{scoreLabel}</CardTitle>
          {sentimentLabel ? (
            <p className="mt-2 text-sm capitalize leading-6 text-slate-400">
              {sentimentLabel}
              {typeof sentimentScore === "number" ? ` · ${Math.round(sentimentScore * 100)}%` : ""}
            </p>
          ) : null}
        </div>

        <div className="flex items-center justify-start sm:justify-end xl:justify-center">
          <div
            className="grid h-32 w-32 shrink-0 place-items-center rounded-full"
            style={{
              background: `conic-gradient(${ringColor} ${normalizedScore * 3.6}deg, rgba(255,255,255,0.1) 0deg)`
            }}
            aria-label={`Engagement score ${normalizedScore} out of 100`}
            role="img"
          >
            <div className="grid h-24 w-24 place-items-center rounded-full bg-[#070B1A] text-center shadow-inner">
              <span className="text-4xl font-bold text-white">{normalizedScore}</span>
              <span className="-mt-2 text-xs font-semibold text-slate-500">/100</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
