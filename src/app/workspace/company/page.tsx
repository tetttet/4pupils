import CorporatePlatformLanding from "@/components/workspace/corporate-platform-landing";
import WorkSpaceFaq from "@/components/workspace/workspace-faq";
import WorkspaceThemeTransition from "@/components/workspace/workspace-theme-transition";

const CompanyWorkspace = () => {
  return (
    <main className="bg-[#F3F5FF]">
      <CorporatePlatformLanding />
      <WorkspaceThemeTransition />
      <WorkSpaceFaq />
    </main>
  );
};

export default CompanyWorkspace;
