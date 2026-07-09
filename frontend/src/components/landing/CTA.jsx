import Button from "../common/Button";

function CTA() {
  return (
    <section
      id="cta"
      className="bg-[#030712] text-white py-32 px-8"
    >
      <div className="max-w-5xl mx-auto">

        <div className="rounded-[40px] border border-gray-800 bg-gradient-to-r from-blue-600/20 via-gray-900 to-blue-600/20 p-16 text-center">

          <h2 className="text-5xl md:text-6xl font-bold leading-tight">
            Ready To Build
            <br />
            Your Dream Career?
          </h2>

          <p className="mt-8 text-lg text-gray-300 max-w-3xl mx-auto leading-8">
            Analyze your resume, discover your skill gaps, build real-world
            projects, prepare for interviews, and become job-ready—all from one
            AI-powered platform.
          </p>

          <div className="flex flex-wrap justify-center gap-5 mt-12">

            <Button>
              Get Started Free
            </Button>

            <Button variant="secondary">
              Explore Features
            </Button>

          </div>

        </div>

      </div>
    </section>
  );
}

export default CTA;