import { CoreConceptsLab } from "@/components/sims/CoreConceptsLab";
import { SiteHeader } from "@/components/layout/SiteHeader";

export default function LabPage() {
  return (
    <div className="min-h-screen bg-bg">
      <SiteHeader />
      <CoreConceptsLab />
    </div>
  );
}
