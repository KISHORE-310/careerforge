const API_URL = "";

function getAuthHeaders() {
  const token = localStorage.getItem("token") || "demo_jwt_token_careerforge";
  return { Authorization: `Bearer ${token}` };
}

async function handleResponse(response) {
  try {
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const text = await response.text();
      if (!text || !text.trim()) {
        return { success: response.ok, status: response.status };
      }
      return JSON.parse(text);
    }

    const rawText = await response.text();
    return {
      success: response.ok,
      status: response.status,
      message: response.ok ? "Success" : `Server returned status ${response.status}`,
      raw: rawText.slice(0, 200),
    };
  } catch (err) {
    return {
      success: false,
      message: "Unable to parse server response",
      error: err.message,
    };
  }
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
  return await handleResponse(response);
}

export async function signup(formData) {
  const response = await fetch(`${API_URL}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });
  return await handleResponse(response);
}

export async function getProfile() {
  const response = await fetch(`${API_URL}/api/profile`, {
    headers: { ...getAuthHeaders() },
  });
  return await handleResponse(response);
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
  return await handleResponse(response);
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
  return await handleResponse(response);
}

// -----------------------------
// Resume Studio & ATS
// -----------------------------

export async function getResume() {
  const response = await fetch(`${API_URL}/api/resume`, {
    headers: { ...getAuthHeaders() },
  });
  return await handleResponse(response);
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
  return await handleResponse(response);
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
  return await handleResponse(response);
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
  return await handleResponse(response);
}

// -----------------------------
// Jobs & Companies
// -----------------------------

export async function getJobs(params = {}) {
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`${API_URL}/api/jobs?${query}`);
  return await handleResponse(response);
}

export async function getJobDetail(jobId) {
  const response = await fetch(`${API_URL}/api/jobs/${jobId}`, {
    headers: { ...getAuthHeaders() },
  });
  return await handleResponse(response);
}

export async function getCompanies() {
  const response = await fetch(`${API_URL}/api/companies`);
  return await handleResponse(response);
}

export async function getMarketTrends() {
  const response = await fetch(`${API_URL}/api/market`);
  return await handleResponse(response);
}

// -----------------------------
// Application AI & Tracker
// -----------------------------

export async function getApplications() {
  const response = await fetch(`${API_URL}/api/applications`, {
    headers: { ...getAuthHeaders() },
  });
  return await handleResponse(response);
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
  return await handleResponse(response);
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
  return await handleResponse(response);
}

export async function deleteApplication(id) {
  const response = await fetch(`${API_URL}/api/applications/${id}`, {
    method: "DELETE",
    headers: { ...getAuthHeaders() },
  });
  return await handleResponse(response);
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
  return await handleResponse(response);
}

// -----------------------------
// Skills, Roadmap & Learning
// -----------------------------

export async function getSkills() {
  const response = await fetch(`${API_URL}/api/skills`, {
    headers: { ...getAuthHeaders() },
  });
  return await handleResponse(response);
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
  return await handleResponse(response);
}

export async function getRoadmap() {
  const response = await fetch(`${API_URL}/api/roadmap`, {
    headers: { ...getAuthHeaders() },
  });
  return await handleResponse(response);
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
  return await handleResponse(response);
}

export async function getLearning() {
  const response = await fetch(`${API_URL}/api/learning`, {
    headers: { ...getAuthHeaders() },
  });
  return await handleResponse(response);
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
  return await handleResponse(response);
}

// -----------------------------
// Interview Lab & Coding
// -----------------------------

export async function getInterviews() {
  const response = await fetch(`${API_URL}/api/interviews`, {
    headers: { ...getAuthHeaders() },
  });
  return await handleResponse(response);
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
  return await handleResponse(response);
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
  return await handleResponse(response);
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
  return await handleResponse(response);
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
  return await handleResponse(response);
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
  return await handleResponse(response);
}

export async function getNotifications() {
  const response = await fetch(`${API_URL}/api/notifications`, {
    headers: { ...getAuthHeaders() },
  });
  return await handleResponse(response);
}

export async function markAllNotificationsRead() {
  const response = await fetch(`${API_URL}/api/notifications/read-all`, {
    method: "PUT",
    headers: { ...getAuthHeaders() },
  });
  return await handleResponse(response);
}

export async function getProgressAnalytics() {
  const response = await fetch(`${API_URL}/api/progress/analytics`, {
    headers: { ...getAuthHeaders() },
  });
  return await handleResponse(response);
}

// -----------------------------
// DSA Tracker
// -----------------------------

export async function getDSAProgress() {
  const response = await fetch(`${API_URL}/api/dsa/progress`, {
    headers: { ...getAuthHeaders() },
  });
  return await handleResponse(response);
}

export async function updateDSAProgress(topicSlug, problemSlug, payload) {
  const response = await fetch(`${API_URL}/api/dsa/progress/${topicSlug}/${problemSlug}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
  });
  return await handleResponse(response);
}

export async function resetDSAProgress() {
  const response = await fetch(`${API_URL}/api/dsa/progress`, {
    method: "DELETE",
    headers: { ...getAuthHeaders() },
  });
  return await handleResponse(response);
}

export async function submitDSAProblem(payload) {
  const response = await fetch(`${API_URL}/api/dsa/submit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
  });
  return await handleResponse(response);
}

