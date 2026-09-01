import { useEffect } from "react";
import { X, Clock, Star } from "lucide-react";

function getEmbedUrl(url) {
  if (!url) return null;
  // YouTube
  const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]{11})/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`;
  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
  // Google Drive
  const gdMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (gdMatch) return `https://drive.google.com/file/d/${gdMatch[1]}/preview?rm=minimal`;
  return null;
}

export default function VideoPlayerModal({ video, open, onClose }) {
  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    if (open) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open || !video) return null;

  const embedUrl = getEmbedUrl(video.video_url);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-3xl bg-black sm:rounded-xl overflow-hidden shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Video */}
        <div className="aspect-video w-full bg-black">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          ) : video.video_url ? (
            <video src={video.video_url} controls autoPlay className="w-full h-full" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/50">
              No video URL provided
            </div>
          )}
        </div>

        {/* Info */}
        <div className="bg-card px-5 py-4 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">{video.category}</span>
            {video.is_premium && (
              <span className="text-xs font-semibold text-accent flex items-center gap-1">
                <Star className="h-3 w-3 fill-current" /> Premium
              </span>
            )}
          </div>
          <h2 className="text-lg font-bold text-foreground">{video.title}</h2>
          {video.description && <p className="text-sm text-muted-foreground">{video.description}</p>}
          {video.duration_minutes && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>{video.duration_minutes} min</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}