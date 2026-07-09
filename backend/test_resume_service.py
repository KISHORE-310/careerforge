import fitz

from ai.parsers.resume_parser import ResumeParser
from services.resume_service import ResumeService

PDF_PATH = "sample_resume.pdf"

# Extract PDF text
document = fitz.open(PDF_PATH)

text = ""

for page in document:
    text += page.get_text()

document.close()

# Parse resume
parser = ResumeParser()

profile = parser.parse_resume(text)

# Save to MongoDB
service = ResumeService()

resume_id = service.save_resume(
    user_email="test@careerforge.ai",
    profile=profile
)

print("\nResume Saved Successfully!")
print("Resume ID:", resume_id)