import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute";

const Landing = lazy(() => import("./pages/Landing"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Jobs = lazy(() => import("./pages/Jobs"));
const Companies = lazy(() => import("./pages/Companies"));
const MarketIntelligence = lazy(() => import("./pages/MarketIntelligence"));
const Resume = lazy(() => import("./pages/Resume"));
const ApplicationAI = lazy(() => import("./pages/ApplicationAI"));
const Skills = lazy(() => import("./pages/Skills"));
const Roadmap = lazy(() => import("./pages/Roadmap"));
const Learning = lazy(() => import("./pages/Learning"));
const Interviews = lazy(() => import("./pages/Interviews"));
const DSATracker = lazy(() => import("./pages/DSATracker"));
const DSATopic = lazy(() => import("./pages/DSATopic"));
const Applications = lazy(() => import("./pages/Applications"));
const Progress = lazy(() => import("./pages/Progress"));
const CareerCoach = lazy(() => import("./pages/CareerCoach"));
const Profile = lazy(() => import("./pages/Profile"));
const Settings = lazy(() => import("./pages/Settings"));

function App() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#080808] text-white grid place-items-center">Loading CareerForge…</main>}>
    <Routes>
      {/* Public & Onboarding Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route element={<ProtectedRoute />}>
      <Route path="/onboarding" element={<Onboarding />} />

      {/* Command Center */}
      <Route path="/dashboard" element={<Dashboard />} />

      {/* Discover Modules */}
      <Route path="/jobs" element={<Jobs />} />
      <Route path="/companies" element={<Companies />} />
      <Route path="/market" element={<MarketIntelligence />} />

      {/* Build Modules */}
      <Route path="/resume" element={<Resume />} />
      <Route path="/ats" element={<Resume />} />
      <Route path="/application-ai" element={<ApplicationAI />} />

      {/* Develop Modules */}
      <Route path="/skills" element={<Skills />} />
      <Route path="/roadmap" element={<Roadmap />} />
      <Route path="/learning" element={<Learning />} />

      {/* Prepare Modules */}
      <Route path="/interviews" element={<Interviews />} />
      <Route path="/dsa" element={<DSATracker />} />
      <Route path="/dsa/:topic" element={<DSATopic />} />

      {/* Track & Analytics Modules */}
      <Route path="/applications" element={<Applications />} />
      <Route path="/progress" element={<Progress />} />

      {/* Advisory & Account */}
      <Route path="/coach" element={<CareerCoach />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/settings" element={<Settings />} />
      </Route>

      {/* Catch-all Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
    </Suspense>
  );
}

export default App;
