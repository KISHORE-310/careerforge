import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

function FAQ() {
  const faqs = [
    {
      question: "How does the ATS keyword evaluation work?",
      answer:
        "CareerForge parses your resume text and compares extracted skill tokens against role-specific requirements, calculating matching percentages and identifying critical missing qualifications.",
    },
    {
      question: "Which technical engineering roles are supported?",
      answer:
        "Standard tracks include Backend, Frontend, Full Stack, Data Science, Machine Learning, DevOps, Cloud Architecture, Mobile Development, and Cybersecurity.",
    },
    {
      question: "How are the custom 6-week roadmaps structured?",
      answer:
        "Roadmaps deliver weekly topics covering fundamental language concepts, database architecture, framework implementations, cloud infrastructure, and capstone project deployment.",
    },
    {
      question: "Can I save my DSA preparation progress?",
      answer:
        "Yes. Authenticated users have their problem statuses (Completed, In Progress, Bookmarked) and personal code notes securely saved in the database.",
    },
  ];

  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section id="faq" className="bg-[#0a0a0a] text-stone-200 py-20 px-6 border-t border-stone-900">
      <div className="max-w-3xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <p className="text-xs uppercase tracking-widest text-[#d4af37] font-light">
            FAQ
          </p>

          <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-white">
            Frequently Asked Questions
          </h2>

          <p className="text-xs sm:text-sm text-stone-400 max-w-md mx-auto leading-relaxed font-light">
            Answers to common questions regarding CareerForge capabilities and architecture.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="rounded-xl border border-[#d4af37]/15 bg-[#0e0e0e] overflow-hidden transition"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
                className="w-full flex justify-between items-center py-4 px-5 text-left hover:bg-[#131313] transition"
              >
                <span className="text-xs sm:text-sm font-normal text-stone-100">
                  {faq.question}
                </span>

                <span className="text-[#d4af37] shrink-0 ml-3">
                  {openIndex === index ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </span>
              </button>

              {openIndex === index && (
                <div className="px-5 pb-4 text-xs text-stone-400 leading-relaxed border-t border-stone-800/60 pt-3 font-light">
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