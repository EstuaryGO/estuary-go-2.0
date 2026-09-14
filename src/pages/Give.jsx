import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ExternalLink } from "lucide-react";

const GIVE_URL = "https://lifeintheestuary.churchcenter.com/giving";
// Width at which Church Center's giving form lays out comfortably.
const DESIGN_WIDTH = 480;
// Generous unscaled height so the full form is visible once scaled.
const DESIGN_HEIGHT = 1500;

export default function Give() {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [failed, setFailed] = useState(false);
  const loadedRef = useRef(false);
  const timerRef = useRef(null);

  useEffect(() => {
    const update = () => {
      const w = containerRef.current?.clientWidth || window.innerWidth;
      setScale(Math.min(w / DESIGN_WIDTH, 1));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
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

      {/* Scaled iframe stage */}
      <main ref={containerRef} className="relative w-full bg-[#F9F9FB] overflow-hidden">
        {!failed && (
          <div
            className="relative w-full overflow-hidden"
            style={{ height: DESIGN_HEIGHT * scale }}
          >
            <iframe
              src={GIVE_URL}
              title="Give"
              onLoad={handleLoad}
              className="absolute top-0 left-0 border-0"
              style={{
                width: DESIGN_WIDTH,
                height: DESIGN_HEIGHT,
                transform: `scale(${scale})`,
                transformOrigin: "top left",
              }}
            />
          </div>
        )}

        {/* Fallback overlay */}
        {failed && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 py-10 bg-white animate-[rise_180ms_ease-out]">
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