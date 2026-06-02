import { useGetSpeakingAssignment, getGetSpeakingAssignmentQueryKey, useStartSpeakingAttempt } from "@workspace/api-client-react";
import { useRoute, useLocation } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play, AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AssignmentDetail() {
  const [, params] = useRoute("/assignments/:assignmentId");
  const assignmentId = params?.assignmentId ? parseInt(params.assignmentId, 10) : 0;
  const [, setLocation] = useLocation();

  const { data: assignment, isLoading, error } = useGetSpeakingAssignment(assignmentId, {
    query: {
      enabled: !!assignmentId,
      queryKey: getGetSpeakingAssignmentQueryKey(assignmentId)
    }
  });

  const startAttempt = useStartSpeakingAttempt();

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div className="p-8 text-center bg-destructive/10 text-destructive rounded-lg max-w-3xl mx-auto">
        Failed to load assignment.
      </div>
    );
  }

  const handleStart = () => {
    startAttempt.mutate({ assignmentId }, {
      onSuccess: (attempt) => {
        setLocation(`/attempts/${attempt.id}`);
      }
    });
  };

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Link href={`/units/${assignment.unitNumber}`}>
        <Button variant="ghost" className="mb-6 pl-0 hover:bg-transparent hover:text-primary">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Unit {assignment.unitNumber}
        </Button>
      </Link>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Badge variant="secondary" className="uppercase tracking-wider font-bold">
            {assignment.kind}
          </Badge>
          <span className="text-sm font-medium text-muted-foreground">Unit {assignment.unitNumber}</span>
        </div>
        <h1 className="text-4xl font-serif font-bold text-foreground mb-4">
          {assignment.title}
        </h1>
        {assignment.instructions && (
          <p className="text-lg text-muted-foreground leading-relaxed">
            {assignment.instructions}
          </p>
        )}
      </div>

      <Card className="mb-8 border-primary/20 bg-primary/5">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="bg-primary/10 p-3 rounded-full text-primary shrink-0">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-2">Before you begin</h3>
              <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                <li>Ensure you are in a quiet room with minimal background noise.</li>
                <li>Check your microphone permissions when prompted.</li>
                <li>Speak clearly and at a natural pace.</li>
                <li>This assignment contains {assignment.prompts.length} prompt{assignment.prompts.length === 1 ? '' : 's'}.</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button 
          size="lg" 
          className="w-full md:w-auto px-12 py-6 text-lg rounded-full font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105"
          onClick={handleStart}
          disabled={startAttempt.isPending}
        >
          {startAttempt.isPending ? "Starting..." : (
            <>
              <Play className="w-5 h-5 mr-2 fill-current" />
              Step up to the Mic
            </>
          )}
        </Button>
      </div>

      <div className="mt-12 space-y-4">
        <h3 className="text-xl font-serif font-semibold">Prompts Preview</h3>
        <div className="space-y-3">
          {assignment.prompts.map((prompt, idx) => (
            <div key={prompt.id} className="p-4 border rounded-lg bg-card flex gap-4">
              <div className="text-muted-foreground font-mono font-bold mt-0.5">{(idx + 1).toString().padStart(2, '0')}</div>
              <div>
                <div className="font-medium">{prompt.prompt}</div>
                <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                  <span className="uppercase tracking-wider">{prompt.mode}</span>
                  {prompt.targetSeconds && <span>Target: {prompt.targetSeconds}s</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
