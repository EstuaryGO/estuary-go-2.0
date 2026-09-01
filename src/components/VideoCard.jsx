import { Play, Clock, CheckCircle2, FileText, MessageCircle } from "lucide-react";
import PdfViewerModal from "@/components/PdfViewerModal";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

function getStaticThumbnail(videoUrl) {
  if (!videoUrl) return null;
  const ytMatch = videoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]{11})/);
  if (ytMatch) return `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`;
  const gdMatch = videoUrl.match(/\/file\/d\/([^/]+)/);
  if (gdMatch) return `https://drive.google.com/thumbnail?id=${gdMatch[1]}&sz=w640`;
  return null;
}

function useVimeoThumbnail(videoUrl) {
  const [thumb, setThumb] = useState(null);
  useEffect(() => {
    const vimeoMatch = videoUrl?.match(/vimeo\.com\/(\d+)/);
    if (!vimeoMatch) return;
    fetch(`https://vimeo.com/api/oembed.json?url=https://vimeo.com/${vimeoMatch[1]}&width=1280`)
      .then(r => r.json())
      .then(d => {
          if (d.thumbnail_url) {
            // Request higher resolution by replacing the size suffix
            const hiRes = d.thumbnail_url.replace(/_\d+x\d+(\.\w+)$/, '_1280x720$1');
            setThumb(hiRes);
          }
        })
      .catch(() => {});
  }, [videoUrl]);
  return thumb;
}

const isIntroOutro = (title) => /intro|outro/i.test(title);

export default function VideoCard({ video, onClick, completed, onToggleComplete }) {
  const vimeoThumb = useVimeoThumbnail(video.video_url);
  const thumbnail = vimeoThumb || video.thumbnail_url || getStaticThumbnail(video.video_url);
  const trackable = !isIntroOutro(video.title);
  const [pdfOpen, setPdfOpen] = useState(false);
  const navigate = useNavigate();

  const handleToggle = (e) => {
    e.stopPropagation();
    onToggleComplete(video);
  };

  const handleShareStep = (e) => {
    e.stopPropagation();
    navigate("/my-estuary");
  };

  return (
    <div className="group bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1">
      <button
        onClick={() => onClick(video)}
        className="text-left w-full">
        <div className="relative aspect-video bg-muted overflow-hidden">
          {thumbnail
            ? <img src={thumbnail} alt={video.title} className="w-full h-full object-cover" />
            : <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center"><Play className="h-12 w-12 text-primary/40" /></div>
          }
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <div className="h-14 w-14 rounded-full bg-white/90 flex items-center justify-center opacity-100 md:opacity-0 md:scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300">
              <Play className="h-6 w-6 text-primary fill-primary ml-0.5" />
            </div>
          </div>
          {trackable && completed && (
            <div className="absolute top-2 right-2 bg-green-500 rounded-full p-0.5">
              <CheckCircle2 className="h-4 w-4 text-white fill-white" />
            </div>
          )}
        </div>
        <div className="p-3 space-y-1">
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">{video.category}</span>
          <h3 className="font-medium text-sm text-foreground line-clamp-2 leading-snug">{video.title}</h3>
          {video.duration_minutes && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1">
              <Clock className="h-3.5 w-3.5" />
              <span>{video.duration_minutes} min</span>
            </div>
          )}
        </div>
      </button>
      {trackable && (
        <div className="px-3 pb-3 space-y-2">
          {/* PDF Viewer */}
          {video.pdf_url ? (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); setPdfOpen(true); }}
                className="w-full flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-semibold transition-colors border border-primary/50 bg-primary/10 text-primary hover:bg-primary/20 dark:border-primary/70 dark:bg-primary/20 dark:text-primary-foreground dark:hover:bg-primary/30"
              >
                <FileText className="h-3.5 w-3.5" />
                View PDF
              </button>
              <PdfViewerModal
                pdfUrl={video.pdf_url}
                title={video.title}
                open={pdfOpen}
                onClose={() => setPdfOpen(false)}
              />
            </>
          ) : (
            <div className="w-full flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs border border-dashed border-border text-muted-foreground/50">
              <FileText className="h-3.5 w-3.5" />
              PDF coming soon
            </div>
          )}

          {/* Share reminder */}
          <button
            onClick={handleShareStep}
            className="w-full flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-semibold transition-colors border border-accent/60 bg-accent/10 text-accent hover:bg-accent/20 dark:border-accent/80 dark:bg-accent/20 dark:text-white dark:hover:bg-accent/30"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            Share My Step
          </button>

          {/* Mark Completed */}
          <button
            id="tour-mark-complete"
            onClick={handleToggle}
            className={`w-full flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
              completed
                ? "bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                : "bg-secondary border-border text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
            }`}
          >
            <CheckCircle2 className={`h-3.5 w-3.5 ${completed ? "text-green-600" : ""}`} />
            {completed ? "Completed!" : "Mark Completed"}
          </button>
        </div>
      )}
    </div>
  );
}