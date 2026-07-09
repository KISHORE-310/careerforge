import DashboardLayout from "../dashboard/DashboardLayout";

function PageLayout({
  title,
  subtitle,
  children,
}) {
  return (
    <DashboardLayout>

      <div className="mb-10">

        <h1 className="text-4xl font-bold text-white">
          {title}
        </h1>

        <p className="mt-3 text-zinc-400">
          {subtitle}
        </p>

      </div>

      {children}

    </DashboardLayout>
  );
}

export default PageLayout;