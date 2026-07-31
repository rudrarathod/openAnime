import { cachedFetch } from "../utils/apiCache";

const BASE_URL = "/api/mal";

export interface MalAnime {
  id: number;
  title: string;
  main_picture: {
    medium: string;
    large: string;
  };
  alternative_titles?: {
    synonyms?: string[];
    en?: string;
    ja?: string;
  };
  synopsis?: string;
  mean?: number;
  num_episodes?: number;
  start_season?: {
    year: number;
    season: string;
  };
  genres?: Array<{ id: number; name: string }>;
  media_type?: string;
  status?: string;
  average_episode_duration?: number;
  rank?: number;
  popularity?: number;
  rating?: string;
}

export function mapJikanToMal(item: any): MalAnime {
  if (!item) return null as any;
  const englishTitle = item.title_english || item.titles?.find((t: any) => t.type === "English")?.title;
  const japaneseTitle = item.title_japanese || item.titles?.find((t: any) => t.type === "Japanese")?.title;
  const synonyms = item.titles?.filter((t: any) => t.type === "Synonym")?.map((t: any) => t.title) || [];

  return {
    id: item.mal_id,
    title: item.title || englishTitle || "",
    main_picture: {
      medium: item.images?.jpg?.image_url || item.images?.webp?.image_url || "",
      large: item.images?.jpg?.large_image_url || item.images?.webp?.large_image_url || item.images?.jpg?.image_url || "",
    },
    alternative_titles: {
      en: englishTitle || item.title || "",
      ja: japaneseTitle || "",
      synonyms: synonyms,
    },
    synopsis: item.synopsis || "",
    mean: item.score || undefined,
    num_episodes: item.episodes || undefined,
    start_season: (item.year || item.season) ? { year: item.year || new Date().getFullYear(), season: item.season || "" } : undefined,
    genres: item.genres?.map((g: any) => ({ id: g.mal_id, name: g.name })) || [],
    media_type: item.type ? item.type.toLowerCase() : "tv",
    status: item.status || "",
    average_episode_duration: item.duration ? (parseInt(item.duration) || undefined) : undefined,
    rank: item.rank || undefined,
    popularity: item.popularity || undefined,
    rating: item.rating || undefined,
  };
}

async function safeFetchJson(url: string, retries = 2, delayMs = 350): Promise<any> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const headers: Record<string, string> = {};
      if (url.startsWith(BASE_URL) || url.startsWith("/api/mal") || url.includes("api.myanimelist.net")) {
        headers["X-MAL-CLIENT-ID"] = "6114d00ca681b7701d1e15fe11a4987e";
      }

      const res = await fetch(url, {
        headers: Object.keys(headers).length > 0 ? headers : undefined,
      });

      if (res.status === 429 && attempt < retries) {
        await new Promise((r) => setTimeout(r, (attempt + 1) * 800));
        continue;
      }
      if (!res.ok) {
        if (attempt < retries) {
          await new Promise((r) => setTimeout(r, delayMs));
          continue;
        }
        return null;
      }
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        if (attempt < retries) {
          await new Promise((r) => setTimeout(r, delayMs));
          continue;
        }
        return null;
      }
      return await res.json();
    } catch {
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, delayMs));
        continue;
      }
      return null;
    }
  }
  return null;
}

// Queue Jikan API calls to ensure max 1 request per 350ms to strictly comply with Jikan rate limits (3 req/sec)
let jikanQueue: Promise<any> = Promise.resolve();
async function queuedJikanFetch(url: string, retries = 2, delayMs = 500): Promise<any> {
  const currentTask = jikanQueue.then(async () => {
    await new Promise((r) => setTimeout(r, 350));
    return safeFetchJson(url, retries, delayMs);
  });
  jikanQueue = currentTask.catch(() => {});
  return currentTask;
}

