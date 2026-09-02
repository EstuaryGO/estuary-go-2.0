import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import PullToRefreshIndicator from "@/components/PullToRefreshIndicator";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import VideoPlayerModal from "../components/VideoPlayerModal";
import VideoCard from "../components/VideoCard";
import ProgressBar from "@/components/ProgressBar";
import { Play, ChevronDown, X } from "lucide-react";

const HEADER_THUMBNAIL =
  "https://media.base44.com/images/public/6a1204d6712923c845a17a9d/090f1c1e5_uywfLHTMStCut8jtQOfv_7PracticesThumb.jpg";

const PREP_INTRO_THUMBNAIL =
  "https://i.vimeocdn.com/video/2171596428-c862ee39aadc4c33ecde98fb1d30a6a1c5bb9f21d8af40e89de71bb8854eaeb1-d_1280?region=us";

const PRACTICE_INTRO_THUMBNAIL =
  "https://i.vimeocdn.com/video/2171633303-f61fd81de2056b717caa0a6a5f2bd97e90877285624ecd0b2a28d3e2d5d0123b-d_1280?region=us";

const PREP_SUB_THUMBS = {
  "GO! Prep 1":
    "https://media.base44.com/images/public/6a1204d6712923c845a17a9d/b925be268_DCoGeXmTMeBnIZkcyoZ0_prep1thumnail-1.png",
  "GO! Prep 2":
    "https://media.base44.com/images/public/6a1204d6712923c845a17a9d/ae0ab1c26_QMrFhgKsSz6qDXJAtRCr_Prep2Thumbnail.png",
  "GO! Prep 3":
    "https://media.base44.com/images/public/6a1204d6712923c845a17a9d/aba822cd2_gYxLlPjRS66M53tHwk7b_Prep3Thumnbnail.png",
};

const PRACTICE_SUB_THUMBS = {
  "GO! Practice 1": "https://media.base44.com/images/public/6a1204d6712923c845a17a9d/b7b3b653a_Practice1.jpg",
  "GO! Practice 2": "https://media.base44.com/images/public/6a1204d6712923c845a17a9d/3bc97e3da_Practice2.jpg",
  "GO! Practice 3": "https://media.base44.com/images/public/6a1204d6712923c845a17a9d/a7ecac510_Practice3.jpg",
  "GO! Practice 4": "https://media.base44.com/images/public/6a1204d6712923c845a17a9d/4c8b33972_Practice4.jpg",
  "GO! Practice 5": "https://media.base44.com/images/public/6a1204d6712923c845a17a9d/f00cd4fd2_Practice5.jpg",
  "GO! Practice 6": "https://media.base44.com/images/public/6a1204d6712923c845a17a9d/d0f190865_Practice6.jpg",
  "GO! Practice 7": "https://media.base44.com/images/public/6a1204d6712923c845a17a9d/9dca026d0_Practice7.jpg",
};

const PREP_SUBCATS = {
  "GO! Prep 1": ["GO! Prep 1.1", "GO! Prep 1.2", "GO! Prep 1.3", "GO! Prep 1.4"],
  "GO! Prep 2": ["GO! Prep 2.1", "GO! Prep 2.2", "GO! Prep 2.3", "GO! Prep 2.4"],
  "GO! Prep 3": ["GO! Prep 3.1", "GO! Prep 3.2", "GO! Prep 3.3", "GO! Prep 3.4"],
};

const PRACTICE_SUBCATS = {
  "GO! Practice 1": { subtitle: "Go Together", modules: ["Go Together 1.1", "Go Together 1.2", "Go Together 1.3", "Go Together 1.4", "Go Together 1.5"] },
  "GO! Practice 2": { subtitle: "Pray Together", modules: ["Pray Together 2.1", "Pray Together 2.2", "Pray Together 2.3", "Pray Together 2.4"] },
  "GO! Practice 3": { subtitle: "Discover Practical Needs", modules: ["Discover Practical Needs 3.1", "Discover Practical Needs 3.2", "Discover Practical Needs 3.3", "Discover Practical Needs 3.4", "Discover Practical Needs 3.5"] },
  "GO! Practice 4": { subtitle: "Love In Action", modules: ["Love In Action 4.1", "Love In Action 4.2", "Love In Action 4.3", "Love In Action 4.4", "Love In Action 4.5"] },
  "GO! Practice 5": { subtitle: "Discover Their Story", modules: ["Discover Their Story 5.1", "Discover Their Story 5.2", "Discover Their Story 5.3"] },
  "GO! Practice 6": { subtitle: "Speak of Jesus", modules: ["Speak of Jesus 6.1", "Speak of Jesus 6.2", "Speak of Jesus 6.3", "Speak of Jesus 6.4", "Speak of Jesus 6.5", "Speak of Jesus 6.6", "Speak of Jesus 6.7"] },
  "GO! Practice 7": { subtitle: "A Flourishing Community", modules: ["A Flourishing Community 7.1", "A Flourishing Community 7.2", "A Flourishing Community 7.3", "A Flourishing Community 7.4"] },
};

