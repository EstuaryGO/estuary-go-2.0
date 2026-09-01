import { useState } from "react";
import { ChevronDown, Play } from "lucide-react";
import VideoCard from "./VideoCard";

const SUBCATEGORY_THUMBNAILS = {
  "GO! Prep 1": "https://media.base44.com/images/public/6a1204d6712923c845a17a9d/b925be268_DCoGeXmTMeBnIZkcyoZ0_prep1thumnail-1.png",
  "GO! Prep 2": "https://media.base44.com/images/public/6a1204d6712923c845a17a9d/ae0ab1c26_QMrFhgKsSz6qDXJAtRCr_Prep2Thumbnail.png",
  "GO! Prep 3": "https://media.base44.com/images/public/6a1204d6712923c845a17a9d/aba822cd2_gYxLlPjRS66M53tHwk7b_Prep3Thumnbnail.png"
};

const SUBCATEGORY_VIDEO_COUNTS = {
  "GO! Prep 1": 4,
  "GO! Prep 2": 4,
  "GO! Prep 3": 4
};

export default function SubcategorySection({ subcategory, subtitle, modules, onVideoClick, completedIds, onToggleComplete, introVideo, isOpen, onToggle }) {
  const [localOpen, setLocalOpen] = useState(false);
  const open = isOpen !== undefined ? isOpen : localOpen;
  const setOpen = onToggle !== undefined ? onToggle : setLocalOpen;

  const totalVideos = Object.values(modules).reduce((sum, vids) => sum + vids.length, 0);

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      {SUBCATEGORY_THUMBNAILS[subcategory] && (
        <img src={SUBCATEGORY_THUMBNAILS[subcategory]} alt={subcategory} className="w-full object-cover max-h-40" />
      )}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-left bg-secondary/30 hover:bg-secondary/60 transition-colors"
      >
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-foreground">{subcategory}</h3>
          <span className="text-xs text-muted-foreground bg-background px-2 py-0.5 rounded-full">{SUBCATEGORY_VIDEO_COUNTS[subcategory] ?? totalVideos} video{(SUBCATEGORY_VIDEO_COUNTS[subcategory] ?? totalVideos) !== 1 ? "s" : ""}</span>
        </div>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="px-4 py-4 space-y-5">
          {subtitle && (
            <p className="text-sm font-semibold text-foreground">{subtitle}</p>
          )}
          {introVideo && (
            <div className="grid grid-cols-1 gap-3">
              <VideoCard video={introVideo} onClick={onVideoClick} completed={completedIds?.has(introVideo.id)} onToggleComplete={onToggleComplete} />
            </div>
          )}
          {Object.entries(modules).map(([module, vids]) => (
            <div key={module}>
              {module && (
                <h4 className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">{module}</h4>
              )}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {vids.length > 0 ? vids.map((video) => (
                  <VideoCard key={video.id} video={video} onClick={onVideoClick} completed={completedIds?.has(video.id)} onToggleComplete={onToggleComplete} />
                )) : (
                  <div className="rounded-xl border border-dashed border-border bg-muted/30 p-6 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <Play className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{module || subcategory}</p>
                      <p className="text-xs text-muted-foreground/60">Coming soon</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}