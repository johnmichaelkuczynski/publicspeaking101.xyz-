import { useGetSpeakingOverview } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { ArrowRight, BookOpen, Mic2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

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
          {overview.units.map((unit) => (
            <Card key={unit.unitNumber} className="hover:shadow-md transition-shadow group">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="text-sm font-medium text-primary mb-1">
                      Unit {unit.unitNumber}
                    </div>
                    <h3 className="text-xl font-bold">{unit.title}</h3>
                  </div>
                </div>
                
                {unit.summary && (
                  <p className="text-muted-foreground text-sm mb-6 line-clamp-2">
                    {unit.summary}
                  </p>
                )}

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
          ))}
        </div>
      </div>
    </div>
  );
}
