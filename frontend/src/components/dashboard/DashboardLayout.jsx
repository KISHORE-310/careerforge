import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

function DashboardLayout({ children }) {
  return (
    <div className="flex h-screen bg-[#0A0A0A] overflow-hidden">

      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">

        <Topbar />

        <main className="flex-1 overflow-y-auto overflow-x-hidden p-8">

          <div className="max-w-7xl mx-auto">

            {children}

          </div>

        </main>

      </div>

    </div>
  );
}

export default DashboardLayout;