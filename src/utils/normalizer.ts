import { DownloadLink, NormalizedGame } from '../types/catalog';

export function parseSizeBytes(val: any): number {
  if (!val) return 0;
  if (typeof val === 'number') return val;
  const str = String(val).toUpperCase().trim();
  const num = parseFloat(str);
  if (isNaN(num)) return 0;
  if (str.includes('TB')) return num * 1024 * 1024 * 1024 * 1024;
  if (str.includes('GB')) return num * 1024 * 1024 * 1024;
  if (str.includes('MB')) return num * 1024 * 1024;
  if (str.includes('KB')) return num * 1024;
  return num;
}

export function formatSize(val: any): string {
  if (!val || val === 'N/A' || val === 'Inconnu') return 'Inconnu';
  if (typeof val === 'string' && (val.includes('GB') || val.includes('MB') || val.includes('KB') || val.includes('TB'))) {
    return val;
  }
  let n = Number(val);
  if (isNaN(n) || n <= 0) return 'Inconnu';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let i = 0;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  return n.toFixed(n >= 100 ? 0 : 1) + ' ' + units[i];
}

export function cleanGameTitle(raw: string): string {
  if (!raw) return 'Titre Inconnu';
  return raw
    .replace(/\[(CUSA|PPSA|NPUB|NPEB|NPUA|NPEA)[0-9]+\]/gi, '')
    .replace(/\s*-\s*(v[0-9.]+|v1\.[0-9]+|Backport|DLC|Update).*/i, '')
    .replace(/\s*\((PS5|PS4|USA|EUR|JPN|World|v[0-9.]+)\)/gi, '')
    .replace(/\.(pkg|fpkg|zip|rar|tar\.gz)$/i, '')
    .trim() || raw;
}

export function extractAllLinks(obj: any, defaultTitle: string): DownloadLink[] {
  const rawLinks: { url: string; name: string }[] = [];
  const ignoredKeys = [
    'source_repo', 'downloadsource', 'download_source', 'icon_url', 'posterurl', 'poster_url',
    'poster', 'image', 'cover', 'banner', 'page', 'icon', 'metadataurl', 'metadata_url', 'thumbnail',
    'coverfallback', 'herofallback', 'background_image'
  ];

  function walk(data: any, currentLabel: string = '') {
    if (!data) return;

    if (typeof data === 'string') {
      const trimmed = data.trim();
      if ((trimmed.startsWith('http://') || trimmed.startsWith('https://')) && !/\.(png|jpg|jpeg|webp|gif|svg)$/i.test(trimmed)) {
        const splitUrls = trimmed.split(/[\n,\s]+/);
        splitUrls.forEach(url => {
          if ((url.startsWith('http://') || url.startsWith('https://')) && !/\.(png|jpg|jpeg|webp|gif|svg)$/i.test(url)) {
            rawLinks.push({ url, name: currentLabel || defaultTitle || 'Fichier' });
          }
        });
      }
      return;
    }

    if (Array.isArray(data)) {
      data.forEach(item => walk(item, currentLabel));
      return;
    }

    if (typeof data === 'object') {
      const labelLower = currentLabel.toLowerCase();
      if (ignoredKeys.includes(labelLower)) return;

      const directUrl = data.url || data.link || data.download_url || data.downloadUrl || data.pkg_url || data.path || data.artifact_url;
      const itemName = data.name || data.filename || data.title || data.label || data.version || currentLabel || defaultTitle;

      if (typeof directUrl === 'string' && !/\.(png|jpg|jpeg|webp|gif|svg)$/i.test(directUrl)) {
        walk(directUrl, itemName);
      }

      const targetKeys = ['links', 'downloadLinks', 'urls', 'download_urls', 'files', 'assets', 'versions', 'releases', 'downloads', 'attachments', 'mirrors'];
      for (const key of targetKeys) {
        if (data[key]) walk(data[key], currentLabel);
      }

      for (const k in data) {
        if (ignoredKeys.includes(k.toLowerCase())) continue;
        if (typeof data[k] === 'string' || typeof data[k] === 'object') {
          walk(data[k], k);
        }
      }
    }
  }

  walk(obj);

  const seen = new Set<string>();
  const result: DownloadLink[] = [];

  for (const item of rawLinks) {
    if (!item.url || seen.has(item.url)) continue;

    const lowerCheck = (item.name + ' ' + item.url).toLowerCase();
    if (lowerCheck.includes('coverfallback') || lowerCheck.includes('herofallback')) continue;

    seen.add(item.url);

    const urlFileName = item.url.split('/').pop()?.split('?')[0] || '';
    let name = item.name && item.name !== defaultTitle ? item.name : (urlFileName || defaultTitle || 'Télécharger');
    const lower = (name + ' ' + item.url).toLowerCase();

    let type: DownloadLink['type'] = 'Base Game';
    if (lower.includes('backport')) type = 'Backport';
    else if (lower.includes('dlc') || lower.includes('add-on') || lower.includes('expansion')) type = 'DLC';
    else if (lower.includes('update') || lower.includes('patch') || lower.includes('v1.') || lower.includes('v2.')) type = 'Update';
    else if (lower.includes('homebrew') || lower.includes('.pkg') || lower.includes('.elf') || lower.includes('.bin') || lower.includes('.apk')) type = 'Homebrew';

    result.push({
      name,
      url: item.url,
      type,
    });
  }

  return result;
}

