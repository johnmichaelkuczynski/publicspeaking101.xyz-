import React from "react";
import { useGetLecture } from "@workspace/api-client-react";
import { Layout } from "@/components/layout/Layout";
import { useParams, Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function LectureView() {
  const params = useParams();
  const lectureId = Number(params.lectureId);
  const { data: lecture, isLoading } = useGetLecture(lectureId);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto w-full p-8">
        <Link href={lecture ? `/weeks/${lecture.weekNumber}` : "/"}>
          <Button variant="ghost" className="mb-6 -ml-4 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Week {lecture?.weekNumber || ""}
          </Button>
        </Link>
        
        {isLoading ? (
          <div className="flex flex-col gap-6">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-6 w-32" />
            <div className="space-y-3 mt-8">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </div>
        ) : lecture ? (
          <article className="pb-24">
            <header className="mb-10">
              <h1 className="text-4xl font-serif font-bold text-primary mb-4 leading-tight">
                {lecture.title}
              </h1>
              <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground uppercase tracking-wider">
                <span>Week {lecture.weekNumber}</span>
              </div>
            </header>
            
            <div className="bg-card border shadow-sm rounded-lg p-8 md:p-12">
              <MarkdownRenderer content={lecture.body} />
            </div>
          </article>
        ) : (
          <div>Lecture not found.</div>
        )}
      </div>
    </Layout>
  );
}
