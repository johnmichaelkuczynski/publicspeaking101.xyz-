import {
  useGetSpeakingProfile,
  getGetSpeakingProfileQueryKey,
} from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
  HelpCircle,
  ThumbsUp,
  Target,
  Repeat,
  MessageSquare,
  Mic2,
} from "lucide-react";

function fmt(n: number | null | undefined, suffix = "") {
  if (n === null || n === undefined) return "—";
  return `${Math.round(n)}${suffix}`;
}

const TREND: Record<
  string,
  { label: string; icon: typeof TrendingUp; className: string }
> = {
  improving: { label: "Improving", icon: TrendingUp, className: "text-green-600" },
  declining: { label: "Slipping", icon: TrendingDown, className: "text-amber-600" },
  steady: { label: "Steady", icon: Minus, className: "text-muted-foreground" },
  insufficient: {
    label: "Not enough data yet",
    icon: HelpCircle,
    className: "text-muted-foreground",
  },
};

export default function Coach() {
  const { data: profile, isLoading, error } = useGetSpeakingProfile({
    query: {
      queryKey: getGetSpeakingProfileQueryKey(),
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-12 w-1/2" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="p-8 text-center bg-destructive/10 text-destructive rounded-lg max-w-4xl mx-auto">
        Failed to load your coaching profile.
      </div>
    );
  }

  const a = profile.analytics;
  const trend = TREND[a.trend] ?? TREND.insufficient;
  const TrendIcon = trend.icon;
  const hasActivity = a.gradedResponses + a.practiceResponses > 0;

  const stats = [
    { label: "Avg Content", value: fmt(a.averageContent) },
    { label: "Avg Delivery", value: fmt(a.averageDelivery) },
    { label: "Avg Overall", value: fmt(a.averageOverall) },
    { label: "Words / min", value: fmt(a.averageWordsPerMinute) },
    { label: "Fillers / 100 words", value: a.averageFillerRate != null ? a.averageFillerRate.toFixed(1) : "—" },
    { label: "Avg pauses", value: fmt(a.averagePauseCount) },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div>
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1 uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-secondary-foreground" /> Your Coach
        </div>
        <h1 className="text-4xl font-serif font-bold text-foreground">
          Where you stand & what to work on
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          This profile evolves from everything you do — graded work, practice rounds, and the
          questions you ask your coach. The more you practice, the sharper it gets.
        </p>
      </div>

      {!hasActivity ? (
        <Card className="border-2 border-secondary/40 bg-secondary/5">
          <CardContent className="p-8 text-center flex flex-col items-center">
            <Mic2 className="w-14 h-14 text-secondary mb-4" />
            <h2 className="text-2xl font-serif font-bold mb-2">Let's get some reps in</h2>
            <p className="text-muted-foreground max-w-md">
              Once you submit a graded response or run a practice round, your coach will start
              tracking your strengths, your focus areas, and how you're trending over time.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* AI summary + trend */}
          <Card className="border-2 border-secondary/30 bg-secondary/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between gap-4 mb-3 flex-wrap">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-secondary-foreground" />
                  Coach's read on you
                </h2>
                <Badge variant="outline" className={`gap-1.5 ${trend.className}`}>
                  <TrendIcon className="w-3.5 h-3.5" />
                  {trend.label}
                </Badge>
              </div>
              {profile.summary ? (
                <MarkdownRenderer content={profile.summary} />
              ) : (
                <p className="text-muted-foreground">
                  Keep practicing — your coach is still forming a full picture.
                </p>
              )}
              {profile.generatedAt && (
                <p className="text-xs text-muted-foreground mt-4">
                  Updated {new Date(profile.generatedAt).toLocaleString()}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Activity counters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-5 flex items-center gap-3">
                <Mic2 className="w-8 h-8 text-primary" />
                <div>
                  <div className="text-2xl font-bold">{a.gradedResponses}</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">Graded responses</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5 flex items-center gap-3">
                <Repeat className="w-8 h-8 text-secondary-foreground" />
                <div>
                  <div className="text-2xl font-bold">{a.practiceResponses}</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">Practice reps</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5 flex items-center gap-3">
                <MessageSquare className="w-8 h-8 text-primary" />
                <div>
                  <div className="text-2xl font-bold">{a.tutorExchanges}</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">Coach exchanges</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Metric stats */}
          <Card>
            <CardContent className="p-6">
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
                Your averages
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {stats.map((s) => (
                  <div key={s.label} className="rounded-lg bg-muted/40 p-4">
                    <div className="text-2xl font-bold">{s.value}</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Strengths + focus areas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-6">
                <div className="text-sm font-bold text-green-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <ThumbsUp className="w-4 h-4" /> Strengths
                </div>
                {profile.strengths.length > 0 ? (
                  <ul className="list-disc pl-4 space-y-2 text-sm">
                    {profile.strengths.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">Building this list as you go.</p>
                )}
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-secondary">
              <CardContent className="p-6">
                <div className="text-sm font-bold text-secondary-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4" /> Focus areas
                </div>
                {profile.focusAreas.length > 0 ? (
                  <ul className="list-disc pl-4 space-y-2 text-sm">
                    {profile.focusAreas.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">Building this list as you go.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recurring fixes */}
          {a.recurringFixes && a.recurringFixes.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                  Things that keep coming up
                </div>
                <div className="flex flex-wrap gap-2">
                  {a.recurringFixes.map((f, i) => (
                    <Badge key={i} variant="secondary" className="text-sm font-normal">{f}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Strong / weak topics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {a.strongTopics && a.strongTopics.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <div className="text-xs font-bold text-green-600 uppercase tracking-wider mb-3">
                    Strong topics
                  </div>
                  <div className="space-y-2">
                    {a.strongTopics.map((t, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="truncate">Unit {t.unitNumber} · {t.title}</span>
                        <span className="font-bold ml-2 shrink-0">{fmt(t.averageScore)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            {a.weakTopics && a.weakTopics.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <div className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-3">
                    Needs the most work
                  </div>
                  <div className="space-y-2">
                    {a.weakTopics.map((t, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="truncate">Unit {t.unitNumber} · {t.title}</span>
                        <span className="font-bold ml-2 shrink-0">{fmt(t.averageScore)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </>
      )}
    </div>
  );
}