export function normalizeItem(
  x: any,
  index: number,
  catalogSourceId: string,
  catalogSourceName: string
): NormalizedGame {
  const title = x.name || x.title || x.app_name || x.game_name || 'Titre Inconnu';
  const rawId = x.id || x.titleId || x.title_id || x.gameId || x.game_id || x.pkg_id || x.serial || '';
  const cleanId = rawId ? String(rawId).trim().split('-')[0].toUpperCase() : 'N/A';

  const rawSize = x.sizeBytes || x.size || x.file_size || x.package_size || x.filesize;
  const version = x.version || x.app_ver || x.game_version || 'v1.00';

  let img = x.cover || x.poster || x.image || x.posterUrl || x.poster_url || x.icon_url || x.icon || x.cover_url || '';
  if (img && !img.startsWith('http') && !img.startsWith('data:')) {
    img = 'https://raw.githubusercontent.com/BlackBoxPS5/blackbox/main/catalog/' + img.replace(/^\/+/, '');
  }

  const links = extractAllLinks(x, title);
  const hasUpdates = links.some(l => l.type === 'Update' || l.type === 'DLC' || l.type === 'Backport');

  // Infer genre/category if not provided
  let category = x.category || x.region || x.platform || (cleanId.startsWith('PPSA') ? 'PS5' : cleanId.startsWith('CUSA') ? 'PS4' : 'PS5');
  if (catalogSourceId === 'homebrew' || catalogSourceId === 'evox') {
    category = 'Homebrew';
  }

  const genres: string[] = [];
  if (Array.isArray(x.genres)) {
    x.genres.forEach((g: any) => {
      if (typeof g === 'string') genres.push(g);
      else if (g?.name) genres.push(g.name);
    });
  } else if (typeof x.genre === 'string') {
    genres.push(...x.genre.split(/[,/]/).map((s: string) => s.trim()));
  }

  return {
    id: `${catalogSourceId}-${cleanId !== 'N/A' ? cleanId : 'ITEM'}-${index}-${title.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
    titleId: cleanId,
    title,
    normalizedTitle: cleanGameTitle(title),
    category,
    catalogSource: catalogSourceId,
    catalogSourceName,
    version,
    size: formatSize(rawSize),
    sizeBytes: parseSizeBytes(rawSize),
    releaseDate: x.release_date || x.releaseDate || x.released || undefined,
    rating: typeof x.rating === 'number' ? x.rating : undefined,
    metacritic: typeof x.metacritic === 'number' ? x.metacritic : undefined,
    genres: genres.length > 0 ? genres : [category],
    icon: img || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=400&auto=format&fit=crop',
    banner: x.banner || x.background_image || undefined,
    screenshots: Array.isArray(x.screenshots) ? x.screenshots : undefined,
    description: x.description || x.summary || x.about || x.desc || '',
    links,
    hasUpdates,
    rawgId: x.rawg_id || x.rawgId,
    rawgSlug: x.rawg_slug || x.rawgSlug,
    enrichedAt: x.enriched_at || x.enrichedAt,
  };
}

export function parseRawCatalog(
  rawJson: any,
  catalogSourceId: string,
  catalogSourceName: string
): NormalizedGame[] {
  if (!rawJson) return [];
  const rawList: any[] = Array.isArray(rawJson)
    ? rawJson
    : (rawJson.releases || rawJson.apps || rawJson.packages || rawJson.items || rawJson.games || rawJson.data || []);

  return rawList.map((item, idx) => normalizeItem(item, idx, catalogSourceId, catalogSourceName));
}
