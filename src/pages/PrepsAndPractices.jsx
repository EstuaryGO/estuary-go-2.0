import { Link } from "react-router-dom";
import { PREP_INTRO_THUMBNAIL, PRACTICE_INTRO_THUMBNAIL } from "@/components/preps-practices/prepsPracticesData";

export default function PrepsAndPractices() {
  return (
    <div className="space-y-6">
      <div className="text-center pt-4 pb-2">
        <div className="inline-flex items-center justify-center">
          <span className="text-4xl font-extrabold tracking-tight text-primary">GO!</span>
        </div>
        <h1 className="text-lg font-bold text-foreground mt-2">Material</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Choose a path to continue your missional journey.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Link
          to="/preps-and-practices/preps"
          className="group relative rounded-2xl overflow-hidden border border-border bg-card aspect-square flex items-end"
        >
          <img src={PREP_INTRO_THUMBNAIL} alt="3 Preps" className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          <div className="relative z-10 w-full p-4">
            <span className="text-xl font-bold text-white drop-shadow">3 Preps</span>
            <p className="text-xs text-white/80">Prepare to live on mission</p>
          </div>
        </Link>

        <Link
          to="/preps-and-practices/practices"
          className="group relative rounded-2xl overflow-hidden border border-border bg-card aspect-square flex items-end"
        >
          <img src={PRACTICE_INTRO_THUMBNAIL} alt="7 Practices" className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          <div className="relative z-10 w-full p-4">
            <span className="text-xl font-bold text-white drop-shadow">7 Practices</span>
            <p className="text-xs text-white/80">Live the missionary life</p>
          </div>
        </Link>
      </div>
    </div>
  );
}