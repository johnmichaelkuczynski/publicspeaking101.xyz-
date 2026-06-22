import { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetSpeakingAssessment,
  useCompleteSpeakingAssessment,
  useRequestUploadUrl,
  useTranscribeAssessmentRecording,
  getGetSpeakingAssessmentQueryKey,
  getGetSpeakingAssessmentsQueryKey,
} from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { AudioRecorder } from "@/components/AudioRecorder";
import {
  ArrowLeft,
  Mic2,
  PenLine,
  Award,
  Sparkles,
  CheckCircle2,
  Loader2,
  Lightbulb,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const FORMAT_META = {
  official: { label: "Official", Icon: Award },
  spoken: { label: "Spoken", Icon: Mic2 },
  written: { label: "Written", Icon: PenLine },
  hybrid: { label: "Hybrid", Icon: Sparkles },
};

export default function AssessmentRunner() {
  const params = useParams();
  const id = Number(params.assessmentId);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useGetSpeakingAssessment(id, {
    query: { queryKey: getGetSpeakingAssessmentQueryKey(id), enabled: !!id },
  });
  const complete = useCompleteSpeakingAssessment();
  const requestUploadUrl = useRequestUploadUrl();
  const transcribe = useTranscribeAssessmentRecording();

  const [answers, setAnswers] = useState<string[]>([]);
  const [transcribingIndex, setTranscribingIndex] = useState<number | null>(
    null,
  );

  useEffect(() => {
    if (data) {
      setAnswers(
        data.questions.map((_, i) => data.answers?.[i] ?? ""),
      );
    }
  }, [data]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-4">
        <Link href="/assessments">
          <span className="inline-flex items-center gap-1 text-sm text-muted-foreground cursor-pointer hover:text-foreground">
            <ArrowLeft className="w-4 h-4" /> Back to assessments
          </span>
        </Link>
        <div className="p-8 text-center bg-destructive/10 text-destructive rounded-lg">
          Failed to load this assessment.
        </div>
      </div>
    );
  }

  const meta = FORMAT_META[data.format];
  const FormatIcon = meta.Icon;
  const isDone = data.status === "completed";
  const answeredCount = answers.filter((a) => a.trim().length > 0).length;
  const allAnswered =
    data.questions.length > 0 && answeredCount === data.questions.length;

  const handleRecordingComplete = async (
    index: number,
    blob: Blob,
    mediaKind: "audio" | "video",
  ) => {
    const fallbackType = mediaKind === "video" ? "video/webm" : "audio/webm";
    setTranscribingIndex(index);
    try {
      const { uploadURL, objectPath } = await requestUploadUrl.mutateAsync({
        data: {
          name: `assessment-${id}-q${index}.webm`,
          size: blob.size,
          contentType: blob.type || fallbackType,
        },
      });

      const res = await fetch(uploadURL, {
        method: "PUT",
        body: blob,
        headers: { "Content-Type": blob.type || fallbackType },
      });
      if (!res.ok) throw new Error("Failed to upload recording");

      const { transcript } = await transcribe.mutateAsync({
        data: { objectPath },
      });

      setAnswers((prev) => {
        const next = [...prev];
        next[index] = transcript.trim();
        return next;
      });

      toast({
        title: "Recording transcribed",
        description:
          "We turned your spoken answer into text below. Edit it if you like, then submit.",
      });
    } catch {
      toast({
        variant: "destructive",
        title: "Couldn't process that recording",
        description:
          "Transcription failed. Please try recording your answer again.",
      });
    } finally {
      setTranscribingIndex(null);
    }
  };

  const handleComplete = () => {
    complete.mutate(
      { assessmentId: id, data: { answers } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: getGetSpeakingAssessmentQueryKey(id),
          });
          queryClient.invalidateQueries({
            queryKey: getGetSpeakingAssessmentsQueryKey(),
          });
          toast({
            title: "Assessment submitted",
            description: data.isOfficial
              ? "Logged as official — credit updated."
              : "Logged as practice. Nice work.",
          });
        },
        onError: () => {
          toast({
            variant: "destructive",
            title: "Couldn't submit",
            description: "Something went wrong saving your answers.",
          });
        },
      },
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <Link href="/assessments">
        <span className="inline-flex items-center gap-1 text-sm text-muted-foreground cursor-pointer hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Back to assessments
        </span>
      </Link>

      <div>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <Badge
            variant={data.isOfficial ? "default" : "outline"}
            className="gap-1.5"
          >
            <FormatIcon className="w-3.5 h-3.5" />
            {meta.label}
            {data.isOfficial && " · counts toward credit"}
          </Badge>
          {data.unitNumber != null && (
            <Badge variant="outline" className="text-muted-foreground">
              Week {data.unitNumber}
            </Badge>
          )}
          {data.scope !== "custom" && (
            <Badge variant="outline" className="text-muted-foreground capitalize">
              {data.scope} study
            </Badge>
          )}
          {isDone && (
            <Badge
              variant="outline"
              className="gap-1 bg-secondary/15 text-secondary-foreground border-secondary/40"
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Complete
            </Badge>
          )}
        </div>
        <h1 className="text-3xl font-serif font-bold text-foreground">
          {data.title}
        </h1>
        {data.request && (
          <p className="text-muted-foreground mt-2 italic">"{data.request}"</p>
        )}
        <p className="text-sm text-muted-foreground mt-3">
          {data.questions.length} questions · scored for completion, not for being
          right. Work through each one honestly — this is a diagnostic.
        </p>
      </div>

      <div className="space-y-4">
        {data.questions.map((q, i) => {
          const QIcon = q.mode === "spoken" ? Mic2 : PenLine;
          return (
            <Card key={i}>
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 text-primary font-bold rounded-full w-7 h-7 flex items-center justify-center shrink-0 text-sm">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium leading-snug">{q.prompt}</p>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1.5">
                      <QIcon className="w-3.5 h-3.5" />
                      {q.mode === "spoken"
                        ? "Record your answer out loud — we'll transcribe it for you."
                        : "Written answer."}
                    </div>
                    {q.hint && (
                      <div className="flex items-start gap-1.5 text-xs text-muted-foreground mt-1.5">
                        <Lightbulb className="w-3.5 h-3.5 shrink-0 mt-0.5 text-secondary-foreground" />
                        {q.hint}
                      </div>
                    )}
                  </div>
                </div>

                {q.mode === "spoken" && !isDone && (
                  <div className="space-y-2">
                    <AudioRecorder
                      onRecordingComplete={(blob, _durationMs, mediaKind) =>
                        handleRecordingComplete(i, blob, mediaKind)
                      }
                      disabled={transcribingIndex !== null}
                    />
                    {transcribingIndex === i && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Transcribing your recording…
                      </div>
                    )}
                  </div>
                )}

                {q.mode === "spoken" && (
                  <p className="text-xs text-muted-foreground">
                    {isDone
                      ? "Your transcribed answer:"
                      : "Your transcribed answer appears here — edit it if anything came out wrong."}
                  </p>
                )}

                <Textarea
                  value={answers[i] ?? ""}
                  disabled={isDone || transcribingIndex === i}
                  onChange={(e) => {
                    const next = [...answers];
                    next[i] = e.target.value;
                    setAnswers(next);
                  }}
                  placeholder={
                    q.mode === "spoken"
                      ? "Record above to transcribe your spoken answer, or type it here…"
                      : "Type your answer…"
                  }
                  className="min-h-24 resize-none"
                />
              </CardContent>
            </Card>
          );
        })}
      </div>

      {!isDone && (
        <div className="flex items-center justify-between gap-4 sticky bottom-4">
          <div
            className={cn(
              "text-sm font-medium",
              allAnswered ? "text-secondary-foreground" : "text-muted-foreground",
            )}
          >
            {answeredCount} of {data.questions.length} answered
          </div>
          <Button
            size="lg"
            onClick={handleComplete}
            disabled={!allAnswered || complete.isPending}
            className="gap-2 shadow-lg"
          >
            {complete.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            Submit assessment
          </Button>
        </div>
      )}

      {isDone && (
        <Button onClick={() => navigate("/assessments")} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to all assessments
        </Button>
      )}
    </div>
  );
}
