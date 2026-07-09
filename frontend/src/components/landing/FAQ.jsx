import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

function FAQ() {
  const faqs = [
    {
      question: "What is CareerForge?",
      answer:
        "CareerForge is an AI-powered career development platform that helps students analyze resumes, identify skill gaps, follow personalized learning roadmaps, build projects, and prepare for interviews.",
    },
    {
      question: "Is CareerForge free to use?",
      answer:
        "Yes. The core features will be free for students. Premium AI features may be introduced in the future.",
    },
    {
      question: "Which careers are supported?",
      answer:
        "CareerForge is designed to support Software Engineering, Data Science, AI/ML, Cybersecurity, Cloud Computing, DevOps, Full Stack Development, and many more technology careers.",
    },
    {
      question: "Can beginners use CareerForge?",
      answer:
        "Absolutely. Whether you're just starting or preparing for placements, CareerForge creates a roadmap based on your current skill level.",
    },
    {
      question: "How does the AI help me?",
      answer:
        "The AI analyzes your resume, detects missing skills, recommends learning resources, suggests projects, and helps prepare you for interviews.",
    },
  ];

  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section
      id="faq"
      className="bg-black text-white py-28 px-8"
    >
      <div className="max-w-5xl mx-auto">

        <div className="text-center">

          <p className="text-blue-500 uppercase tracking-[6px] font-semibold">
            FAQ
          </p>

          <h2 className="text-5xl md:text-6xl font-bold mt-5">
            Frequently Asked Questions
          </h2>

          <p className="text-gray-400 mt-8 text-lg leading-8">
            Everything you need to know before getting started with CareerForge.
          </p>

        </div>

        <div className="mt-20 space-y-5">

          {faqs.map((faq, index) => (
            <div
              key={index}
              className="rounded-2xl border border-gray-800 bg-gray-900"
            >

              <button
                onClick={() =>
                  setOpenIndex(openIndex === index ? -1 : index)
                }
                className="w-full flex justify-between items-center p-6 text-left"
              >

                <span className="text-xl font-semibold">
                  {faq.question}
                </span>

                {openIndex === index ? (
                  <ChevronUp />
                ) : (
                  <ChevronDown />
                )}

              </button>

              {openIndex === index && (
                <div className="px-6 pb-6 text-gray-400 leading-8">
                  {faq.answer}
                </div>
              )}

            </div>
          ))}

        </div>

      </div>
    </section>
  );
}

export default FAQ;