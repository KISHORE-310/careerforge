const API_URL = "http://127.0.0.1:8000";

function getAuthHeaders() {
  const token = localStorage.getItem("token");

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
}

// -----------------------------
// Login
// -----------------------------

export async function login(formData) {

  const response = await fetch(
    `${API_URL}/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    }
  );

  return await response.json();

}

// -----------------------------
// Signup
// -----------------------------

export async function signup(formData) {

  const response = await fetch(
    `${API_URL}/signup`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    }
  );

  return await response.json();

}

// -----------------------------
// Upload Resume
// -----------------------------

export async function uploadResume(file, targetRole) {

  const formData = new FormData();

  formData.append("file", file);
  formData.append("target_role", targetRole);

  const response = await fetch(
    `${API_URL}/upload-resume`,
    {
      method: "POST",
      body: formData,
    }
  );

  return await response.json();

}

// -----------------------------
// DSA Tracker
// -----------------------------

export async function getDSAProgress() {
  const response = await fetch(
    `${API_URL}/dsa/progress`,
    {
      headers: {
        ...getAuthHeaders(),
      },
    }
  );

  return await response.json();
}

export async function updateDSAProgress(topicSlug, problemSlug, payload) {
  const response = await fetch(
    `${API_URL}/dsa/progress/${topicSlug}/${problemSlug}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(payload),
    }
  );

  return await response.json();
}

export async function resetDSAProgress() {
  const response = await fetch(
    `${API_URL}/dsa/progress`,
    {
      method: "DELETE",
      headers: {
        ...getAuthHeaders(),
      },
    }
  );

  return await response.json();
}
