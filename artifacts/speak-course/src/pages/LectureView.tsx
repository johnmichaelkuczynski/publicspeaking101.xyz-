import { useGetSpeakingLecture, getGetSpeakingLectureQueryKey } from "@workspace/api-client-react";
import { useRoute } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function LectureView() {
  const [, params] = useRoute("/lectures/:lectureId");
  const lectureId = params?.lectureId ? parseInt(params.lectureId, 10) : 0;

  const { data: lecture, isLoading, error } = useGetSpeakingLecture(lectureId, {
    query: {
      enabled: !!lectureId,
      queryKey: getGetSpeakingLectureQueryKey(lectureId)
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-12 w-3/4" />
        <div className="space-y-4 pt-8">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>
    );
  }

  if (error || !lecture) {
    return (
      <div className="p-8 text-center bg-destructive/10 text-destructive rounded-lg max-w-3xl mx-auto">
        Failed to load lecture.
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Link href={`/units/${lecture.unitNumber}`}>
        <Button variant="ghost" className="mb-6 pl-0 hover:bg-transparent hover:text-primary">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Unit {lecture.unitNumber}
        </Button>
      </Link>
      
      <div className="mb-10">
        <div className="text-sm font-mono text-muted-foreground mb-3">{lecture.code}</div>
        <h1 className="text-4xl font-serif font-bold text-foreground leading-tight">
          {lecture.title}
        </h1>
        {lecture.unitTitle && (
          <div className="text-primary mt-2 font-medium">Part of: {lecture.unitTitle}</div>
        )}
      </div>

      <div className="bg-card border rounded-lg p-6 md:p-10 shadow-sm text-lg leading-relaxed">
        <MarkdownRenderer content={lecture.body} />
      </div>
    </div>
  );
}
