import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UserProvider, useUser } from "@/context/UserContext";
import { StatsProvider } from "@/context/StatsContext";
import { WeeklyFeedbackProvider } from "@/context/WeeklyFeedbackContext";
import AppLoader from "@/components/AppLoader";

// Weekly Feedback Components
import WeeklyFeedbackModal from "@/components/feedback/WeeklyFeedbackModal";
import WeeklyFeedbackTester from "@/components/testing/WeeklyFeedbackTester";

// Pages
import WelcomePage from "@/pages/WelcomePage";
import Plan from "@/pages/Plan";
import Train from "@/pages/Train";
import Stats from "@/pages/Stats";
import Profile from "@/pages/Profile";
import EditProfile from "@/pages/EditProfile";
import Activities from "@/pages/Activities";
import Settings from "@/pages/Settings";
import ProfileSettings from "@/pages/ProfileSettings";
import Configuration from "@/pages/Configuration";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsAndConditions from "@/pages/TermsAndConditions";
import NotFound from "@/pages/NotFound";
import Admin from "@/pages/Admin";

// Mobile screens
import PermissionsScreen from "@/components/PermissionsScreen";
import SettingsScreen from "@/components/SettingsScreen";

// Onboarding Components
import NameQuestion from "@/components/onboarding/NameQuestion";
import AgeQuestion from "@/components/onboarding/AgeQuestion";
import GenderQuestion from "@/components/onboarding/GenderQuestion";
import HeightQuestion from "@/components/onboarding/HeightQuestion";
import WeightQuestion from "@/components/onboarding/WeightQuestion";
import MaxDistanceQuestion from "@/components/onboarding/MaxDistanceQuestion";
import PaceQuestion from "@/components/onboarding/PaceQuestion";
import GoalQuestion from "@/components/onboarding/GoalQuestion";
import RacePreparationQuestion from "@/components/onboarding/RacePreparationQuestion";
import WeeklyWorkoutsQuestion from "@/components/onboarding/WeeklyWorkoutsQuestion";
import ExperienceQuestion from "@/components/onboarding/ExperienceQuestion";
import InjuriesQuestion from "@/components/onboarding/InjuriesQuestion";

// Component to handle smart redirects based on onboarding status
const SmartRedirect = () => {
  const { user } = useUser();
  
  if (user.completedOnboarding) {
    return <Navigate to="/plan" replace />;
  } else {
    return <Navigate to="/onboarding/name" replace />;
  }
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <UserProvider>
        <StatsProvider>
          <WeeklyFeedbackProvider>
            <AppLoader>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  {/* Smart redirect based on onboarding status */}
                  <Route path="/" element={<SmartRedirect />} />
                  
                  {/* Main Routes */}
                  <Route path="/welcome" element={<WelcomePage />} />
                  <Route path="/plan" element={<Plan />} />
                  <Route path="/train" element={<Train />} />
                  <Route path="/stats" element={<Stats />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/edit-profile" element={<EditProfile />} />
                  <Route path="/activities" element={<Activities />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/profile-settings" element={<ProfileSettings />} />
                  <Route path="/configuration" element={<Configuration />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
                  <Route path="/admin" element={<Admin />} />
                  
                  {/* Mobile setup routes */}
                  <Route path="/permissions" element={<PermissionsScreen />} />
                  
                  {/* Onboarding Routes */}
                  <Route path="/onboarding/name" element={<NameQuestion />} />
                  <Route path="/onboarding/age" element={<AgeQuestion />} />
                  <Route path="/onboarding/gender" element={<GenderQuestion />} />
                  <Route path="/onboarding/height" element={<HeightQuestion />} />
                  <Route path="/onboarding/weight" element={<WeightQuestion />} />
                  <Route path="/onboarding/max-distance" element={<MaxDistanceQuestion />} />
                  <Route path="/onboarding/pace" element={<PaceQuestion />} />
                  <Route path="/onboarding/goal" element={<GoalQuestion />} />
                  <Route path="/onboarding/race-preparation" element={<RacePreparationQuestion />} />
                  <Route path="/onboarding/weekly-workouts" element={<WeeklyWorkoutsQuestion />} />
                  <Route path="/onboarding/experience" element={<ExperienceQuestion />} />
                  <Route path="/onboarding/injuries" element={<InjuriesQuestion />} />
                  
                  {/* Catch-all and redirect */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
                
                {/* Weekly Feedback Modal - Global */}
                <WeeklyFeedbackModal />
                
                {/* Development Testing Component */}
                <WeeklyFeedbackTester />
              </BrowserRouter>
            </AppLoader>
          </WeeklyFeedbackProvider>
        </StatsProvider>
      </UserProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
