import React, { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { 
  useStartPracticeSession, 
  useNextPracticeProblem, 
  useGradePracticeAnswer,
  useAskTutor,
  useListTopics,
  PracticeProblem,
  PracticeGrade,
  KeystrokeTrace
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { AnswerInput } from "@/components/AnswerInput";
import { MathKeyboard } from "@/components/MathKeyboard";
import { Skeleton } from "@/components/ui/skeleton";

export default function Practice() {
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [tutorEnabled, setTutorEnabled] = useState(true);
  const [focusOnWeaknesses, setFocusOnWeaknesses] = useState(false);
  
  const startSession = useStartPracticeSession();
  const nextProblem = useNextPracticeProblem();
  const gradeAnswer = useGradePracticeAnswer();
  const askTutor = useAskTutor();

  const [problem, setProblem] = useState<PracticeProblem | null>(null);
  const [answer, setAnswer] = useState("");
  const [grade, setGrade] = useState<PracticeGrade | null>(null);
  const [chatHistory, setChatHistory] = useState<{role: 'user'|'tutor', text: string}[]>([]);
  const [chatInput, setChatInput] = useState("");

  const handleStart = () => {
    startSession.mutate({ data: { tutorEnabled, focusOnWeaknesses } }, {
      onSuccess: (session) => {
        setSessionId(session.id);
        fetchNextProblem(session.id);
      }
    });
  };

  const fetchNextProblem = (sid: number) => {
    setAnswer("");
    setGrade(null);
    nextProblem.mutate({ sessionId: sid, data: {} }, {
      onSuccess: (prob) => setProblem(prob)
    });
  };

  const handleGrade = () => {
    if (!sessionId || !problem) return;
    const trace: KeystrokeTrace = { keystrokeCount: answer.length, eraseCount: 0, durationMs: 1000 };
    gradeAnswer.mutate({ sessionId, data: { problemId: problem.id, answer, trace } }, {
      onSuccess: (res) => setGrade(res)
    });
  };

  const handleAskTutor = () => {
    if (!chatInput.trim()) return;
    const msg = chatInput;
    setChatInput("");
    setChatHistory(prev => [...prev, { role: 'user', text: msg }]);
    
    askTutor.mutate({ data: { message: msg, sessionId, problemId: problem?.id } }, {
      onSuccess: (res) => {
        setChatHistory(prev => [...prev, { role: 'tutor', text: res.text }]);
      }
    });
  };

  return (
    <Layout>
      <div className="p-8 max-w-6xl mx-auto w-full flex flex-col gap-6 pb-24">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-serif font-bold text-primary mb-1">Infinite Practice</h1>
            <p className="text-muted-foreground text-sm">Hone your skills with adaptive problems.</p>
          </div>
          {!sessionId && (
            <div className="flex gap-6 items-center">
              <label className="flex items-center gap-2 text-sm font-medium">
                <Switch checked={tutorEnabled} onCheckedChange={setTutorEnabled} /> Tutor
              </label>
              <label className="flex items-center gap-2 text-sm font-medium">
                <Switch checked={focusOnWeaknesses} onCheckedChange={setFocusOnWeaknesses} /> Focus Weaknesses
              </label>
            </div>
          )}
        </div>

        {!sessionId ? (
          <div className="p-16 text-center bg-card rounded-lg border flex flex-col items-center justify-center gap-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary text-2xl">
              ∑
            </div>
            <div className="max-w-md">
              <h2 className="text-xl font-serif font-semibold mb-2">Ready to practice?</h2>
              <p className="text-muted-foreground text-sm mb-6">Problems adapt to your skill level. The AI tutor can guide you if you get stuck.</p>
              <Button onClick={handleStart} size="lg" disabled={startSession.isPending} className="w-full max-w-xs">
                {startSession.isPending ? "Starting..." : "Start Session"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className={`flex flex-col gap-6 ${tutorEnabled ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
              <Card>
                <CardHeader className="pb-3 border-b border-border mb-4">
                  <div className="flex justify-between items-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <span>{problem?.topicTitle || "Loading..."}</span>
                    <span>Diff: {problem?.difficulty ?? "-"}</span>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-6">
                  {nextProblem.isPending && !problem ? <Skeleton className="h-32 w-full" /> : problem && (
                    <>
                      <div className="prose prose-slate dark:prose-invert max-w-none text-lg">
                        <MarkdownRenderer content={problem.prompt} />
                      </div>
                      
                      <div className="flex flex-col gap-3">
                        <AnswerInput 
                          value={answer}
                          onChange={(val) => setAnswer(val)}
                          disabled={!!grade}
                        />
                        <MathKeyboard onInsert={(sym) => setAnswer(a => a + sym)} />
                      </div>

                      {grade ? (
                        <div className={`p-4 rounded-md border ${grade.correct ? 'bg-chart-2/10 border-chart-2/30' : 'bg-destructive/10 border-destructive/30'}`}>
                          <h3 className={`font-bold mb-2 ${grade.correct ? 'text-chart-2' : 'text-destructive'}`}>
                            {grade.correct ? "Correct!" : "Incorrect"}
                          </h3>
                          <div className="text-sm prose prose-sm max-w-none">
                            <MarkdownRenderer content={grade.explanation} />
                          </div>
                          {grade.tutorTip && tutorEnabled && (
                            <div className="mt-3 pt-3 border-t border-border/50 text-sm font-medium italic text-muted-foreground">
                              Tutor says: {grade.tutorTip}
                            </div>
                          )}
                          <div className="mt-4 flex justify-end">
                            <Button onClick={() => fetchNextProblem(sessionId)} disabled={nextProblem.isPending}>
                              Next Problem
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-end">
                          <Button onClick={handleGrade} disabled={!answer.trim() || gradeAnswer.isPending}>
                            {gradeAnswer.isPending ? "Grading..." : "Submit Answer"}
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {tutorEnabled && (
              <Card className="flex flex-col h-[600px] sticky top-6">
                <CardHeader className="py-3 border-b bg-secondary/30">
                  <CardTitle className="text-sm font-serif flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-chart-2"></div>
                    AI Tutor
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                  {chatHistory.length === 0 ? (
                    <div className="text-center text-sm text-muted-foreground my-auto italic">
                      Ask me for hints, explanations, or concept breakdowns.
                    </div>
                  ) : (
                    chatHistory.map((msg, i) => (
                      <div key={i} className={`flex flex-col max-w-[90%] ${msg.role === 'user' ? 'self-end items-end' : 'self-start items-start'}`}>
                        <div className={`p-3 rounded-lg text-sm ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}>
                          <MarkdownRenderer content={msg.text} />
                        </div>
                      </div>
                    ))
                  )}
                  {askTutor.isPending && (
                    <div className="self-start p-3 rounded-lg bg-secondary text-secondary-foreground text-sm animate-pulse">
                      Thinking...
                    </div>
                  )}
                </CardContent>
                <div className="p-3 border-t bg-background flex gap-2">
                  <input 
                    type="text" 
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAskTutor()}
                    placeholder="Type a question..."
                    className="flex-1 bg-secondary border-none rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <Button size="sm" onClick={handleAskTutor} disabled={!chatInput.trim() || askTutor.isPending}>
                    Send
                  </Button>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
