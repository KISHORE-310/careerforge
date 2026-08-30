const API_URL = "";

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// -----------------------------
// Auth & Profile
// -----------------------------

export async function login(formData) {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });
  return await response.json();
}

export async function signup(formData) {
  const response = await fetch(`${API_URL}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });
  return await response.json();
}

export async function getProfile() {
  const response = await fetch(`${API_URL}/api/profile`, {
    headers: { ...getAuthHeaders() },
  });
  return await response.json();
}

export async function updateProfile(data) {
  const response = await fetch(`${API_URL}/api/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(data),
  });
  return await response.json();
}

export async function completeOnboarding(data) {
  const response = await fetch(`${API_URL}/api/onboarding`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(data),
  });
  return await response.json();
}

// -----------------------------
// Resume Studio & ATS
// -----------------------------

export async function getResume() {
  const response = await fetch(`${API_URL}/api/resume`, {
    headers: { ...getAuthHeaders() },
  });
  return await response.json();
}

export async function saveResume(resume) {
  const response = await fetch(`${API_URL}/api/resume`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ resume }),
  });
  return await response.json();
}

export async function uploadResume(file, targetRole) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("target_role", targetRole || "Senior Full Stack Engineer");

  const response = await fetch(`${API_URL}/api/upload-resume`, {
    method: "POST",
    headers: { ...getAuthHeaders() },
    body: formData,
  });
  return await response.json();
}

export async function aiRewriteResume(payload) {
  const response = await fetch(`${API_URL}/api/resume/ai-rewrite`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
  });
  return await response.json();
}

// -----------------------------
// Jobs & Companies
// -----------------------------

export async function getJobs(params = {}) {
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`${API_URL}/api/jobs?${query}`);
  return await response.json();
}

export async function getJobDetail(jobId) {
  const response = await fetch(`${API_URL}/api/jobs/${jobId}`, {
    headers: { ...getAuthHeaders() },
  });
  return await response.json();
}

export async function getCompanies() {
  const response = await fetch(`${API_URL}/api/companies`);
  return await response.json();
}

export async function getMarketTrends() {
  const response = await fetch(`${API_URL}/api/market`);
  return await response.json();
}

// -----------------------------
// Application AI & Tracker
// -----------------------------

export async function getApplications() {
  const response = await fetch(`${API_URL}/api/applications`, {
    headers: { ...getAuthHeaders() },
  });
  return await response.json();
}

export async function addApplication(payload) {
  const response = await fetch(`${API_URL}/api/applications`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
  });
  return await response.json();
}

export async function updateApplication(id, payload) {
  const response = await fetch(`${API_URL}/api/applications/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
  });
  return await response.json();
}

export async function deleteApplication(id) {
  const response = await fetch(`${API_URL}/api/applications/${id}`, {
    method: "DELETE",
    headers: { ...getAuthHeaders() },
  });
  return await response.json();
}

export async function generateApplicationAI(payload) {
  const response = await fetch(`${API_URL}/api/application-ai/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
  });
  return await response.json();
}

// -----------------------------
// Skills, Roadmap & Learning
// -----------------------------

export async function getSkills() {
  const response = await fetch(`${API_URL}/api/skills`, {
    headers: { ...getAuthHeaders() },
  });
  return await response.json();
}

export async function updateSkills(skills) {
  const response = await fetch(`${API_URL}/api/skills`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ skills }),
  });
  return await response.json();
}

export async function getRoadmap() {
  const response = await fetch(`${API_URL}/api/roadmap`, {
    headers: { ...getAuthHeaders() },
  });
  return await response.json();
}

export async function updateRoadmap(roadmap) {
  const response = await fetch(`${API_URL}/api/roadmap`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ roadmap }),
  });
  return await response.json();
}

export async function getLearning() {
  const response = await fetch(`${API_URL}/api/learning`, {
    headers: { ...getAuthHeaders() },
  });
  return await response.json();
}

export async function updateLearningProgress(id, payload) {
  const response = await fetch(`${API_URL}/api/learning/${id}/progress`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
  });
  return await response.json();
}

// -----------------------------
// Interview Lab & Coding
// -----------------------------

export async function getInterviews() {
  const response = await fetch(`${API_URL}/api/interviews`, {
    headers: { ...getAuthHeaders() },
  });
  return await response.json();
}

export async function startInterview(payload) {
  const response = await fetch(`${API_URL}/api/interviews/start`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
  });
  return await response.json();
}

export async function respondInterview(sessionId, answer) {
  const response = await fetch(`${API_URL}/api/interviews/${sessionId}/respond`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ answer }),
  });
  return await response.json();
}

export async function completeInterview(sessionId, payload) {
  const response = await fetch(`${API_URL}/api/interviews/${sessionId}/complete`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
  });
  return await response.json();
}

export async function reviewCode(payload) {
  const response = await fetch(`${API_URL}/api/coding/review`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
  });
  return await response.json();
}

// -----------------------------
// Career Coach & Notifications
// -----------------------------

export async function askCareerCoach(message, history = []) {
  const response = await fetch(`${API_URL}/api/coach/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ message, history }),
  });
  return await response.json();
}

export async function getNotifications() {
  const response = await fetch(`${API_URL}/api/notifications`, {
    headers: { ...getAuthHeaders() },
  });
  return await response.json();
}

export async function markAllNotificationsRead() {
  const response = await fetch(`${API_URL}/api/notifications/read-all`, {
    method: "PUT",
    headers: { ...getAuthHeaders() },
  });
  return await response.json();
}

export async function getProgressAnalytics() {
  const response = await fetch(`${API_URL}/api/progress/analytics`, {
    headers: { ...getAuthHeaders() },
  });
  return await response.json();
}

// -----------------------------
// DSA Tracker
// -----------------------------

export async function getDSAProgress() {
  const response = await fetch(`${API_URL}/dsa/progress`, {
    headers: { ...getAuthHeaders() },
  });
  return await response.json();
}

export async function updateDSAProgress(topicSlug, problemSlug, payload) {
  const response = await fetch(`${API_URL}/dsa/progress/${topicSlug}/${problemSlug}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
  });
  return await response.json();
}

export async function resetDSAProgress() {
  const response = await fetch(`${API_URL}/dsa/progress`, {
    method: "DELETE",
    headers: { ...getAuthHeaders() },
  });
  return await response.json();
}
