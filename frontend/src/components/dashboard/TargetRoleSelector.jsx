import { Briefcase } from "lucide-react";
import { roles } from "../../data/roles";

function TargetRoleSelector({ targetRole, setTargetRole }) {
  return (
    <div className="rounded-xl border border-stone-800 bg-[#0e0e0e] p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#d4af37]/10 border border-[#d4af37]/20 flex items-center justify-center text-[#d4af37]">
          <Briefcase size={16} />
        </div>
        <div>
          <h2 className="text-sm font-normal text-stone-100">
            Target Engineering Role
          </h2>
          <p className="text-xs text-stone-500 font-light">
            Select role to calibrate ATS scoring and roadmap.
          </p>
        </div>
      </div>

      <div>
        <select
          value={targetRole}
          onChange={(e) => setTargetRole(e.target.value)}
          className="w-full rounded-lg border border-stone-800 bg-[#141414] px-3.5 py-2.5 text-xs text-stone-200 outline-none transition focus:border-[#d4af37]/60 font-light cursor-pointer"
        >
          {roles.map((role) => (
            <option key={role} value={role} className="bg-[#141414] text-stone-200">
              {role}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default TargetRoleSelector;