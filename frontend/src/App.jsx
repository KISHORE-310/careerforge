import { Routes, Route, Navigate } from "react-router-dom";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

import Dashboard from "./pages/Dashboard";
import Resume from "./pages/Resume";
import ATS from "./pages/ATS";
import Roadmap from "./pages/Roadmap";
import Jobs from "./pages/Jobs";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";

import DSATracker from "./pages/DSATracker";
import DSATopic from "./pages/DSATopic";

function App() {
  return (
    <Routes>

      {/* Public Routes */}

      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Dashboard */}

      <Route path="/dashboard" element={<Dashboard />} />

      {/* Resume */}

      <Route path="/resume" element={<Resume />} />

      {/* ATS */}

      <Route path="/ats" element={<ATS />} />

      {/* Roadmap */}

      <Route path="/roadmap" element={<Roadmap />} />

      {/* DSA */}

      <Route path="/dsa" element={<DSATracker />} />

      <Route
        path="/dsa/:topic"
        element={<DSATopic />}
      />

      {/* Jobs */}

      <Route path="/jobs" element={<Jobs />} />

      {/* Profile */}

      <Route path="/profile" element={<Profile />} />

      {/* Settings */}

      <Route path="/settings" element={<Settings />} />

      {/* Redirect */}

      <Route
        path="*"
        element={<Navigate to="/dashboard" />}
      />

    </Routes>
  );
}

export default App;