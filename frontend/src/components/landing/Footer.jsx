import { Mail } from "lucide-react";

function Footer() {
  return (
    <footer
      id="contact"
      className="bg-black border-t border-gray-800 text-white py-16 px-8"
    >
      <div className="max-w-7xl mx-auto">

        <div className="grid md:grid-cols-4 gap-10">

          {/* Logo */}
          <div>
            <h2 className="text-3xl font-bold">
              Career<span className="text-blue-500">Forge</span>
            </h2>

            <p className="text-gray-400 mt-5 leading-8">
              AI-powered career platform helping students become
              job-ready through resume analysis, personalized
              learning roadmaps, projects, and interview preparation.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-xl mb-5">
              Quick Links
            </h3>

            <div className="space-y-3">

              <a
                href="#home"
                className="block text-gray-400 hover:text-white transition"
              >
                Home
              </a>

              <a
                href="#features"
                className="block text-gray-400 hover:text-white transition"
              >
                Features
              </a>

              <a
                href="#how-it-works"
                className="block text-gray-400 hover:text-white transition"
              >
                How It Works
              </a>

              <a
                href="#faq"
                className="block text-gray-400 hover:text-white transition"
              >
                FAQ
              </a>

            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-xl mb-5">
              Contact
            </h3>

            <div className="flex items-center gap-3 text-gray-400">

              <Mail size={18} />

              <span>
                kishorerdy.1210@gmail.com
              </span>

            </div>
          </div>

          {/* Connect */}
          <div>
            <h3 className="font-bold text-xl mb-5">
              Connect
            </h3>

            <div className="space-y-3">

              <a
                href="#"
                className="block text-gray-400 hover:text-white transition"
              >
                GitHub
              </a>

              <a
                href="#"
                className="block text-gray-400 hover:text-white transition"
              >
                LinkedIn
              </a>

            </div>
          </div>

        </div>

        <div className="border-t border-gray-800 mt-14 pt-8 text-center text-gray-500">
          © 2026 CareerForge. Empowering students with AI-driven career guidance.
        </div>

      </div>
    </footer>
  );
}

export default Footer;