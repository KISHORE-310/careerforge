import os

print("Current folder:", os.getcwd())
print("PDF exists:", os.path.exists("sample_resume.pdf"))
import fitz

from ai.parsers.resume_parser import ResumeParser


PDF_PATH = "sample_resume.pdf"


document = fitz.open(PDF_PATH)

text = ""

for page in document:
    text += page.get_text()

document.close()


parser = ResumeParser()

profile = parser.parse_resume(text)

print(profile.model_dump_json(indent=4))