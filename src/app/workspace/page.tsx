import { NodeLab } from "@/components/labs/NodeLab";
import { SiteHeader } from "@/components/layout/SiteHeader";

export default function WorkspacePage() {
  return (
    <div className="min-h-screen bg-bg">
      <SiteHeader />
      <NodeLab />
    </div>
  );
}
