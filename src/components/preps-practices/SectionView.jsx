import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import PullToRefreshIndicator from "@/components/PullToRefreshIndicator";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import VideoPlayerModal from "@/components/VideoPlayerModal";
import VideoCard from "@/components/VideoCard";
import ProgressBar from "@/components/ProgressBar";
import { Play, ChevronDown, X } from "lucide-react";
import {
  PREP_INTRO_THUMBNAIL,
  PRACTICE_INTRO_THUMBNAIL,
  PREP_SUB_THUMBS,
  PRACTICE_SUB_THUMBS,
  PREP_SUBCATS,
  PRACTICE_SUBCATS,
  getEmbedUrl,
} from "@/components/preps-practices/prepsPracticesData";

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
            <img src={thumbnail} alt={title} className="w-full h-full object-cover" />
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

const isIntroOutro = (v) => /intro|outro/i.test(v.title) || !v.module;

export default function SectionView({ mode }) {
  const isPreps = mode === "preps";
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [openSub, setOpenSub] = useState(null);
  const [playingIntro, setPlayingIntro] = useState(false);
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

  const category = isPreps ? "GO! Prep Modules" : "GO! Practices Modules";
  const sectionVideos = videos.filter((v) => v.category === category && !isIntroOutro(v));
  const introVideo = isPreps
    ? videos.find((v) => v.title === "3 Preps Intro" && v.category === "GO! Prep Modules")
    : videos.find((v) => v.category === "GO! Practices Modules" && /intro/i.test(v.title));

  // Build normalized subcategory descriptors
  const subcatEntries = isPreps
    ? Object.entries(PREP_SUBCATS).map(([sub, mods]) => {
        const moduleMap = {};
        mods.forEach((mod) => {
          moduleMap[mod] = videos.filter(
            (v) => v.category === "GO! Prep Modules" && v.subcategory === sub && v.module === mod
          );
        });
        return {
          sub,
          subtitle: null,
          allVideos: Object.values(moduleMap).flat(),
          fallbackModules: mods,
          thumb: PREP_SUB_THUMBS[sub],
        };
      })
    : Object.entries(PRACTICE_SUBCATS).map(([sub, { subtitle, modules }]) => {
        const moduleMap = {};
        modules.forEach((mod) => {
          moduleMap[mod] = videos.filter(
            (v) => v.category === "GO! Practices Modules" && v.subcategory === sub && v.module === mod
          );
        });
        return {
          sub,
          subtitle,
          allVideos: Object.values(moduleMap).flat(),
          fallbackModules: modules,
          thumb: PRACTICE_SUB_THUMBS[sub],
        };
      });

  const totalCompleted = sectionVideos.filter((v) => completedIds.has(v.id)).length;
  const totalVideos = sectionVideos.length;

  const title = isPreps ? "GO! 3 Preps" : "GO! 7 Practices";
  const description = isPreps
    ? "The 3 Prep Modules help you prepare to live as a missionary in your everyday life."
    : "The 7 Practices modules equip and guide you — alongside a friend or team — to actually live that missionary life!";
  const thumbnail = isPreps ? PREP_INTRO_THUMBNAIL : PRACTICE_INTRO_THUMBNAIL;

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
        <SectionHeader
          title={title}
          description={description}
          introVideo={introVideo}
          thumbnail={thumbnail}
          playingIntro={playingIntro}
          onPlayIntro={() => setPlayingIntro(true)}
          onStopIntro={() => setPlayingIntro(false)}
        />
        {totalVideos > 0 && <ProgressBar completed={totalCompleted} total={totalVideos} label="Section Progress" />}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {subcatEntries.map(({ sub, subtitle, allVideos, fallbackModules, thumb }) => {
            const count = allVideos.length || fallbackModules.length;
            const completedCount = allVideos.filter((v) => completedIds.has(v.id)).length;
            const isOpen = openSub === sub;
            return (
              <div key={sub} className="md:col-span-1">
                <SubcategoryHeader
                  subcategory={sub}
                  subtitle={subtitle}
                  thumbnail={thumb}
                  videoCount={count}
                  completedCount={completedCount}
                  isOpen={isOpen}
                  onToggle={() => setOpenSub(isOpen ? null : sub)}
                />
                {isOpen && (
                  <div className="mt-4 grid grid-cols-1 gap-4">
                    {renderExpandedVideos(allVideos, fallbackModules)}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <VideoPlayerModal video={selectedVideo} open={!!selectedVideo} onClose={() => setSelectedVideo(null)} />
      </div>
    </>
  );
}