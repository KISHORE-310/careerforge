class ResumeNormalizer:

    def normalize(self, data: dict) -> dict:

        # -------------------------
        # Education
        # -------------------------
        education = []

        for edu in data.get("education", []):

            if isinstance(edu, str):

                education.append({
                    "degree": edu,
                    "institution": None,
                    "field_of_study": None,
                    "start_year": None,
                    "end_year": None,
                    "cgpa": None
                })

            else:

                education.append(edu)

        data["education"] = education

        # -------------------------
        # Experience
        # -------------------------
        for exp in data.get("experience", []):

            if "title" in exp and "role" not in exp:
                exp["role"] = exp.pop("title")

            if "description" in exp:

                if isinstance(exp["description"], str):
                    exp["description"] = [exp["description"]]

        # -------------------------
        # Certifications
        # -------------------------
        converted = []

        for cert in data.get("certifications", []):

            if isinstance(cert, str):

                converted.append({
                    "name": cert,
                    "organization": None,
                    "year": None
                })

            else:

                if "issuer" in cert:
                    cert["organization"] = cert.pop("issuer")

                if "date" in cert:
                    cert.pop("date")

                converted.append(cert)

        data["certifications"] = converted

        return data