export async function fetchAniListRanking(type: string, page = 1, perPage = 20): Promise<MalAnime[]> {
  let sort = ["SCORE_DESC", "POPULARITY_DESC"];
  let status: string | undefined = undefined;
  let format: string | undefined = undefined;

  switch (type) {
    case "airing":
      status = "RELEASING";
      sort = ["POPULARITY_DESC", "SCORE_DESC"];
      break;
    case "bypopularity":
      sort = ["POPULARITY_DESC"];
      break;
    case "upcoming":
      status = "NOT_YET_RELEASED";
      sort = ["POPULARITY_DESC"];
      break;
    case "favorite":
      sort = ["FAVOURITES_DESC"];
      break;
    case "tv":
      format = "TV";
      sort = ["SCORE_DESC", "POPULARITY_DESC"];
      break;
    case "movie":
      format = "MOVIE";
      sort = ["SCORE_DESC", "POPULARITY_DESC"];
      break;
    case "ova":
      format = "OVA";
      sort = ["SCORE_DESC", "POPULARITY_DESC"];
      break;
    case "special":
      format = "SPECIAL";
      sort = ["SCORE_DESC", "POPULARITY_DESC"];
      break;
    case "all":
    default:
      sort = ["SCORE_DESC", "POPULARITY_DESC"];
      break;
  }

  const query = `
    query ($page: Int, $perPage: Int, $sort: [MediaSort], $status: MediaStatus, $format: MediaFormat) {
      Page(page: $page, perPage: $perPage) {
        media(type: ANIME, sort: $sort, status: $status, format: $format) {
          id
          idMal
          title {
            romaji
            english
            native
          }
          coverImage {
            extraLarge
            large
            medium
          }
          meanScore
          format
          episodes
          genres
          status
        }
      }
    }
  `;

  try {
    const res = await fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ query, variables: { page, perPage, sort, status, format } }),
    });
    if (!res.ok) return [];
    const json = await res.json();
    const media = json?.data?.Page?.media;
    if (!media || !Array.isArray(media)) return [];

    return media.map((item: any) => ({
      id: item.idMal || item.id,
      title: item.title?.english || item.title?.romaji || item.title?.native || "",
      main_picture: {
        medium: item.coverImage?.medium || item.coverImage?.large || "",
        large: item.coverImage?.extraLarge || item.coverImage?.large || item.coverImage?.medium || "",
      },
      alternative_titles: {
        en: item.title?.english || "",
        ja: item.title?.romaji || item.title?.native || "",
      },
      mean: item.meanScore ? Number((item.meanScore / 10).toFixed(2)) : undefined,
      num_episodes: item.episodes || undefined,
      genres: item.genres?.map((g: string, idx: number) => ({ id: idx + 1, name: g })) || [],
      media_type: item.format ? item.format.toLowerCase() : "tv",
      status: item.status || "",
    }));
  } catch (err) {
    console.error("AniList ranking fetch error:", err);
    return [];
  }
}

async function fetchJikanRanking(type: string, limit = 20, offset = 0): Promise<MalAnime[]> {
  try {
    const page = Math.floor(offset / 25) + 1;
    let url = `https://api.jikan.moe/v4/top/anime?page=${page}&limit=${Math.min(limit, 25)}&sfw=false`;
    
    if (type === "airing" || type === "upcoming" || type === "bypopularity" || type === "favorite") {
      url += `&filter=${type}`;
    } else if (type === "tv" || type === "movie" || type === "ova" || type === "special") {
      url += `&type=${type}`;
    }

    let json = await queuedJikanFetch(url, 2, 500);
    // Secondary fallback: if page > 1 or specific filter failed, retry top anime page 1
    if ((!json?.data || !Array.isArray(json.data) || json.data.length === 0) && page > 1) {
      json = await queuedJikanFetch(`https://api.jikan.moe/v4/top/anime?page=1&limit=25&sfw=false`, 2, 500);
    }

    if (!json?.data || !Array.isArray(json.data)) return [];

    return json.data.map(mapJikanToMal);
  } catch (err) {
    console.error("Failed to fetch ranking from Jikan:", err);
    return [];
  }
}

