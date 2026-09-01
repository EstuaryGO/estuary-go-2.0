import { useState } from "react";
import { ChevronDown, Play, X } from "lucide-react";
import SubcategorySection from "./SubcategorySection";
import VideoCard from "./VideoCard";

const CATEGORY_THUMBNAILS = {
  "GO! 3 Preps": "https://media.base44.com/images/public/6a1204d6712923c845a17a9d/1981c2eb3_50j61OcSlyH3tcikQGOX_3PrepsThumb.jpg",
  "GO! Practices": "https://media.base44.com/images/public/6a1204d6712923c845a17a9d/090f1c1e5_uywfLHTMStCut8jtQOfv_7PracticesThumb.jpg",
  "GO! 7 Practices": "https://media.base44.com/images/public/6a1204d6712923c845a17a9d/090f1c1e5_uywfLHTMStCut8jtQOfv_7PracticesThumb.jpg"
};

function getEmbedUrl(url) {
  if (!url) return null;
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
  return null;
}

export default function CategorySection({ category, subcategories, onVideoClick, completedIds, onToggleComplete, introVideo }) {
  const [open, setOpen] = useState(false);
  const [playingIntro, setPlayingIntro] = useState(false);

  const totalVideos = Object.values(subcategories).reduce((sum, modules) =>
    sum + Object.values(modules).reduce((s, vids) => s + vids.length, 0), 0
  );
  const subcategoryCount = Object.keys(subcategories).filter(k => k !== "").length;

  const chevronClass = open
    ? "h-5 w-5 text-muted-foreground transition-transform duration-200 rotate-180"
    : "h-5 w-5 text-muted-foreground transition-transform duration-200";

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {introVideo && playingIntro ? (
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
      ) : CATEGORY_THUMBNAILS[category] && (
        <div className="relative w-full group cursor-pointer" onClick={introVideo ? () => setPlayingIntro(true) : undefined}>
          <img src={CATEGORY_THUMBNAILS[category]} alt={category} className="w-full object-cover max-h-48" />
          {introVideo && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-black/50 group-hover:bg-black/70 rounded-full p-3 transition-colors">
                <Play className="h-7 w-7 text-white fill-white" />
              </div>
            </div>
          )}
        </div>
      )}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-secondary/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <h2 className="text-base font-bold text-foreground">{category}</h2>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {subcategoryCount > 0 ? `${subcategoryCount} module${subcategoryCount !== 1 ? "s" : ""}` : `${totalVideos} video${totalVideos !== 1 ? "s" : ""}`}
          </span>
        </div>
        <ChevronDown className={chevronClass} />
      </button>

      {open && (
        <div className="border-t border-border px-5 py-4 space-y-3">
          {Object.entries(subcategories).map(([subcategory, modules]) =>
            subcategory
              ? <SubcategorySection key={subcategory} subcategory={subcategory} modules={modules} onVideoClick={onVideoClick} completedIds={completedIds} onToggleComplete={onToggleComplete} />
              : Object.entries(modules).map(([mod, vids]) => (
                  <div key={mod}>
                    {mod && <h4 className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">{mod}</h4>}
                    <div className="grid grid-cols-1 gap-3">
                      {vids.map(video => <VideoCard key={video.id} video={video} onClick={onVideoClick} completed={completedIds?.has(video.id)} onToggleComplete={onToggleComplete} />)}
                    </div>
                  </div>
                ))
          )}
        </div>
      )}
    </div>
  );
}