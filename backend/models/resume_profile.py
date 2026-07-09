from pydantic import BaseModel, EmailStr
from typing import List, Optional


# ----------------------------
# Personal Information
# ----------------------------

class PersonalInfo(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    portfolio: Optional[str] = None


# ----------------------------
# Education
# ----------------------------

class Education(BaseModel):
    degree: Optional[str] = None
    institution: Optional[str] = None
    field_of_study: Optional[str] = None
    start_year: Optional[int] = None
    end_year: Optional[int] = None
    cgpa: Optional[float] = None


# ----------------------------
# Experience
# ----------------------------

class Experience(BaseModel):
    company: Optional[str] = None
    role: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    description: List[str] = []


# ----------------------------
# Projects
# ----------------------------

class Project(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    technologies: List[str] = []
    github_url: Optional[str] = None
    live_url: Optional[str] = None


# ----------------------------
# Certifications
# ----------------------------

class Certification(BaseModel):
    name: Optional[str] = None
    organization: Optional[str] = None
    year: Optional[int] = None


# ----------------------------
# Resume Profile
# ----------------------------

class ResumeProfile(BaseModel):

    personal_info: PersonalInfo

    education: List[Education] = []

    experience: List[Experience] = []

    projects: List[Project] = []

    certifications: List[Certification] = []

    technical_skills: List[str] = []

    soft_skills: List[str] = []

    achievements: List[str] = []

    languages: List[str] = []

    summary: Optional[str] = None