import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Download, FileText } from "lucide-react";

export default function PdfViewerModal({ pdfUrl, title, open, onClose }) {
  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    if (open) {
      document.addEventListener("keydown", handleKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open || !pdfUrl) return null;

   const getEmbedUrl = (url) => {
    const gdMatch = url.match(/\/file\/d\/([^/]+)/);
    if (gdMatch) return `https://drive.google.com/file/d/${gdMatch[1]}/preview`;
    if (url.endsWith(".pdf") || url.includes(".pdf?")) {
      return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
    }
    return url;
  };

  const embedUrl = getEmbedUrl(pdfUrl);

  return createPortal(
    <div className="fixed inset-0 z-[100] flex flex-col bg-white" style={{ top: 0, left: 0, right: 0, bottom: 0 }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-card border-b border-border shrink-0" style={{ paddingTop: "max(12px, env(safe-area-inset-top))" }}>
        <div className="flex items-center gap-2 min-w-0">
          <FileText className="h-4 w-4 text-primary shrink-0" />
          <span className="text-sm font-semibold text-foreground truncate">{title}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-3">
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            Download
          </a>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* PDF iframe — fills remaining screen */}
      <iframe
        src={embedUrl}
        className="flex-1 w-full border-0"
        title={title}
        allow="fullscreen"
        style={{ height: "calc(100vh - 56px)" }}
      />
    </div>,
    document.body
  );
}