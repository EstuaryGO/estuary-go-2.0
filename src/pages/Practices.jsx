import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import PullToRefreshIndicator from "@/components/PullToRefreshIndicator";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import VideoPlayerModal from "../components/VideoPlayerModal";
import VideoCard from "../components/VideoCard";
import { Play, ChevronDown, X } from "lucide-react";
import ProgressBar from "@/components/ProgressBar";

const HEADER_THUMBNAIL = "https://media.base44.com/images/public/6a1204d6712923c845a17a9d/090f1c1e5_uywfLHTMStCut8jtQOfv_7PracticesThumb.jpg";

const SUBCATEGORY_THUMBNAILS = {
  "GO! Practice 1": "https://media.base44.com/images/public/6a1204d6712923c845a17a9d/b7b3b653a_Practice1.jpg",
  "GO! Practice 2": "https://media.base44.com/images/public/6a1204d6712923c845a17a9d/3bc97e3da_Practice2.jpg",
  "GO! Practice 3": "https://media.base44.com/images/public/6a1204d6712923c845a17a9d/a7ecac510_Practice3.jpg",
  "GO! Practice 4": "https://media.base44.com/images/public/6a1204d6712923c845a17a9d/4c8b33972_Practice4.jpg",
  "GO! Practice 5": "https://media.base44.com/images/public/6a1204d6712923c845a17a9d/f00cd4fd2_Practice5.jpg",
  "GO! Practice 6": "https://media.base44.com/images/public/6a1204d6712923c845a17a9d/d0f190865_Practice6.jpg",
  "GO! Practice 7": "https://media.base44.com/images/public/6a1204d6712923c845a17a9d/9dca026d0_Practice7.jpg",
};

const INTRO_THUMBNAILS = {
  "7 Practices Intro": "https://media.base44.com/images/public/6a1204d6712923c845a17a9d/c6d13162c_7PracticeINTRO.jpeg",
  "7 Practices Outro": "https://media.base44.com/images/public/6a1204d6712923c845a17a9d/1c702d7ea_7PracticeOUTRO.jpg",
};

const SUBCATS = {
  "GO! Practice 1": {
    subtitle: "Go Together",
    modules: ["Go Together 1.1", "Go Together 1.2", "Go Together 1.3", "Go Together 1.4", "Go Together 1.5"]
  },
  "GO! Practice 2": {
    subtitle: "Pray Together",
    modules: ["Pray Together 2.1", "Pray Together 2.2", "Pray Together 2.3", "Pray Together 2.4"]
  },
  "GO! Practice 3": {
    subtitle: "Discover Practical Needs",
    modules: ["Discover Practical Needs 3.1", "Discover Practical Needs 3.2", "Discover Practical Needs 3.3", "Discover Practical Needs 3.4", "Discover Practical Needs 3.5"]
  },
  "GO! Practice 4": {
    subtitle: "Love In Action",
    modules: ["Love In Action 4.1", "Love In Action 4.2", "Love In Action 4.3", "Love In Action 4.4", "Love In Action 4.5"]
  },
  "GO! Practice 5": {
    subtitle: "Discover Their Story",
    modules: ["Discover Their Story 5.1", "Discover Their Story 5.2", "Discover Their Story 5.3"]
  },
  "GO! Practice 6": {
    subtitle: "Speak of Jesus",
    modules: ["Speak of Jesus 6.1", "Speak of Jesus 6.2", "Speak of Jesus 6.3", "Speak of Jesus 6.4", "Speak of Jesus 6.5", "Speak of Jesus 6.6", "Speak of Jesus 6.7"]
  },
  "GO! Practice 7": {
    subtitle: "A Flourishing Community",
    modules: ["A Flourishing Community 7.1", "A Flourishing Community 7.2", "A Flourishing Community 7.3", "A Flourishing Community 7.4"]
  },
};

function PracticeHeader({ subcategory, subtitle, videoCount, completedCount, isOpen, onToggle }) {
  return (
    <div className="rounded-lg border border-border overflow-hidden cursor-pointer" onClick={onToggle}>
      {SUBCATEGORY_THUMBNAILS[subcategory] && (
        <img src={SUBCATEGORY_THUMBNAILS[subcategory]} alt={subcategory} className="w-full object-cover" />
      )}
      <div className="px-4 pt-3 pb-2 bg-secondary/30 hover:bg-secondary/60 transition-colors">
        <div className="flex items-center justify-between mb-2">
          <div className="flex flex-col gap-0.5">
            <h3 className="text-sm font-semibold text-foreground">{subcategory}</h3>
            {subtitle && <span className="text-xs text-muted-foreground">{subtitle}</span>}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs text-muted-foreground bg-background px-2 py-0.5 rounded-full">{videoCount} videos</span>
            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
          </div>
        </div>
        {videoCount > 0 && (
          <ProgressBar completed={completedCount} total={videoCount} />
        )}
      </div>
    </div>
  );
}

