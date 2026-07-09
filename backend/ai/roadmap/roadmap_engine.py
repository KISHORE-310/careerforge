from ai.skills import RoleRoadmapGenerator

class RoadmapEngine:

    ROADMAPS = {

        "Backend Developer": [

            {
                "week": 1,
                "title": "Java Fundamentals",
                "description": "Master Java syntax, OOP, Collections and Exception Handling."
            },

            {
                "week": 2,
                "title": "SQL & Database",
                "description": "Learn Joins, Indexing, Transactions and Database Design."
            },

            {
                "week": 3,
                "title": "Spring Boot",
                "description": "Build REST APIs, CRUD applications and Authentication."
            },

            {
                "week": 4,
                "title": "Docker",
                "description": "Containerize applications and understand Docker Compose."
            },

            {
                "week": 5,
                "title": "AWS Basics",
                "description": "Deploy applications using EC2, S3 and RDS."
            },

            {
                "week": 6,
                "title": "Capstone Project",
                "description": "Build and deploy a production-ready backend application."
            }

        ],

        "Frontend Developer": [

            {
                "week": 1,
                "title": "HTML & CSS",
                "description": "Master semantic HTML and responsive CSS."
            },

            {
                "week": 2,
                "title": "JavaScript",
                "description": "Understand ES6+, DOM and asynchronous programming."
            },

            {
                "week": 3,
                "title": "React",
                "description": "Build reusable components and manage application state."
            },

            {
                "week": 4,
                "title": "TypeScript",
                "description": "Learn static typing and scalable frontend development."
            },

            {
                "week": 5,
                "title": "Next.js",
                "description": "Understand routing, SSR and API routes."
            },

            {
                "week": 6,
                "title": "Portfolio Project",
                "description": "Develop and deploy a modern frontend application."
            }

        ]

    }

    def generate(self, target_role="Backend Developer"):

        roadmap = self.ROADMAPS.get(target_role)
        if roadmap is None:
            generator = RoleRoadmapGenerator()
            roadmap = generator.generate_roadmap(target_role)
            # Cache the generated roadmap
            self.ROADMAPS[target_role] = roadmap
        return roadmap