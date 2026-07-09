import PageLayout from "../components/layout/PageLayout";

import ComingSoonCard from "../components/layout/ComingSoonCard";

function Profile() {
  return (
    <PageLayout
      title="Profile"
      subtitle="Manage your CareerForge profile."
    >

      <ComingSoonCard
        title="Profile"
        description="Personal information, resume history and achievements."
      />

    </PageLayout>
  );
}

export default Profile;