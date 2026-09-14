import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ExternalLink, Heart } from "lucide-react";

const GIVE_URL = "https://lifeintheestuary.churchcenter.com/giving";

export default function Give() {
  const navigate = useNavigate();
  const [modalReady, setModalReady] = useState(
    typeof window !== "undefined" && !!window.ChurchCenterModal
  );
  const openedRef = useRef(false);

  // Wait for the Church Center modal script to load.
  useEffect(() => {
    if (modalReady) return;
    let tries = 0;
    const id = setInterval(() => {
      if (window.ChurchCenterModal) {
        setModalReady(true);
        clearInterval(id);
      } else if (++tries > 40) {
        clearInterval(id);
      }
    }, 150);
    return () => clearInterval(id);
  }, [modalReady]);

  // Auto-open the giving modal once the script is ready.
  useEffect(() => {
    if (modalReady && !openedRef.current) {
      openedRef.current = true;
      window.ChurchCenterModal.open(GIVE_URL);
    }
  }, [modalReady]);

  const goBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/home");
  };

  const openModal = () => {
    if (window.ChurchCenterModal) window.ChurchCenterModal.open(GIVE_URL);
  };

  return (
    <div className="flex flex-col min-h-[calc(100dvh-64px-88px)]">
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

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-10 bg-[#F9F9FB]">
        <div className="w-full max-w-sm flex flex-col items-center text-center">
          <div className="h-14 w-14 rounded-full bg-[#0D9488]/10 flex items-center justify-center mb-4">
            <Heart className="w-7 h-7 text-[#0D9488]" />
          </div>
          <h1 className="text-xl font-semibold text-[#111827]">Give to The Estuary</h1>
          <p className="mt-2 text-sm text-[#6B7280] leading-relaxed">
            Your generosity fuels mission. Tap below to give securely through Church Center.
          </p>

          <button
            onClick={openModal}
            disabled={!modalReady}
            className="mt-6 inline-flex items-center justify-center gap-2 h-11 px-8 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] active:scale-[0.98] text-white text-sm font-semibold transition-colors disabled:opacity-60"
          >
            {modalReady ? "Give Now" : "Loading…"}
          </button>

          <a
            href={GIVE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg text-[#6B7280] hover:text-[#111827] text-xs font-medium transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Open in browser instead
          </a>
        </div>
      </main>
    </div>
  );
}