import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import PullToRefreshIndicator from "@/components/PullToRefreshIndicator";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import VideoPlayerModal from "../components/VideoPlayerModal";
import VideoCard from "../components/VideoCard";
import { Play, X, ChevronDown } from "lucide-react";
import ProgressBar from "@/components/ProgressBar";

const SUBCATEGORY_THUMBNAILS = {
  "GO! Prep 1": "https://media.base44.com/images/public/6a1204d6712923c845a17a9d/b925be268_DCoGeXmTMeBnIZkcyoZ0_prep1thumnail-1.png",
  "GO! Prep 2": "https://media.base44.com/images/public/6a1204d6712923c845a17a9d/ae0ab1c26_QMrFhgKsSz6qDXJAtRCr_Prep2Thumbnail.png",
  "GO! Prep 3": "https://media.base44.com/images/public/6a1204d6712923c845a17a9d/aba822cd2_gYxLlPjRS66M53tHwk7b_Prep3Thumnbnail.png"
};

function PrepHeader({ subcategory, isOpen, onToggle }) {
  return (
    <div className="rounded-lg border border-border overflow-hidden cursor-pointer" onClick={onToggle}>
      {SUBCATEGORY_THUMBNAILS[subcategory] && (
        <img src={SUBCATEGORY_THUMBNAILS[subcategory]} alt={subcategory} className="w-full object-cover" />
      )}
      <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 hover:bg-secondary/60 transition-colors">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-foreground">{subcategory}</h3>
          <span className="text-xs text-muted-foreground bg-background px-2 py-0.5 rounded-full">4 videos</span>
        </div>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </div>
    </div>
  );
}

const THUMBNAIL = "https://media.base44.com/images/public/6a1204d6712923c845a17a9d/1981c2eb3_50j61OcSlyH3tcikQGOX_3PrepsThumb.jpg";

const SUBCATS = {
  "GO! Prep 1": ["GO! Prep 1.1", "GO! Prep 1.2", "GO! Prep 1.3", "GO! Prep 1.4"],
  "GO! Prep 2": ["GO! Prep 2.1", "GO! Prep 2.2", "GO! Prep 2.3", "GO! Prep 2.4"],
  "GO! Prep 3": ["GO! Prep 3.1", "GO! Prep 3.2", "GO! Prep 3.3", "GO! Prep 3.4"],
};

function getEmbedUrl(url) {
  if (!url) return null;
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
  return null;
}

export default function Preps() {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [playingIntro, setPlayingIntro] = useState(false);
  const [openSection, setOpenSection] = useState(null);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: videos = [] } = useQuery({
    queryKey: ["videos"],
    queryFn: () => base44.entities.Video.list()
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
      queryClient.invalidateQueries({ queryKey: ["videos"] }),
      queryClient.invalidateQueries({ queryKey: ["videoProgress"] }),
    ]);
  }, [queryClient]);

  const { isRefreshing, pullDistance } = usePullToRefresh({ onRefresh: handleRefresh });

  const introVideo = videos.find(v => v.title === "3 Preps Intro" && v.category === "GO! Prep Modules");

  const subcategories = {};
  Object.entries(SUBCATS).forEach(([sub, mods]) => {
    subcategories[sub] = {};
    mods.forEach(mod => {
      subcategories[sub][mod] = videos.filter(v => v.category === "GO! Prep Modules" && v.subcategory === sub && v.module === mod);
    });
  });

  return (
    <>
    <PullToRefreshIndicator pullDistance={pullDistance} isRefreshing={isRefreshing} />
    <div className="space-y-4">
      {/* Header image / intro video */}
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
            <img src={THUMBNAIL} alt="GO! 3 Preps" className="w-full object-cover" />
            {introVideo && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-black/50 group-hover:bg-black/70 rounded-full p-3 transition-colors">
                  <Play className="h-7 w-7 text-white fill-white" />
                </div>
              </div>
            )}
          </div>
        )}
        <div className="px-5 py-4">
          <h1 className="text-xl font-bold text-foreground">GO! 3 Preps</h1>
          <p className="text-sm text-muted-foreground mt-1">The 3 Prep Modules help you prepare to live as a missionary in your everyday life.</p>
        </div>
      </div>

      {/* Subcategories — each card expands below itself on mobile, spans full row on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.keys(subcategories).map((subcategory) => {
          const isOpen = openSection === subcategory;
          return (
            <>
              <PrepHeader
                key={subcategory}
                subcategory={subcategory}
                isOpen={isOpen}
                onToggle={() => setOpenSection(isOpen ? null : subcategory)}
              />
              {isOpen && subcategories[subcategory] && (
                <div key={`${subcategory}-expanded`} className="col-span-1 md:col-span-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(subcategories[subcategory]).flatMap(([module, vids]) =>
                      vids.length > 0 ? vids.map((video) => (
                        <VideoCard key={video.id} video={video} onClick={setSelectedVideo} completed={completedIds?.has(video.id)} onToggleComplete={(v) => toggleMutation.mutate(v)} />
                      )) : [
                        <div key={module} className="rounded-xl border border-dashed border-border bg-muted/30 p-6 flex items-center gap-4">
                          <Play className="h-5 w-5 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">{module} — Coming soon</p>
                        </div>
                      ]
                    )}
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