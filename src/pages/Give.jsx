import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ExternalLink } from "lucide-react";

const GIVE_URL = "https://lifeintheestuary.churchcenter.com/giving";

export default function Give() {
  const navigate = useNavigate();
  const [failed, setFailed] = useState(false);
  const loadedRef = useRef(false);
  const timerRef = useRef(null);

  useEffect(() => {
    // If the iframe never reports a load within 6s, assume it was blocked (CSP/X-Frame-Options).
    timerRef.current = setTimeout(() => {
      if (!loadedRef.current) setFailed(true);
    }, 6000);
    return () => clearTimeout(timerRef.current);
  }, []);

  const handleLoad = () => {
    loadedRef.current = true;
    clearTimeout(timerRef.current);
  };

  const goBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/home");
  };

  return (
    <div className="flex flex-col">
      {/* Slim header */}
      <header className="sticky top-16 z-20 flex items-center gap-3 px-4 h-12 bg-white/90 backdrop-blur border-b border-[#E5E7EB]">
        <button
          onClick={goBack}
          aria-label="Back"
          className="flex items-center justify-center w-8 h-8 rounded-full text-[#6B7280] hover:bg-[#F3F4F6] active:scale-95 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-base font-semibold tracking-[-0.01em] text-[#111827]">Give</span>
      </header>

      {/* Main stage — bounded height so it's not a giant takeover on mobile */}
      <main className="relative w-full bg-[#F9F9FB] h-[calc(100dvh-64px-48px-88px)] min-h-[360px]">
        {!failed && (
          <iframe
            src={GIVE_URL}
            title="Give"
            onLoad={handleLoad}
            className="w-full h-full border-0 animate-[rise_180ms_ease-out]"
          />
        )}

        {/* Fallback overlay */}
        {failed && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 bg-white animate-[rise_180ms_ease-out]">
            <div className="w-full max-w-sm rounded-2xl border border-[#E5E7EB] bg-white shadow-lg overflow-hidden">
              <div
                className="h-[3px] w-full"
                style={{ background: "linear-gradient(90deg, #0D9488, #6366F1)" }}
              />
              <div className="p-6 flex flex-col items-center text-center">
                <h2 className="text-lg font-semibold text-[#111827]">Complete Giving</h2>
                <p className="mt-1 text-sm text-[#6B7280]">
                  If the secure form doesn't load automatically
                </p>
                <a
                  href={GIVE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center justify-center gap-2 h-11 px-6 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] active:scale-[0.98] text-white text-sm font-semibold transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open Giving in Browser
                </a>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}