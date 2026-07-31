export interface FormattedTitle {
  title: string;       // Dub / English title if present, otherwise default title
  subtitle?: string;   // Original (Japanese / Romaji) title as subtitle
}

export function getFormattedAnimeTitles(anime: {
  title?: string;
  alternative_titles?: {
    en?: string;
    ja?: string;
    synonyms?: string[];
  };
  subtitle?: string;
}): FormattedTitle {
  const rawTitle = (anime.title || "").trim();
  const enTitle = (anime.alternative_titles?.en || "").trim();
  const jaTitle = (anime.alternative_titles?.ja || "").trim();

  if (anime.subtitle) {
    return {
      title: rawTitle,
      subtitle: anime.subtitle,
    };
  }

  if (enTitle && enTitle.length > 0) {
    const mainTitle = enTitle;
    let subtitle: string | undefined = undefined;

    if (rawTitle && rawTitle.toLowerCase() !== mainTitle.toLowerCase()) {
      subtitle = rawTitle;
    } else if (jaTitle && jaTitle.toLowerCase() !== mainTitle.toLowerCase()) {
      subtitle = jaTitle;
    }

    return {
      title: mainTitle,
      subtitle: subtitle,
    };
  }

  let subtitle: string | undefined = undefined;
  if (jaTitle && jaTitle.toLowerCase() !== rawTitle.toLowerCase()) {
    subtitle = jaTitle;
  }

  return {
    title: rawTitle,
    subtitle: subtitle,
  };
}
