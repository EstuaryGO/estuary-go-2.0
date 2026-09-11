import { Link } from "react-router-dom";

const PREP_THUMBNAIL = "https://media.base44.com/images/public/6a971a771aed88257dedcb9e/fe675f3a8_prepsSQR.jpg";
const PRACTICE_THUMBNAIL = "https://media.base44.com/images/public/6a971a771aed88257dedcb9e/ff18f559a_practicesSQR.jpg";

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
          className="group relative rounded-2xl overflow-hidden border border-border bg-card aspect-square block"
        >
          <img src={PREP_THUMBNAIL} alt="3 Preps" className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
        </Link>

        <Link
          to="/preps-and-practices/practices"
          className="group relative rounded-2xl overflow-hidden border border-border bg-card aspect-square block"
        >
          <img src={PRACTICE_THUMBNAIL} alt="7 Practices" className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
        </Link>
      </div>
    </div>
  );
}