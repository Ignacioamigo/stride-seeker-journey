
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UserProvider } from "@/context/UserContext";

// Pages
import WelcomePage from "@/pages/WelcomePage";
import Dashboard from "@/pages/Dashboard";
import Plan from "@/pages/Plan";
import Train from "@/pages/Train";
import Stats from "@/pages/Stats";
import Profile from "@/pages/Profile";
import NotFound from "@/pages/NotFound";

// Onboarding Components
import NameQuestion from "@/components/onboarding/NameQuestion";
import AgeQuestion from "@/components/onboarding/AgeQuestion";
import GenderQuestion from "@/components/onboarding/GenderQuestion";
import HeightQuestion from "@/components/onboarding/HeightQuestion";
import WeightQuestion from "@/components/onboarding/WeightQuestion";
import MaxDistanceQuestion from "@/components/onboarding/MaxDistanceQuestion";
import PaceQuestion from "@/components/onboarding/PaceQuestion";
import GoalQuestion from "@/components/onboarding/GoalQuestion";
import WeeklyWorkoutsQuestion from "@/components/onboarding/WeeklyWorkoutsQuestion";
import ExperienceQuestion from "@/components/onboarding/ExperienceQuestion";
import InjuriesQuestion from "@/components/onboarding/InjuriesQuestion";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <UserProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Main Routes */}
            <Route path="/" element={<WelcomePage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/plan" element={<Plan />} />
            <Route path="/train" element={<Train />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/profile" element={<Profile />} />
            
            {/* Onboarding Routes */}
            <Route path="/onboarding/name" element={<NameQuestion />} />
            <Route path="/onboarding/age" element={<AgeQuestion />} />
            <Route path="/onboarding/gender" element={<GenderQuestion />} />
            <Route path="/onboarding/height" element={<HeightQuestion />} />
            <Route path="/onboarding/weight" element={<WeightQuestion />} />
            <Route path="/onboarding/max-distance" element={<MaxDistanceQuestion />} />
            <Route path="/onboarding/pace" element={<PaceQuestion />} />
            <Route path="/onboarding/goal" element={<GoalQuestion />} />
            <Route path="/onboarding/weekly-workouts" element={<WeeklyWorkoutsQuestion />} />
            <Route path="/onboarding/experience" element={<ExperienceQuestion />} />
            <Route path="/onboarding/injuries" element={<InjuriesQuestion />} />
            
            {/* Catch-all and redirect */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </UserProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
