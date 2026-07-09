import PageLayout from "../components/layout/PageLayout";

import ComingSoonCard from "../components/layout/ComingSoonCard";

function Jobs() {
  return (
    <PageLayout
      title="Jobs"
      subtitle="Track applications and discover opportunities."
    >

      <ComingSoonCard
        title="Job Tracker"
        description="Internships, placements and job application tracking."
      />

    </PageLayout>
  );
}

export default Jobs;