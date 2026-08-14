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
    <div className="rounded-xl border border-stone-800 bg-[#0e0e0e] p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#d4af37]/10 border border-[#d4af37]/20 flex items-center justify-center text-[#d4af37]">
          <User size={16} />
        </div>
        <div>
          <h2 className="text-sm font-normal text-stone-100">
            Extracted Profile Metadata
          </h2>
          <p className="text-xs text-stone-500 font-light">
            Parsed attributes from uploaded PDF.
          </p>
        </div>
      </div>

      {/* Profile Details */}
      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-lg bg-[#141414] border border-stone-800/80 p-3 flex items-center gap-2.5">
          <User size={14} className="text-[#d4af37] shrink-0" />
          <div className="min-w-0">
            <span className="text-[10px] text-stone-500 font-light uppercase block">Name</span>
            <p className="text-xs font-normal text-stone-200 truncate">
              {profile.personal_info?.full_name || "Not specified"}
            </p>
          </div>
        </div>

        <div className="rounded-lg bg-[#141414] border border-stone-800/80 p-3 flex items-center gap-2.5">
          <Mail size={14} className="text-[#d4af37] shrink-0" />
          <div className="min-w-0">
            <span className="text-[10px] text-stone-500 font-light uppercase block">Email</span>
            <p className="text-xs font-normal text-stone-200 truncate">
              {profile.personal_info?.email || "Not specified"}
            </p>
          </div>
        </div>

        <div className="rounded-lg bg-[#141414] border border-stone-800/80 p-3 flex items-center gap-2.5">
          <Phone size={14} className="text-[#d4af37] shrink-0" />
          <div className="min-w-0">
            <span className="text-[10px] text-stone-500 font-light uppercase block">Phone</span>
            <p className="text-xs font-normal text-stone-200 truncate">
              {profile.personal_info?.phone || "Not specified"}
            </p>
          </div>
        </div>

        <div className="rounded-lg bg-[#141414] border border-stone-800/80 p-3 flex items-center gap-2.5">
          <MapPin size={14} className="text-[#d4af37] shrink-0" />
          <div className="min-w-0">
            <span className="text-[10px] text-stone-500 font-light uppercase block">Location</span>
            <p className="text-xs font-normal text-stone-200 truncate">
              {profile.personal_info?.location || "Not specified"}
            </p>
          </div>
        </div>
      </div>

      {/* Summary */}
      {profile.summary && (
        <div className="rounded-lg bg-[#141414] border border-stone-800/80 p-4 space-y-1.5">
          <span className="text-xs font-normal text-stone-300 flex items-center gap-1.5">
            <Briefcase size={13} className="text-[#d4af37]" />
            Professional Summary
          </span>
          <p className="text-xs text-stone-400 leading-relaxed font-light">
            {profile.summary}
          </p>
        </div>
      )}

      {/* Education */}
      {profile.education?.length > 0 && (
        <div className="space-y-2.5">
          <span className="text-xs font-normal text-stone-300 flex items-center gap-1.5">
            <GraduationCap size={13} className="text-[#d4af37]" />
            Education
          </span>

          <div className="grid sm:grid-cols-2 gap-3">
            {profile.education.map((edu, index) => (
              <div key={index} className="rounded-lg border border-stone-800 bg-[#141414] p-3">
                <p className="text-xs font-normal text-stone-200">{edu.degree}</p>
                <p className="text-[11px] text-stone-500 font-light mt-0.5">{edu.institution}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ResumeOverview;