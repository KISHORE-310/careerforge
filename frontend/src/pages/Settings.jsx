import PageLayout from "../components/layout/PageLayout";

import ComingSoonCard from "../components/layout/ComingSoonCard";

function Settings() {
  return (
    <PageLayout
      title="Settings"
      subtitle="Customize your CareerForge experience."
    >

      <ComingSoonCard
        title="Settings"
        description="Theme, notifications and account preferences."
      />

    </PageLayout>
  );
}

export default Settings;