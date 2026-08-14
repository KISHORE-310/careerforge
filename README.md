# CareerForge

CareerForge is a web application for resume analysis, role-based skill evaluation, and technical interview preparation tracking.

## System Overview

The system consists of two primary components:

1. Backend: A Python FastAPI service that processes uploaded resumes, performs applicant tracking system (ATS) compatibility scoring, identifies skill gaps, and manages user data.
2. Frontend: A React single-page application built with Vite that provides user interfaces for dashboard analytics, resume uploads, skill roadmaps, and DSA practice tracking.

## Architecture

### Backend
- Framework: FastAPI
- Database: MongoDB (stores user credentials, uploaded resume profiles, and DSA progress)
- Authentication: JSON Web Tokens (JWT) with HMAC-SHA256 signature and bcrypt password hashing
- Resume Processing: PyMuPDF for text extraction from PDF files
- AI Provider: Google Gemini API for structured data extraction and custom career roadmaps

### Frontend
- Framework: React 18
- Build Tool: Vite
- Routing: React Router DOM
- Styling: Plain CSS
- State and Storage: Browser LocalStorage for JWT session management

## Key Features

### 1. Resume Parsing and Scoring
- Reads PDF resume uploads and converts raw text into structured schema objects.
- Analyzes completeness of experience, education, projects, and technical skills.
- Produces a resume quality score based on structure and quantifiable achievements.

### 2. ATS Keyword Match and Skill Gap Analysis
- Evaluates extracted candidate skills against required technical competencies for target roles.
- Calculates compatibility percentage.
- Identifies matching skills and flags missing qualifications.

### 3. Career Roadmaps
- Provides structured multi-week study plans for engineering disciplines including Backend, Frontend, Full Stack, Data Science, and DevOps.

### 4. DSA Practice Tracker
- Tracks practice problem status, bookmarks, and personal notes across topics such as Arrays, Trees, Graphs, Dynamic Programming, and System Design.
- Persists user progress per account in MongoDB.

### 5. User Authentication
- Supports user registration and login.
- Secures private endpoints using Bearer token authentication headers.

## Directory Structure

```text
careerforge/
├── backend/
│   ├── ai/               # AI prompts, normalizers, parsers, and role definitions
│   ├── config/           # Environment variable loading and application settings
│   ├── database/         # MongoDB client and connection lifecycle
│   ├── intelligence/     # ATS scoring, resume scoring, and skill gap engines
│   ├── models/           # Pydantic data schemas
│   ├── routes/           # FastAPI API route handlers
│   ├── services/         # Business logic and database operations
│   └── main.py           # Application entrypoint
└── frontend/
    ├── src/
    │   ├── components/   # Reusable UI components
    │   ├── pages/        # Route page views (Dashboard, Resume, ATS, DSA, Auth)
    │   ├── services/     # Frontend API client methods
    │   ├── App.jsx       # Route registry
    │   └── main.jsx      # React root rendering
    ├── index.html        # HTML entrypoint
    └── package.json      # Node dependencies and scripts
```

## Setup and Installation

### Prerequisites
- Python 3.10 or higher
- Node.js 18 or higher
- MongoDB instance (Local or MongoDB Atlas)
- Google Gemini API key

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd careerforge/backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure environment variables in `.env`:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   DATABASE_NAME=careerforge
   SECRET_KEY=your_jwt_secret_key
   JWT_ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=60
   GEMINI_API_KEY=your_gemini_api_key
   GEMINI_MODEL=gemini-2.5-flash
   ```

5. Start the API server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd careerforge/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open `http://localhost:5173` in a web browser.

## API Reference

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| GET | `/` | Health check | No |
| GET | `/db-test` | Database connectivity test | No |
| POST | `/signup` | Register a new user | No |
| POST | `/login` | Authenticate user and receive JWT | No |
| POST | `/upload-resume` | Upload PDF resume for parsing and ATS analysis | No |
| GET | `/dsa/progress` | Fetch saved DSA progress for authenticated user | Yes |
| PUT | `/dsa/progress/{topic}/{problem}` | Update problem status and notes | Yes |
| DELETE | `/dsa/progress` | Reset user DSA progress | Yes |
