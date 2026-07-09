import {
  CheckCircle,
  XCircle,
} from "lucide-react";

function WhyCareerForge() {
  const comparisons = [
    {
      feature: "Personalized Learning Roadmap",
      careerforge: true,
      traditional: false,
    },
    {
      feature: "AI Resume Analysis",
      careerforge: true,
      traditional: false,
    },
    {
      feature: "Project Recommendations",
      careerforge: true,
      traditional: false,
    },
    {
      feature: "Interview Preparation",
      careerforge: true,
      traditional: false,
    },
    {
      feature: "Career Readiness Tracking",
      careerforge: true,
      traditional: false,
    },
    {
      feature: "Everything In One Platform",
      careerforge: true,
      traditional: false,
    },
  ];

  return (
    <section
      id="why-careerforge"
      className="bg-[#030712] text-white py-28 px-8"
    >
      <div className="max-w-7xl mx-auto">

        {/* Heading */}

        <div className="text-center">

          <p className="text-blue-500 uppercase tracking-[6px] font-semibold">
            WHY CAREERFORGE
          </p>

          <h2 className="text-5xl md:text-6xl font-bold mt-5">
            Stop Learning Randomly.
            <br />
            Start Learning Smart.
          </h2>

          <p className="text-gray-400 text-lg max-w-3xl mx-auto mt-8 leading-8">
            Instead of switching between multiple websites, CareerForge brings
            resume analysis, learning roadmaps, projects, interview preparation,
            and progress tracking into one intelligent platform.
          </p>

        </div>

        {/* Comparison */}

        <div className="mt-20 overflow-hidden rounded-3xl border border-gray-800">

          <table className="w-full">

            <thead className="bg-gray-900">

              <tr>

                <th className="text-left p-6 text-xl">
                  Feature
                </th>

                <th className="p-6 text-xl text-blue-500">
                  CareerForge
                </th>

                <th className="p-6 text-xl text-gray-400">
                  Traditional Learning
                </th>

              </tr>

            </thead>

            <tbody>

              {comparisons.map((item, index) => (

                <tr
                  key={index}
                  className="border-t border-gray-800 hover:bg-gray-900 transition"
                >

                  <td className="p-6 text-lg">
                    {item.feature}
                  </td>

                  <td className="text-center">

                    {item.careerforge ? (
                      <CheckCircle
                        className="mx-auto text-green-500"
                        size={28}
                      />
                    ) : (
                      <XCircle
                        className="mx-auto text-red-500"
                        size={28}
                      />
                    )}

                  </td>

                  <td className="text-center">

                    {item.traditional ? (
                      <CheckCircle
                        className="mx-auto text-green-500"
                        size={28}
                      />
                    ) : (
                      <XCircle
                        className="mx-auto text-red-500"
                        size={28}
                      />
                    )}

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>
    </section>
  );
}

export default WhyCareerForge;