export async function fetchAniListSearch(queryStr: string, page = 1, perPage = 24): Promise<MalAnime[]> {
  const query = `
    query ($search: String, $page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        media(search: $search, type: ANIME, sort: [SEARCH_MATCH, POPULARITY_DESC]) {
          id
          idMal
          title {
            romaji
            english
            native
          }
          coverImage {
            extraLarge
            large
            medium
          }
          meanScore
          format
          episodes
          genres
          status
        }
      }
    }
  `;
  try {
    const res = await fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ query, variables: { search: queryStr, page, perPage } }),
    });
    if (!res.ok) return [];
    const json = await res.json();
    const media = json?.data?.Page?.media;
    if (!media || !Array.isArray(media)) return [];

    return media.map((item: any) => ({
      id: item.idMal || item.id,
      title: item.title?.english || item.title?.romaji || item.title?.native || "",
      main_picture: {
        medium: item.coverImage?.medium || item.coverImage?.large || "",
        large: item.coverImage?.extraLarge || item.coverImage?.large || item.coverImage?.medium || "",
      },
      alternative_titles: {
        en: item.title?.english || "",
        ja: item.title?.romaji || item.title?.native || "",
      },
      mean: item.meanScore ? Number((item.meanScore / 10).toFixed(2)) : undefined,
      num_episodes: item.episodes || undefined,
      genres: item.genres?.map((g: string, idx: number) => ({ id: idx + 1, name: g })) || [],
      media_type: item.format ? item.format.toLowerCase() : "tv",
      status: item.status || "",
    }));
  } catch (err) {
    console.error("AniList search error:", err);
    return [];
  }
}

export async function fetchAniListDetails(id: string | number): Promise<MalAnime | null> {
  const isNumeric = !isNaN(Number(id));
  if (!isNumeric) return null;
  const numId = Number(id);

  const query = `
    query ($idMal: Int, $id: Int) {
      Media(idMal: $idMal, id: $id, type: ANIME) {
        id
        idMal
        title {
          romaji
          english
          native
        }
        coverImage {
          extraLarge
          large
          medium
        }
        bannerImage
        description(asHtml: false)
        meanScore
        averageScore
        popularity
        favourites
        format
        episodes
        duration
        status
        genres
        startDate {
          year
          month
          day
        }
        endDate {
          year
          month
          day
        }
        season
        seasonYear
      }
    }
  `;

  try {
    const res = await fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        query,
        variables: { idMal: numId, id: numId },
      }),
    });
    if (!res.ok) return null;
    const json = await res.json();
    const item = json?.data?.Media;
    if (!item) return null;

    return {
      id: item.idMal || item.id,
      title: item.title?.english || item.title?.romaji || item.title?.native || "",
      main_picture: {
        medium: item.coverImage?.medium || item.coverImage?.large || "",
        large: item.coverImage?.extraLarge || item.bannerImage || item.coverImage?.large || "",
      },
      alternative_titles: {
        en: item.title?.english || "",
        ja: item.title?.romaji || item.title?.native || "",
      },
      synopsis: item.description?.replace(/<[^>]*>?/gm, "") || "",
      mean: item.meanScore ? Number((item.meanScore / 10).toFixed(2)) : (item.averageScore ? Number((item.averageScore / 10).toFixed(2)) : undefined),
      num_episodes: item.episodes || undefined,
      start_season: (item.seasonYear || item.season) ? { year: item.seasonYear || item.startDate?.year || new Date().getFullYear(), season: item.season ? item.season.toLowerCase() : "" } : undefined,
      genres: item.genres?.map((g: string, idx: number) => ({ id: idx + 1, name: g })) || [],
      media_type: item.format ? item.format.toLowerCase() : "tv",
      status: item.status || "",
      average_episode_duration: item.duration ? item.duration * 60 : undefined,
      popularity: item.popularity || undefined,
    };
  } catch (err) {
    console.error("AniList details error:", err);
    return null;
  }
}

export async function fetchMalRanking(type: string, limit = 20, offset = 0): Promise<MalAnime[]> {
  if (offset >= 1000) return [];
  const key = `v6_mal_ranking_${type}_${limit}_${offset}`;
  return cachedFetch(key, async () => {
    // 1. Primary: AniList GraphQL (Fast, reliable, keyless, zero CORS/403 issues)
    const aniListResults = await fetchAniListRanking(type, Math.floor(offset / limit) + 1, limit);
    if (aniListResults && aniListResults.length > 0) {
      return aniListResults;
    }

    // 2. Secondary fallback: MAL proxy
    const malUrl = `${BASE_URL}/anime/ranking?ranking_type=${type}&limit=${limit}&offset=${offset}&nsfw=true&fields=id,title,main_picture,alternative_titles,mean,media_type,num_episodes,genres,status,rating`;
    const malJson = await safeFetchJson(malUrl);
    if (malJson?.data && Array.isArray(malJson.data) && malJson.data.length > 0) {
      return malJson.data.map((item: any) => item.node);
    }

    // 3. Tertiary fallback: Jikan API (queued & throttled)
    return await fetchJikanRanking(type, limit, offset);
  }, 30 * 60 * 1000); // 30 min cache
}

