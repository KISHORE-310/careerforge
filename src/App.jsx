import { Routes, Route, Navigate } from "react-router-dom";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Onboarding from "./pages/Onboarding";

import Dashboard from "./pages/Dashboard";
import Jobs from "./pages/Jobs";
import Companies from "./pages/Companies";
import MarketIntelligence from "./pages/MarketIntelligence";
import Resume from "./pages/Resume";
import ApplicationAI from "./pages/ApplicationAI";
import Skills from "./pages/Skills";
import Roadmap from "./pages/Roadmap";
import Learning from "./pages/Learning";
import Interviews from "./pages/Interviews";
import DSATracker from "./pages/DSATracker";
import DSATopic from "./pages/DSATopic";
import Applications from "./pages/Applications";
import Progress from "./pages/Progress";
import CareerCoach from "./pages/CareerCoach";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";

function App() {
  return (
    <Routes>
      {/* Public & Onboarding Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
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

      {/* Catch-all Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
