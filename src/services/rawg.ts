import { NormalizedGame, RAWGSearchResult } from '../types/catalog';

const CACHE_KEY = 'evox_rawg_cache_v2';
export const ENRICHED_DB_STORAGE_KEY = 'evox_saved_catalog_db';

export function getRawgCache(): Record<string, Partial<NormalizedGame>> {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveRawgCache(cache: Record<string, Partial<NormalizedGame>>) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch (e) {
    console.warn('Could not save RAWG cache to localStorage', e);
  }
}

export function saveEnrichedDatabaseLocally(games: NormalizedGame[]) {
  try {
    localStorage.setItem(ENRICHED_DB_STORAGE_KEY, JSON.stringify(games));
  } catch (e) {
    console.warn('Could not save enriched database to localStorage', e);
  }
}

export function getLocalEnrichedDatabase(): NormalizedGame[] | null {
  try {
    const raw = localStorage.getItem(ENRICHED_DB_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  return null;
}

export async function testRawgApiKey(apiKey: string): Promise<{ success: boolean; message: string }> {
  if (!apiKey || apiKey.trim().length < 10) {
    return { success: false, message: 'La clé API RAWG semble invalide ou trop courte.' };
  }
  try {
    const res = await fetch(`https://api.rawg.io/api/games?key=${encodeURIComponent(apiKey.trim())}&page_size=1`);
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        return { success: false, message: 'Clé API RAWG non autorisée (Erreur 401/403). Vérifiez votre token.' };
      }
      return { success: false, message: `Erreur HTTP ${res.status} de RAWG.io` };
    }
    const data = await res.json();
    if (data && Array.isArray(data.results)) {
      return { success: true, message: 'Connexion à RAWG.io réussie !' };
    }
    return { success: false, message: 'Réponse RAWG inattendue.' };
  } catch (err: any) {
    return { success: false, message: `Erreur réseau: ${err.message || 'Impossible de joindre RAWG.io'}` };
  }
}

export async function fetchRawgGameDetails(
  title: string,
  apiKey: string
): Promise<Partial<NormalizedGame> | null> {
  if (!apiKey) return null;

  const cache = getRawgCache();
  const cacheLookupKey = title.toLowerCase().trim();
  if (cache[cacheLookupKey]) {
    return cache[cacheLookupKey];
  }

  try {
    // 1. Search for the title
    const searchUrl = `https://api.rawg.io/api/games?key=${encodeURIComponent(apiKey.trim())}&search=${encodeURIComponent(title)}&page_size=1`;
    const res = await fetch(searchUrl);
    if (!res.ok) return null;

    const data = await res.json();
    if (!data.results || data.results.length === 0) return null;

    const topHit: RAWGSearchResult = data.results[0];

    // 2. Fetch detailed information for developers, publishers, esrb, playtime, etc.
    let descriptionRaw = '';
    let developers: string[] = [];
    let publishers: string[] = [];
    let esrb = '';
    let playtime = 0;
    let website = '';
    let redditUrl = '';
    let metacriticUrl = '';
    let tags: string[] = [];

    try {
      const detailRes = await fetch(`https://api.rawg.io/api/games/${topHit.id}?key=${encodeURIComponent(apiKey.trim())}`);
      if (detailRes.ok) {
        const detailData = await detailRes.json();
        descriptionRaw = detailData.description_raw || detailData.description || '';
        developers = detailData.developers?.map((d: any) => d.name) || [];
        publishers = detailData.publishers?.map((p: any) => p.name) || [];
        esrb = detailData.esrb_rating?.name || '';
        playtime = detailData.playtime || 0;
        website = detailData.website || '';
        redditUrl = detailData.reddit_url || '';
        metacriticUrl = detailData.metacritic_url || '';
        tags = detailData.tags?.slice(0, 6).map((t: any) => t.name) || [];
      }
    } catch {
      // fallback
    }

    const genres = topHit.genres?.map(g => g.name) || [];
    const screenshots = topHit.short_screenshots?.map(s => s.image) || [];

    const enriched: Partial<NormalizedGame> = {
      rawgId: topHit.id,
      rawgSlug: topHit.slug,
      releaseDate: topHit.released,
      rating: topHit.rating,
      metacritic: topHit.metacritic,
      metacriticUrl: metacriticUrl || undefined,
      banner: topHit.background_image,
      genres: genres.length > 0 ? genres : undefined,
      developers: developers.length > 0 ? developers : undefined,
      publishers: publishers.length > 0 ? publishers : undefined,
      esrb: esrb || undefined,
      playtime: playtime > 0 ? playtime : undefined,
      website: website || undefined,
      redditUrl: redditUrl || undefined,
      tags: tags.length > 0 ? tags : undefined,
      screenshots: screenshots.length > 0 ? screenshots : undefined,
      enrichedAt: new Date().toISOString(),
    };

    if (descriptionRaw && descriptionRaw.trim().length > 0) {
      enriched.description = descriptionRaw;
    }

    // Cache the result
    cache[cacheLookupKey] = enriched;
    saveRawgCache(cache);

    return enriched;
  } catch (err) {
    console.error(`RAWG fetch error for "${title}":`, err);
    return null;
  }
}

export async function enrichGamesBatch(
  games: NormalizedGame[],
  apiKey: string,
  onProgress: (current: number, total: number, lastGameTitle: string) => void,
  shouldStop: () => boolean
): Promise<NormalizedGame[]> {
  const result = [...games];
  const total = games.length;

  for (let i = 0; i < total; i++) {
    if (shouldStop()) break;

    const game = result[i];
    onProgress(i + 1, total, game.title);

    // CRITICAL: ONLY scan game catalogs! NEVER scan homebrew catalogs or homebrew apps!
    if (
      game.catalogSource === 'homebrew' ||
      game.catalogSource === 'evox' ||
      game.category === 'Homebrew' ||
      game.category === 'Tool' ||
      game.category === 'App'
    ) {
      continue;
    }

    // Skip games that are already enriched and have a valid banner
    if (game.enrichedAt && game.banner && game.developers) {
      continue;
    }

    const titleToSearch = game.normalizedTitle || game.title;
    const enrichedData = await fetchRawgGameDetails(titleToSearch, apiKey);

    if (enrichedData) {
      result[i] = {
        ...game,
        ...enrichedData,
        // Keep original cover if valid, or use RAWG banner
        icon: game.icon && !game.icon.includes('placeholder') && !game.icon.includes('unsplash')
          ? game.icon
          : (enrichedData.banner || game.icon),
        genres: enrichedData.genres && enrichedData.genres.length > 0 ? enrichedData.genres : game.genres,
        description: enrichedData.description || game.description,
      };
    }

    // Rate-limiting delay to protect RAWG API quota
    await new Promise(r => setTimeout(r, 220));
  }

  // Persist locally so reloading NEVER loses enriched data
  saveEnrichedDatabaseLocally(result);

  return result;
}