async function fetchJikanSeasonal(year: number, season: string, limit = 20): Promise<MalAnime[]> {
  try {
    const url = `https://api.jikan.moe/v4/seasons/${year}/${season}?limit=${Math.min(limit, 25)}&sfw=false`;
    const json = await queuedJikanFetch(url);
    if (!json?.data || !Array.isArray(json.data)) return [];

    return json.data.map(mapJikanToMal);
  } catch (err) {
    console.error("Failed to fetch seasonal from Jikan:", err);
    return [];
  }
}

export async function fetchMalSeasonal(year: number, season: string, limit = 20): Promise<MalAnime[]> {
  const key = `v5_mal_seasonal_${year}_${season}_${limit}`;
  return cachedFetch(key, async () => {
    const aniListResults = await fetchAniListRanking("airing", 1, limit);
    if (aniListResults && aniListResults.length > 0) {
      return aniListResults;
    }

    const malUrl = `${BASE_URL}/anime/season/${year}/${season}?limit=${limit}&nsfw=true&fields=id,title,main_picture,alternative_titles,mean,media_type,num_episodes,genres,status,rating`;
    const malJson = await safeFetchJson(malUrl);
    if (malJson?.data && Array.isArray(malJson.data)) {
      return malJson.data.map((item: any) => item.node);
    }

    return await fetchJikanSeasonal(year, season, limit);
  }, 60 * 60 * 1000); // 1 hour cache
}

export const MAL_MIN_QUERY_LENGTH = 3;