export default function Practices() {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [openSection, setOpenSection] = useState(null);
  const [playingIntro, setPlayingIntro] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: videos = [] } = useQuery({
    queryKey: ["videos", "practices"],
    queryFn: () => base44.entities.Video.filter({ category: "GO! Practices Modules" })
  });

  const { data: progressRecords = [] } = useQuery({
    queryKey: ["videoProgress"],
    queryFn: () => base44.entities.VideoProgress.list(),
    enabled: !!user
  });

  const completedIds = useMemo(() =>
    new Set(progressRecords.filter(p => p.completed).map(p => p.video_id)),
    [progressRecords]
  );

  const toggleMutation = useMutation({
    mutationFn: async (video) => {
      const existing = progressRecords.find(p => p.video_id === video.id);
      if (existing) {
        return base44.entities.VideoProgress.update(existing.id, { completed: !existing.completed });
      } else {
        return base44.entities.VideoProgress.create({ video_id: video.id, user_email: user.email, completed: true });
      }
    },
    onMutate: async (video) => {
      await queryClient.cancelQueries({ queryKey: ["videoProgress"] });
      const prev = queryClient.getQueryData(["videoProgress"]);
      queryClient.setQueryData(["videoProgress"], (old = []) => {
        const existing = old.find(p => p.video_id === video.id);
        if (existing) return old.map(p => p.video_id === video.id ? { ...p, completed: !p.completed } : p);
        return [...old, { video_id: video.id, user_email: user.email, completed: true, id: `_opt_${video.id}` }];
      });
      return { prev };
    },
    onError: (_err, _vars, ctx) => queryClient.setQueryData(["videoProgress"], ctx.prev),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["videoProgress"] }),
  });

  const handleRefresh = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["videos", "practices"] }),
      queryClient.invalidateQueries({ queryKey: ["videoProgress"] }),
    ]);
  }, [queryClient]);

  const { isRefreshing, pullDistance } = usePullToRefresh({ onRefresh: handleRefresh });

  const introVideo = videos.find(v => /intro/i.test(v.title));

  const getEmbedUrl = (url) => {
    if (!url) return null;
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
    return null;
  };

  // Build subcategory → module → videos map
  const subcategories = {};
  Object.entries(SUBCATS).forEach(([sub, { subtitle, modules }]) => {
    subcategories[sub] = { subtitle, moduleMap: {} };
    modules.forEach(mod => {
      subcategories[sub].moduleMap[mod] = videos.filter(
        v => v.category === "GO! Practices Modules" && v.subcategory === sub && v.module === mod
      );
    });
  });

  return (
    <>
      <PullToRefreshIndicator pullDistance={pullDistance} isRefreshing={isRefreshing} />
      <div className="space-y-4">
        {/* Header intro video */}
        <div className="rounded-xl overflow-hidden border border-border bg-card">
          {playingIntro && introVideo ? (
            <div className="relative w-full bg-black">
              <button onClick={() => setPlayingIntro(false)} className="absolute top-2 right-2 z-10 bg-black/60 hover:bg-black/80 text-white rounded-full p-1">
                <X className="h-4 w-4" />
              </button>
              <iframe
                src={getEmbedUrl(introVideo.video_url)}
                className="w-full aspect-video"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="relative group cursor-pointer" onClick={() => introVideo && setPlayingIntro(true)}>
              <img src={INTRO_THUMBNAILS["7 Practices Intro"]} alt="GO! 7 Practices" className="w-full object-cover" />
              {introVideo && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-black/50 group-hover:bg-black/70 rounded-full p-3 transition-colors">
                    <Play className="h-7 w-7 text-white fill-white" />
                  </div>
                </div>
              )}
            </div>
          )}
          <div className="px-5 py-4 space-y-3">
            <div>
              <h1 className="text-xl font-bold text-foreground">GO! 7 Practices</h1>
              <p className="text-sm text-muted-foreground mt-1">The 7 Practices modules equip and guide you–alongside a friend or team–to actually live that missionary life!</p>
            </div>
            {(() => {
              const allPracticeVideos = videos.filter(v => v.category === "GO! Practices Modules" && !/intro|outro/i.test(v.title));
              const totalCompleted = allPracticeVideos.filter(v => completedIds.has(v.id)).length;
              return allPracticeVideos.length > 0 ? (
                <ProgressBar completed={totalCompleted} total={allPracticeVideos.length} label="Overall Progress" />
              ) : null;
            })()}
          </div>
        </div>

        {/* Subcategory header cards + expanded videos — expands below each card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(subcategories).map(([subcategory, { subtitle, moduleMap }]) => {
            const allSubcatVideos = Object.values(moduleMap).flat();
            const count = allSubcatVideos.length;
            const isOpen = openSection === subcategory;
            const expandedVideos = isOpen ? allSubcatVideos : [];
            const completedCount = allSubcatVideos.filter(v => completedIds.has(v.id)).length;
            return (
              <>
                <PracticeHeader
                  key={subcategory}
                  subcategory={subcategory}
                  subtitle={subtitle}
                  videoCount={count || SUBCATS[subcategory].modules.length}
                  completedCount={completedCount}
                  isOpen={isOpen}
                  onToggle={() => setOpenSection(isOpen ? null : subcategory)}
                />
                {isOpen && (
                  <div key={`${subcategory}-expanded`} className="col-span-1 md:col-span-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {expandedVideos.length > 0 ? expandedVideos.map((video) => (
                        <VideoCard
                          key={video.id}
                          video={video}
                          onClick={setSelectedVideo}
                          completed={completedIds?.has(video.id)}
                          onToggleComplete={(v) => toggleMutation.mutate(v)}
                        />
                      )) : SUBCATS[subcategory].modules.map((mod) => (
                        <div key={mod} className="rounded-xl border border-dashed border-border bg-muted/30 p-6 flex items-center gap-4">
                          <Play className="h-5 w-5 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">{mod} — Coming soon</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            );
          })}
        </div>

        <VideoPlayerModal video={selectedVideo} open={!!selectedVideo} onClose={() => setSelectedVideo(null)} />
      </div>
    </>
  );
}