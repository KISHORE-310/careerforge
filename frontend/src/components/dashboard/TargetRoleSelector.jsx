import { Briefcase } from "lucide-react";
import { roles } from "../../data/roles";

function TargetRoleSelector({
  targetRole,
  setTargetRole,
}) {
  return (
    <div className="mt-10 rounded-3xl border border-zinc-800 bg-gradient-to-br from-[#18181B] to-[#111111] p-8">

      {/* Header */}

      <div className="flex items-center gap-4">

        <div className="rounded-2xl bg-red-500/10 p-3">

          <Briefcase
            size={28}
            className="text-red-400"
          />

        </div>

        <div>

          <h2 className="text-3xl font-bold text-white">
            Career Goal
          </h2>

          <p className="mt-1 text-zinc-400">
            Select your dream role to receive personalized AI analysis.
          </p>

        </div>

      </div>

      {/* Dropdown */}

      <div className="mt-8">

        <label className="block mb-3 text-zinc-300 font-medium">
          Target Role
        </label>

        <select
          value={targetRole}
          onChange={(e) => setTargetRole(e.target.value)}
          className="
            w-full
            rounded-xl
            border
            border-zinc-700
            bg-zinc-900
            px-5
            py-4
            text-white
            outline-none
            transition
            focus:border-red-500
          "
        >

          {roles.map((role) => (

            <option
              key={role}
              value={role}
            >
              {role}
            </option>

          ))}

        </select>

      </div>

    </div>
  );
}

export default TargetRoleSelector;