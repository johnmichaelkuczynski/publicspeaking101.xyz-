import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import { Layout } from "@/components/layout/Layout";
import Dashboard from "@/pages/Dashboard";
import Diagnostics from "@/pages/Diagnostics";
import UnitView from "@/pages/UnitView";
import LectureView from "@/pages/LectureView";
import AssignmentDetail from "@/pages/AssignmentDetail";
import AttemptsList from "@/pages/AttemptsList";
import AttemptRunner from "@/pages/AttemptRunner";
import Progress from "@/pages/Progress";

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/diagnostics" component={Diagnostics} />
        <Route path="/units/:unitNumber" component={UnitView} />
        <Route path="/lectures/:lectureId" component={LectureView} />
        <Route path="/assignments/:assignmentId" component={AssignmentDetail} />
        <Route path="/attempts" component={AttemptsList} />
        <Route path="/attempts/:attemptId" component={AttemptRunner} />
        <Route path="/progress" component={Progress} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
