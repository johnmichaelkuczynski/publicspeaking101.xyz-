import { useGetSpeakingProgress, getGetSpeakingProgressQueryKey } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress as ProgressBar } from "@/components/ui/progress";
import { format } from "date-fns";
import { Trophy, Target, Activity } from "lucide-react";

export default function Progress() {
  const { data: progress, isLoading, error } = useGetSpeakingProgress({
    query: {
      queryKey: getGetSpeakingProgressQueryKey()
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  if (error || !progress) {
    return (
      <div className="p-8 text-center bg-destructive/10 text-destructive rounded-lg">
        Failed to load progress data.
      </div>
    );
  }

  const completionPercent = progress.totalAssignments > 0 
    ? Math.round((progress.completedAssignments / progress.totalAssignments) * 100) 
    : 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-4xl font-serif font-bold text-foreground">
          Performance Analytics
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Track your growth as a speaker.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-t-4 border-primary">
          <CardContent className="p-6">
            <div className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
              <Target className="w-4 h-4" /> Average Score
            </div>
            <div className="text-3xl font-bold">
              {progress.averageScore ? Math.round(progress.averageScore) : '-'}
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-t-4 border-secondary">
          <CardContent className="p-6">
            <div className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
              <Trophy className="w-4 h-4" /> Best Score
            </div>
            <div className="text-3xl font-bold">
              {progress.bestScore ? Math.round(progress.bestScore) : '-'}
            </div>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-muted-foreground">
          <CardContent className="p-6">
            <div className="text-sm font-medium text-muted-foreground mb-2">
              Assignments
            </div>
            <div className="text-3xl font-bold">
              {progress.completedAssignments} <span className="text-lg font-normal text-muted-foreground">/ {progress.totalAssignments}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-muted-foreground">
          <CardContent className="p-6">
            <div className="text-sm font-medium text-muted-foreground mb-2">
              Total Attempts
            </div>
            <div className="text-3xl font-bold">
              {progress.totalAttempts}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Unit Mastery</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              {progress.units.map(unit => {
                const percent = unit.total > 0 ? (unit.completed / unit.total) * 100 : 0;
                return (
                  <div key={unit.unitNumber} className="space-y-2">
                    <div className="flex justify-between items-end">
                      <div>
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mr-2">Unit {unit.unitNumber}</span>
                        <span className="font-semibold">{unit.title}</span>
                      </div>
                      <div className="text-sm font-medium">
                        {unit.averageScore ? `${Math.round(unit.averageScore)} avg` : 'No score'}
                      </div>
                    </div>
                    <div className="relative pt-1">
                      <ProgressBar value={percent} className="h-2" />
                    </div>
                    <div className="text-xs text-muted-foreground text-right">
                      {unit.completed} of {unit.total} assignments
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Topic Mastery</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-5">
                {progress.topics.map(topic => {
                  const attempted = topic.responses > 0;
                  const percent = attempted
                    ? topic.averageScore != null
                      ? topic.averageScore
                      : 0
                    : 0;
                  return (
                    <div key={topic.topicId} className="space-y-1.5">
                      <div className="flex justify-between items-center gap-4">
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mr-2">U{topic.unitNumber}</span>
                          <span className="font-medium text-sm">{topic.title}</span>
                        </div>
                        <div className="text-xs font-medium shrink-0 text-muted-foreground">
                          {attempted
                            ? topic.averageScore != null
                              ? `${Math.round(topic.averageScore)} avg`
                              : `${topic.responses} done`
                            : 'Not started'}
                        </div>
                      </div>
                      <ProgressBar value={percent} className={attempted ? 'h-1.5' : 'h-1.5 opacity-40'} />
                    </div>
                  );
                })}
                {progress.topics.length === 0 && (
                  <div className="text-sm text-muted-foreground text-center py-4">No topics yet</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" /> Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {progress.recent.map(item => (
                  <div key={item.id} className="flex gap-4 relative">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                      <div className="w-px h-full bg-border absolute top-4 bottom-[-1.5rem]" />
                    </div>
                    <div className="pb-2">
                      <div className="text-sm text-muted-foreground">{format(new Date(item.at), 'MMM d')}</div>
                      <div className="font-medium text-sm mt-0.5">{item.title}</div>
                      {item.score !== undefined && item.score !== null && (
                        <div className="text-xs font-bold text-secondary mt-1">Score: {Math.round(item.score)}</div>
                      )}
                    </div>
                  </div>
                ))}
                {progress.recent.length === 0 && (
                  <div className="text-sm text-muted-foreground text-center py-4">No recent activity</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