async function fetchJikanSearch(query: string, limit = 20): Promise<MalAnime[]> {
  try {
    const url = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&sfw=false&limit=${Math.min(limit, 25)}`;
    const json = await queuedJikanFetch(url);
    if (!json?.data || !Array.isArray(json.data)) return [];

    return json.data.map(mapJikanToMal);
  } catch (err) {
    console.error("Failed to search from Jikan:", err);
    return [];
  }
}

export async function fetchMalSearch(query: string, limit = 20): Promise<MalAnime[]> {
  const trimmed = query.trim();
  if (trimmed.length < MAL_MIN_QUERY_LENGTH) return [];
  const key = `v5_mal_search_${trimmed.toLowerCase()}_${limit}`;
  return cachedFetch(key, async () => {
    // 1. Primary: AniList GraphQL Search
    const aniListResults = await fetchAniListSearch(trimmed, 1, limit);
    if (aniListResults && aniListResults.length > 0) {
      return aniListResults;
    }

    // 2. Secondary fallback: MAL Proxy
    const malUrl = `${BASE_URL}/anime?q=${encodeURIComponent(trimmed)}&limit=${limit}&nsfw=true&fields=id,title,main_picture,alternative_titles,mean,media_type,num_episodes,genres,status,rating`;
    const malJson = await safeFetchJson(malUrl);
    if (malJson?.data && Array.isArray(malJson.data)) {
      return malJson.data.map((item: any) => item.node);
    }

    // 3. Tertiary fallback: Jikan API
    return await fetchJikanSearch(trimmed, limit);
  }, 15 * 60 * 1000); // 15 min cache
}

export interface Genre {
  id: number;
  name: string;
}

export const ANIME_GENRES: Genre[] = [
  { id: 1, name: "Action" },
  { id: 2, name: "Adventure" },
  { id: 4, name: "Comedy" },
  { id: 8, name: "Drama" },
  { id: 10, name: "Fantasy" },
  { id: 14, name: "Horror" },
  { id: 7, name: "Mystery" },
  { id: 22, name: "Romance" },
  { id: 24, name: "Sci-Fi" },
  { id: 36, name: "Slice of Life" },
  { id: 30, name: "Sports" },
  { id: 37, name: "Supernatural" },
  { id: 41, name: "Thriller" },
  { id: 27, name: "Shounen" },
  { id: 18, name: "Mecha" },
  { id: 19, name: "Music" },
];

export async function fetchAniListByGenre(genreName: string, page = 1, perPage = 24): Promise<MalAnime[]> {
  const query = `
    query ($genre: String, $page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        media(genre: $genre, type: ANIME, sort: [SCORE_DESC, POPULARITY_DESC]) {
          id
          idMal
          title {
            romaji
            english
            native
          }
          coverImage {
            extraLarge
            large
            medium
          }
          meanScore
          format
          episodes
          genres
          status
        }
      }
    }
  `;
  try {
    const res = await fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ query, variables: { genre: genreName, page, perPage } })
    });
    if (!res.ok) return [];
    const json = await res.json();
    const media = json?.data?.Page?.media;
    if (!media || !Array.isArray(media)) return [];

    return media.map((item: any) => ({
      id: item.idMal || item.id,
      title: item.title?.english || item.title?.romaji || item.title?.native || "",
      main_picture: {
        medium: item.coverImage?.medium || item.coverImage?.large || "",
        large: item.coverImage?.extraLarge || item.coverImage?.large || item.coverImage?.medium || "",
      },
      alternative_titles: {
        en: item.title?.english || "",
        ja: item.title?.romaji || item.title?.native || "",
      },
      mean: item.meanScore ? Number((item.meanScore / 10).toFixed(2)) : undefined,
      num_episodes: item.episodes || undefined,
      genres: item.genres?.map((g: string, idx: number) => ({ id: idx + 1, name: g })) || [],
      media_type: item.format ? item.format.toLowerCase() : "tv",
      status: item.status || "",
    }));
  } catch (err) {
    console.error("AniList fetch error:", err);
    return [];
  }
}

export async function fetchAnimeByGenre(genreId: number, page = 1, limit = 24): Promise<MalAnime[]> {
  const key = `v5_mal_genre_${genreId}_${page}_${limit}`;
  return cachedFetch(key, async () => {
    const genreObj = ANIME_GENRES.find((g) => g.id === genreId);
    const genreName = genreObj ? genreObj.name : "Action";

    // 1. Try AniList GraphQL (Fast, reliable, high quality data)
    const aniListResults = await fetchAniListByGenre(genreName, page, limit);
    if (aniListResults && aniListResults.length > 0) {
      return aniListResults;
    }

    // 2. Fallback to Jikan API
    const url = `https://api.jikan.moe/v4/anime?genres=${genreId}&order_by=score&sort=desc&page=${page}&limit=${Math.min(limit, 25)}&sfw=false`;
    const json = await queuedJikanFetch(url, 2, 500);
    if (json?.data && Array.isArray(json.data) && json.data.length > 0) {
      return json.data.map(mapJikanToMal);
    }

    // 3. Last fallback: Top Anime filtered by genre
    const topAnime = await fetchJikanRanking("bypopularity", 25, (page - 1) * 25);
    if (topAnime && topAnime.length > 0) {
      const filtered = topAnime.filter((anime) =>
        anime.genres?.some((g) => g.name.toLowerCase().includes(genreName.toLowerCase()))
      );
      if (filtered.length > 0) return filtered;
      return topAnime;
    }

    return [];
  }, 30 * 60 * 1000);
}

async function fetchJikanDetails(id: string): Promise<MalAnime | null> {
  try {
    const url = `https://api.jikan.moe/v4/anime/${id}/full`;
    const json = await queuedJikanFetch(url);
    if (!json?.data) return null;

    return mapJikanToMal(json.data);
  } catch (err) {
    console.error(`Failed to fetch details from Jikan for ${id}:`, err);
    return null;
  }
}

export async function fetchMalDetails(id: string): Promise<MalAnime | null> {
  const key = `v5_mal_details_${id}`;
  return cachedFetch(key, async () => {
    // 1. Primary: AniList GraphQL Details
    const aniListDetails = await fetchAniListDetails(id);
    if (aniListDetails) {
      return aniListDetails;
    }

    // 2. Secondary fallback: MAL Proxy
    const fields = "id,title,main_picture,alternative_titles,start_date,end_date,synopsis,mean,rank,popularity,num_episodes,start_season,broadcast,source,average_episode_duration,rating,status,genres,media_type";
    const malUrl = `${BASE_URL}/anime/${id}?fields=${fields}&nsfw=true`;
    const malJson = await safeFetchJson(malUrl);
    if (malJson && !malJson.error && malJson.id) {
      return malJson;
    }

    // 3. Tertiary fallback: Jikan Details
    return await fetchJikanDetails(id);
  }, 2 * 60 * 60 * 1000); // 2 hour cache
}
