import { useGetSpeakingOverview } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { ArrowRight, BookOpen, Mic2, CheckCircle2, CircleDashed, Loader2, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const { data: overview, isLoading, error } = useGetSpeakingOverview();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  if (error || !overview) {
    return (
      <div className="p-8 text-center bg-destructive/10 text-destructive rounded-lg">
        Failed to load studio dashboard. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-4xl font-serif font-bold text-foreground">
          Welcome to the Studio
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          {overview.title}
        </p>
      </div>

      <Card className="border-2 border-secondary/40 bg-gradient-to-br from-secondary/10 to-transparent overflow-hidden">
        <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="bg-secondary/20 p-3 rounded-full text-secondary-foreground shrink-0 self-start">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-1">Practice as much as you want — it's unlimited</h3>
            <p className="text-muted-foreground text-sm">
              Every graded assignment has a practice mode: fresh questions every time (never the real
              prompts), instant unofficial grades, deep feedback, and a live coach on screen. Open any
              assignment to start a round, or check your evolving coaching profile.
            </p>
          </div>
          <Link href="/coach">
            <div className="shrink-0 inline-flex items-center gap-2 rounded-full bg-secondary px-5 py-2.5 font-semibold text-secondary-foreground cursor-pointer transition-transform hover:scale-105">
              View your Coach
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-secondary border-t-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Assignments Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {overview.totals.assignmentsCompleted} <span className="text-muted-foreground text-lg font-normal">/ {overview.totals.assignmentsTotal}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-primary border-t-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Attempts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{overview.totals.attemptsCount}</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-serif font-semibold">Your Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {overview.units.map((unit) => {
            const total = unit.assignments.length;
            const completed = unit.assignments.filter((a) => a.status === "submitted").length;
            const anyStarted = unit.assignments.some(
              (a) => a.status === "in_progress" || a.status === "submitted",
            );
            const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

            const scored = unit.assignments
              .map((a) => a.bestScore)
              .filter((s): s is number => typeof s === "number");
            const avgScore =
              scored.length > 0
                ? Math.round(scored.reduce((sum, s) => sum + s, 0) / scored.length)
                : null;

            const state: "complete" | "in_progress" | "not_started" =
              total > 0 && completed === total
                ? "complete"
                : anyStarted
                  ? "in_progress"
                  : "not_started";

            const statusConfig = {
              complete: {
                label: "Completed",
                Icon: CheckCircle2,
                className: "bg-secondary/15 text-secondary border-secondary/30",
                bar: "[&>div]:bg-secondary",
              },
              in_progress: {
                label: "In progress",
                Icon: Loader2,
                className: "bg-primary/10 text-primary border-primary/30",
                bar: "[&>div]:bg-primary",
              },
              not_started: {
                label: "Not started",
                Icon: CircleDashed,
                className: "bg-muted text-muted-foreground border-border",
                bar: "[&>div]:bg-muted-foreground/40",
              },
            }[state];
            const StatusIcon = statusConfig.Icon;

            return (
              <Card key={unit.unitNumber} className="hover:shadow-md transition-shadow group">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start gap-3 mb-4">
                    <div>
                      <div className="text-sm font-medium text-primary mb-1">
                        Unit {unit.unitNumber}
                      </div>
                      <h3 className="text-xl font-bold">{unit.title}</h3>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn("shrink-0 gap-1 font-medium", statusConfig.className)}
                    >
                      <StatusIcon className="w-3.5 h-3.5" />
                      {statusConfig.label}
                    </Badge>
                  </div>

                  {unit.summary && (
                    <p className="text-muted-foreground text-sm mb-5 line-clamp-2">
                      {unit.summary}
                    </p>
                  )}

                  <div className="mb-5 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-foreground">
                        {completed} of {total} assignments complete
                      </span>
                      <span className="text-muted-foreground tabular-nums">
                        {pct}%
                        {avgScore !== null && (
                          <span className="ml-2 text-secondary font-medium">avg {avgScore}</span>
                        )}
                      </span>
                    </div>
                    <Progress value={pct} className={cn("h-2", statusConfig.bar)} />
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      {unit.lectures.length} Lectures
                    </div>
                    <div className="flex items-center gap-1">
                      <Mic2 className="w-4 h-4" />
                      {unit.assignments.length} Assignments
                    </div>
                  </div>

                  <Link href={`/units/${unit.unitNumber}`}>
                    <div className="mt-6 flex items-center justify-between text-sm font-medium text-secondary-foreground cursor-pointer group-hover:text-primary transition-colors">
                      <span>Enter Module</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