function getEmbedUrl(url) {
  if (!url) return null;
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
  return null;
}

function SubcategoryHeader({ subcategory, subtitle, thumbnail, videoCount, completedCount, isOpen, onToggle }) {
  return (
    <div className="rounded-lg border border-border overflow-hidden cursor-pointer" onClick={onToggle}>
      {thumbnail && <img src={thumbnail} alt={subcategory} className="w-full object-cover" />}
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
        {videoCount > 0 && <ProgressBar completed={completedCount} total={videoCount} />}
      </div>
    </div>
  );
}

function SectionHeader({ title, description, introVideo, thumbnail, playingIntro, onPlayIntro, onStopIntro }) {
  return (
    <div className="rounded-xl overflow-hidden border border-border bg-card">
      {playingIntro && introVideo ? (
        <div className="relative w-full bg-black">
          <button onClick={onStopIntro} className="absolute top-2 right-2 z-10 bg-black/60 hover:bg-black/80 text-white rounded-full p-1">
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
        introVideo && (
          <button onClick={onPlayIntro} className="relative w-full aspect-video group block">
            <img src={thumbnail || HEADER_THUMBNAIL} alt={title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-black/50 group-hover:bg-black/70 rounded-full p-3 transition-colors">
                <Play className="h-7 w-7 text-white fill-white" />
              </div>
            </div>
          </button>
        )
      )}
      <div className="px-5 py-4">
        <h2 className="text-lg font-bold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>
    </div>
  );
}

export default function PrepsAndPractices() {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [openPrep, setOpenPrep] = useState(null);
  const [openPractice, setOpenPractice] = useState(null);
  const [playingPrepIntro, setPlayingPrepIntro] = useState(false);
  const [playingPracticeIntro, setPlayingPracticeIntro] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: videos = [] } = useQuery({
    queryKey: ["videos"],
    queryFn: () => base44.entities.Video.list(),
  });

  const { data: progressRecords = [] } = useQuery({
    queryKey: ["videoProgress"],
    queryFn: () => base44.entities.VideoProgress.list(),
    enabled: !!user,
  });

  const completedIds = useMemo(
    () => new Set(progressRecords.filter((p) => p.completed).map((p) => p.video_id)),
    [progressRecords]
  );

  const toggleMutation = useMutation({
    mutationFn: async (video) => {
      const existing = progressRecords.find((p) => p.video_id === video.id);
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
        const existing = old.find((p) => p.video_id === video.id);
        if (existing) return old.map((p) => (p.video_id === video.id ? { ...p, completed: !p.completed } : p));
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

  const isIntroOutro = (v) => /intro|outro/i.test(v.title) || !v.module;

  const prepVideos = videos.filter((v) => v.category === "GO! Prep Modules" && !isIntroOutro(v));
  const practiceVideos = videos.filter((v) => v.category === "GO! Practices Modules" && !isIntroOutro(v));
  const prepIntro = videos.find((v) => v.title === "3 Preps Intro" && v.category === "GO! Prep Modules");
  const practiceIntro = videos.find((v) => v.category === "GO! Practices Modules" && /intro/i.test(v.title));

  const prepSubcats = {};
  Object.entries(PREP_SUBCATS).forEach(([sub, mods]) => {
    prepSubcats[sub] = {};
    mods.forEach((mod) => {
      prepSubcats[sub][mod] = videos.filter(
        (v) => v.category === "GO! Prep Modules" && v.subcategory === sub && v.module === mod
      );
    });
  });

  const practiceSubcats = {};
  Object.entries(PRACTICE_SUBCATS).forEach(([sub, { subtitle, modules }]) => {
    practiceSubcats[sub] = { subtitle, moduleMap: {} };
    modules.forEach((mod) => {
      practiceSubcats[sub].moduleMap[mod] = videos.filter(
        (v) => v.category === "GO! Practices Modules" && v.subcategory === sub && v.module === mod
      );
    });
  });

  const totalCompleted = [...prepVideos, ...practiceVideos].filter((v) => completedIds.has(v.id)).length;
  const totalVideos = prepVideos.length + practiceVideos.length;

  const renderExpandedVideos = (vids, fallbackModules) => {
    if (vids.length > 0) {
      return vids.map((video) => (
        <VideoCard
          key={video.id}
          video={video}
          onClick={setSelectedVideo}
          completed={completedIds?.has(video.id)}
          onToggleComplete={(v) => toggleMutation.mutate(v)}
        />
      ));
    }
    return fallbackModules.map((mod) => (
      <div key={mod} className="rounded-xl border border-dashed border-border bg-muted/30 p-6 flex items-center gap-4">
        <Play className="h-5 w-5 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{mod} — Coming soon</p>
      </div>
    ));
  };

  return (
    <>
      <PullToRefreshIndicator pullDistance={pullDistance} isRefreshing={isRefreshing} />
      <div className="space-y-6">
        {/* Page header */}
        <div className="rounded-xl overflow-hidden border border-border bg-card">
          <img src={HEADER_THUMBNAIL} alt="Preps + Practices" className="w-full object-cover max-h-48" />
          <div className="px-5 py-4 space-y-3">
            <div>
              <h1 className="text-xl font-bold text-foreground">Preps + Practices</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Flow through the full video catalogue — the 3 Preps and 7 Practices — and keep tracking your steps.
              </p>
            </div>
            {totalVideos > 0 && <ProgressBar completed={totalCompleted} total={totalVideos} label="Overall Progress" />}
          </div>
        </div>

        {/* Preps section */}
        <div className="space-y-3">
          <SectionHeader
            title="GO! 3 Preps"
            description="The 3 Prep Modules help you prepare to live as a missionary in your everyday life."
            introVideo={prepIntro}
            thumbnail={PREP_INTRO_THUMBNAIL}
            playingIntro={playingPrepIntro}
            onPlayIntro={() => setPlayingPrepIntro(true)}
            onStopIntro={() => setPlayingPrepIntro(false)}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(prepSubcats).map(([subcategory, moduleMap]) => {
              const allVideos = Object.values(moduleMap).flat();
              const count = allVideos.length;
              const completedCount = allVideos.filter((v) => completedIds.has(v.id)).length;
              const isOpen = openPrep === subcategory;
              return (
                <div key={subcategory}>
                  <SubcategoryHeader
                    subcategory={subcategory}
                    thumbnail={PREP_SUB_THUMBS[subcategory]}
                    videoCount={count || PREP_SUBCATS[subcategory].length}
                    completedCount={completedCount}
                    isOpen={isOpen}
                    onToggle={() => setOpenPrep(isOpen ? null : subcategory)}
                  />
                  {isOpen && (
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                      {renderExpandedVideos(allVideos, PREP_SUBCATS[subcategory])}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Practices section */}
        <div className="space-y-3">
          <SectionHeader
            title="GO! 7 Practices"
            description="The 7 Practices modules equip and guide you — alongside a friend or team — to actually live that missionary life!"
            introVideo={practiceIntro}
            thumbnail={PRACTICE_INTRO_THUMBNAIL}
            playingIntro={playingPracticeIntro}
            onPlayIntro={() => setPlayingPracticeIntro(true)}
            onStopIntro={() => setPlayingPracticeIntro(false)}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(practiceSubcats).map(([subcategory, { subtitle, moduleMap }]) => {
              const allVideos = Object.values(moduleMap).flat();
              const count = allVideos.length;
              const completedCount = allVideos.filter((v) => completedIds.has(v.id)).length;
              const isOpen = openPractice === subcategory;
              return (
                <div key={subcategory}>
                  <SubcategoryHeader
                    subcategory={subcategory}
                    subtitle={subtitle}
                    thumbnail={PRACTICE_SUB_THUMBS[subcategory]}
                    videoCount={count || PRACTICE_SUBCATS[subcategory].modules.length}
                    completedCount={completedCount}
                    isOpen={isOpen}
                    onToggle={() => setOpenPractice(isOpen ? null : subcategory)}
                  />
                  {isOpen && (
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                      {renderExpandedVideos(allVideos, PRACTICE_SUBCATS[subcategory].modules)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <VideoPlayerModal video={selectedVideo} open={!!selectedVideo} onClose={() => setSelectedVideo(null)} />
      </div>
    </>
  );
}