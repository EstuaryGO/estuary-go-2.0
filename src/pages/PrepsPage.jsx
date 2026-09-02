import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import SectionView from "@/components/preps-practices/SectionView";

export default function PrepsPage() {
  return (
    <div className="space-y-4">
      <Link
        to="/preps-and-practices"
        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary text-foreground text-sm font-semibold hover:bg-secondary/70 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Preps + Practices
      </Link>
      <SectionView mode="preps" />
    </div>
  );
}