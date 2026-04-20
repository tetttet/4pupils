import CorporatePlatformLanding from "@/components/workspace/corporate-platform-landing";
import WorkSpaceFaq from "@/components/workspace/workspace-faq";
import WorkspaceThemeTransition from "@/components/workspace/workspace-theme-transition";

const CompanyWorkspace = () => {
  return (
    <div>
      <CorporatePlatformLanding />
      <WorkspaceThemeTransition />
      <WorkSpaceFaq />
    </div>
  );
};

export default CompanyWorkspace;
