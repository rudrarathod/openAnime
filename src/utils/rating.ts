export interface AgeRatingInfo {
  short: string;
  full: string;
  badgeClass: string;
}

export function formatAgeRating(rating?: string): AgeRatingInfo | null {
  if (!rating || typeof rating !== "string") return null;
  const r = rating.toLowerCase().trim();

  if (r.includes("pg-13") || r.includes("pg_13") || r === "pg13") {
    return {
      short: "PG-13",
      full: "Teens 13 or older",
      badgeClass: "bg-amber-500/80 text-amber-100 border-amber-400/50 shadow-amber-900/40",
    };
  }
  if (r.includes("r+") || r.includes("r_plus") || r.includes("nudity")) {
    return {
      short: "R+",
      full: "Mild Nudity / Severe Content",
      badgeClass: "bg-rose-600/90 text-rose-100 border-rose-400/50 shadow-rose-950/50",
    };
  }
  if (r.includes("r - 17") || r.includes("r_17") || r === "r" || r.includes("17+") || r === "r17") {
    return {
      short: "R-17+",
      full: "Restricted - 17+ (violence/profanity)",
      badgeClass: "bg-rose-500/80 text-rose-100 border-rose-400/50 shadow-rose-900/40",
    };
  }
  if (r.includes("rx") || r.includes("hentai") || r.includes("18+")) {
    return {
      short: "18+",
      full: "Adults Only (18+)",
      badgeClass: "bg-red-700/90 text-red-100 border-red-500/60 shadow-red-950/60",
    };
  }
  if (r.includes("pg")) {
    return {
      short: "PG",
      full: "Parental Guidance Suggested",
      badgeClass: "bg-blue-500/80 text-blue-100 border-blue-400/50 shadow-blue-900/40",
    };
  }
  if (r === "g" || r.startsWith("g ") || r.includes("all ages")) {
    return {
      short: "G",
      full: "All Ages",
      badgeClass: "bg-emerald-500/80 text-emerald-100 border-emerald-400/50 shadow-emerald-900/40",
    };
  }

  // Fallback for custom or unrecognized string
  const firstWord = rating.split(/[\s-]/)[0].toUpperCase();
  if (!firstWord) return null;
  return {
    short: firstWord.length <= 6 ? firstWord : "PG",
    full: rating,
    badgeClass: "bg-slate-700/80 text-slate-100 border-slate-500/40",
  };
}
