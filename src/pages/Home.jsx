import { useMemo, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { ChevronRight, BookOpen, Layers, Sparkles } from "lucide-react";
import ProgressBar from "@/components/ProgressBar";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import PullToRefreshIndicator from "@/components/PullToRefreshIndicator";

const JUMP_IN_CARDS = [
{
  label: "GO! Pray. Love. Invite.",
  description: "Your daily missional rhythm — pray, love, and invite.",
  path: "/pray-impact-invite",
  thumbnail: "https://media.base44.com/images/public/6a1204d6712923c845a17a9d/1981c2eb3_50j61OcSlyH3tcikQGOX_3PrepsThumb.jpg",
  icon: BookOpen
},
{
  label: "GO! Preps + Practices",
  description: "Flow through the full video catalogue and keep tracking your steps.",
  path: "/preps-and-practices",
  thumbnail: "https://media.base44.com/images/public/6a1204d6712923c845a17a9d/090f1c1e5_uywfLHTMStCut8jtQOfv_7PracticesThumb.jpg",
  icon: Layers
}];


export default function Home() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: videos = [] } = useQuery({
    queryKey: ["videos"],
    queryFn: () => base44.entities.Video.list()
  });

  const { data: progressRecords = [] } = useQuery({
    queryKey: ["videoProgress"],
    queryFn: () => base44.entities.VideoProgress.list(),
    enabled: !!user
  });

  const handleRefresh = useCallback(async () => {
    await Promise.all([
    qc.invalidateQueries({ queryKey: ["videos"] }),
    qc.invalidateQueries({ queryKey: ["videoProgress"] })]
    );
  }, [qc]);

  const { isRefreshing, pullDistance } = usePullToRefresh({ onRefresh: handleRefresh });

  const completedIds = useMemo(() =>
  new Set(progressRecords.filter((p) => p.completed).map((p) => p.video_id)),
  [progressRecords]
  );

  const isIntroOutro = (v) => /intro|outro/i.test(v.title) || !v.module;
  const prepVideos = videos.filter((v) => v.category === "GO! Prep Modules" && !isIntroOutro(v));
  const practiceVideos = videos.filter((v) => v.category === "GO! Practices Modules" && !isIntroOutro(v));

  const allTrackableVideos = [...prepVideos, ...practiceVideos];
  const progressByPath = {
    "/preps-and-practices": {
      completed: allTrackableVideos.filter((v) => completedIds.has(v.id)).length,
      total: allTrackableVideos.length,
    },
  };

  return (
    <>
    <PullToRefreshIndicator pullDistance={pullDistance} isRefreshing={isRefreshing} />
    <div className="space-y-6 pb-6">
      <div id="tour-jump-in">
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {JUMP_IN_CARDS.map(({ label, description, path, thumbnail, icon: Icon }) =>
            <Link
              key={path}
              to={path}
              className="group rounded-xl border border-border bg-card overflow-hidden hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1">
              
              <div className="relative overflow-hidden">
                <img src={thumbnail} alt={label} className="w-full object-cover max-h-52 md:max-h-80 group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
              </div>
              <div className="px-4 py-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <p className="font-semibold text-sm text-foreground">{label}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                </div>
                {progressByPath[path]?.total > 0 &&
                <ProgressBar
                  completed={progressByPath[path].completed}
                  total={progressByPath[path].total} />

                }
              </div>
            </Link>
            )}
        </div>
      </div>

      {/* GO! AI Missionary card */}
      <Link
          to="/go-coach"
          className="group flex items-center gap-4 rounded-xl border border-border bg-card px-4 py-4 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-0.5">
          
        <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-foreground">GO! AI Assistant</p>
          <p className="text-xs text-muted-foreground mt-0.5">Your personal missionary companion — ask anything about your GO! journey.</p>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
      </Link>
    </div>
    </>);

}