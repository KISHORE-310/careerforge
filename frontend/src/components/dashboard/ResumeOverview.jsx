import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
} from "lucide-react";

function ResumeOverview({ profile }) {

  if (!profile) return null;

  return (

    <div className="mt-10 rounded-3xl border border-zinc-800 bg-gradient-to-br from-[#18181B] to-[#111111] p-8">

      {/* Header */}

      <div className="flex items-center gap-4">

        <div className="rounded-2xl bg-red-500/10 p-3">

          <User
            className="text-red-400"
            size={28}
          />

        </div>

        <div>

          <h2 className="text-3xl font-bold text-white">
            Resume Overview
          </h2>

          <p className="text-zinc-400 mt-1">
            Basic information extracted from your resume.
          </p>

        </div>

      </div>

      {/* Profile */}

      <div className="grid lg:grid-cols-2 gap-6 mt-10">

        <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-5">

          <div className="flex items-center gap-3">

            <User className="text-red-400" />

            <div>

              <p className="text-zinc-500 text-sm">
                Full Name
              </p>

              <p className="text-white font-semibold text-lg">
                {profile.personal_info?.full_name || "-"}
              </p>

            </div>

          </div>

        </div>

        <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-5">

          <div className="flex items-center gap-3">

            <Mail className="text-red-400" />

            <div>

              <p className="text-zinc-500 text-sm">
                Email
              </p>

              <p className="text-white font-semibold">
                {profile.personal_info?.email || "-"}
              </p>

            </div>

          </div>

        </div>

        <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-5">

          <div className="flex items-center gap-3">

            <Phone className="text-red-400" />

            <div>

              <p className="text-zinc-500 text-sm">
                Phone
              </p>

              <p className="text-white font-semibold">
                {profile.personal_info?.phone || "-"}
              </p>

            </div>

          </div>

        </div>

        <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-5">

          <div className="flex items-center gap-3">

            <MapPin className="text-red-400" />

            <div>

              <p className="text-zinc-500 text-sm">
                Location
              </p>

              <p className="text-white font-semibold">
                {profile.personal_info?.location || "-"}
              </p>

            </div>

          </div>

        </div>

      </div>

      {/* Summary */}

      <div className="mt-10 rounded-2xl bg-zinc-900 border border-zinc-800 p-6">

        <h3 className="text-xl font-bold text-white flex items-center gap-3">

          <Briefcase className="text-red-400" />

          Professional Summary

        </h3>

        <p className="mt-5 text-zinc-300 leading-8">

          {profile.summary || "No summary found."}

        </p>

      </div>

      {/* Education */}

      <div className="mt-10">

        <h3 className="text-xl font-bold text-white flex items-center gap-3">

          <GraduationCap className="text-red-400" />

          Education

        </h3>

        <div className="space-y-5 mt-6">

          {profile.education?.map((edu, index) => (

            <div
              key={index}
              className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5"
            >

              <h4 className="text-lg font-semibold text-white">
                {edu.degree}
              </h4>

              <p className="text-zinc-400 mt-2">
                {edu.institution}
              </p>

            </div>

          ))}

        </div>

      </div>

    </div>

  );

}

export default ResumeOverview;