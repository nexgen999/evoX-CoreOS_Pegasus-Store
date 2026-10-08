/**
 * evoX CoreOS - Pegasus Hub Store
 * Script de normalisation et d'enrichissement automatique RAWG.io
 * 
 * Usage:
 *   node scripts/build-catalog.js
 *   RAWG_API_KEY="votre_cle_rawg" node scripts/build-catalog.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RAWG_API_KEY = process.env.RAWG_API_KEY || process.env.RAWG_TOKEN || '';

const SOURCES = [
  {
    id: 'blackbox',
    name: 'BlackBox Catalog',
    isGameCatalog: true,
    urls: [
      'https://raw.githubusercontent.com/BlackBoxPS5/blackbox/main/catalog/catalog.json'
    ]
  },
  {
    id: 'pippo',
    name: 'Pippo Catalog',
    isGameCatalog: true,
    urls: [
      'https://nexgen999.github.io/evoX-CoreOS/json/pegasus-dl/pippo.json'
    ]
  },
  {
    id: 'dlps',
    name: 'DLPS Catalog',
    isGameCatalog: true,
    urls: [
      'https://nexgen999.github.io/evoX-CoreOS/json/pegasus-dl/dlps.json'
    ]
  },
  {
    id: 'pfs',
    name: 'PFS Catalog',
    isGameCatalog: true,
    urls: [
      'https://nexgen999.github.io/evoX-CoreOS/json/pegasus-dl/pfs.json'
    ]
  },
  {
    id: 'evox',
    name: 'evoX-CoreOS APPS',
    isGameCatalog: false,
    urls: [
      'https://nexgen999.github.io/evoX-CoreOS/json/pegasus-dl/catalog.json'
    ]
  },
  {
    id: 'homebrew',
    name: 'Homebrew Store',
    isGameCatalog: false,
    urls: [
      'https://homebrew.page/catalog/v1.json'
    ]
  }
];

function parseSizeBytes(val) {
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

function formatSize(val) {
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

function cleanGameTitle(raw) {
  if (!raw) return 'Titre Inconnu';
  return raw
    .replace(/\[(CUSA|PPSA|NPUB|NPEB|NPUA|NPEA)[0-9]+\]/gi, '')
    .replace(/\s*-\s*(v[0-9.]+|v1\.[0-9]+|Backport|DLC|Update).*/i, '')
    .replace(/\s*\((PS5|PS4|USA|EUR|JPN|World|v[0-9.]+)\)/gi, '')
    .replace(/\.(pkg|fpkg|zip|rar|tar\.gz)$/i, '')
    .trim() || raw;
}

function extractAllLinks(obj, defaultTitle) {
  const rawLinks = [];
  const ignoredKeys = [
    'source_repo', 'downloadsource', 'download_source', 'icon_url', 'posterurl', 'poster_url',
    'poster', 'image', 'cover', 'banner', 'page', 'icon', 'metadataurl', 'metadata_url', 'thumbnail',
    'coverfallback', 'herofallback', 'background_image'
  ];

  function walk(data, currentLabel = '') {
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

  const seen = new Set();
  const result = [];

  for (const item of rawLinks) {
    if (!item.url || seen.has(item.url)) continue;

    const lowerCheck = (item.name + ' ' + item.url).toLowerCase();
    if (lowerCheck.includes('coverfallback') || lowerCheck.includes('herofallback')) continue;

    seen.add(item.url);

    const urlFileName = item.url.split('/').pop()?.split('?')[0] || '';
    const name = item.name && item.name !== defaultTitle ? item.name : (urlFileName || defaultTitle || 'Télécharger');
    const lower = (name + ' ' + item.url).toLowerCase();

    let type = 'Base Game';
    if (lower.includes('backport')) type = 'Backport';
    else if (lower.includes('dlc') || lower.includes('expansion')) type = 'DLC';
    else if (lower.includes('update') || lower.includes('patch') || lower.includes('v1.')) type = 'Update';
    else if (lower.includes('homebrew') || lower.includes('.pkg') || lower.includes('.elf') || lower.includes('.bin')) type = 'Homebrew';

    result.push({
      name,
      url: item.url,
      type
    });
  }

  return result;
}

function normalizeItem(x, index, catalogId, catalogName) {
  const title = x.name || x.title || x.app_name || x.game_name || 'Titre Inconnu';
  const rawId = x.id || x.titleId || x.title_id || x.gameId || x.game_id || x.pkg_id || '';
  const cleanId = rawId ? String(rawId).trim().split('-')[0].toUpperCase() : 'N/A';
  const rawSize = x.sizeBytes || x.size || x.file_size || x.package_size;
  const version = x.version || x.app_ver || 'v1.00';

  let img = x.cover || x.poster || x.image || x.posterUrl || x.icon_url || x.icon || '';
  if (img && !img.startsWith('http') && !img.startsWith('data:')) {
    img = 'https://raw.githubusercontent.com/BlackBoxPS5/blackbox/main/catalog/' + img.replace(/^\/+/, '');
  }

  const links = extractAllLinks(x, title);
  let category = x.category || x.region || x.platform || (cleanId.startsWith('PPSA') ? 'PS5' : cleanId.startsWith('CUSA') ? 'PS4' : 'PS5');
  if (catalogId === 'homebrew' || catalogId === 'evox') {
    category = 'Homebrew';
  }

  const genres = [];
  if (Array.isArray(x.genres)) {
    x.genres.forEach(g => genres.push(typeof g === 'string' ? g : g.name));
  } else if (typeof x.genre === 'string') {
    genres.push(...x.genre.split(/[,/]/).map(s => s.trim()));
  }

  return {
    id: `${catalogId}-${cleanId !== 'N/A' ? cleanId : 'ITEM'}-${index}-${title.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
    titleId: cleanId,
    title,
    normalizedTitle: cleanGameTitle(title),
    category,
    catalogSource: catalogId,
    catalogSourceName: catalogName,
    version,
    size: formatSize(rawSize),
    sizeBytes: parseSizeBytes(rawSize),
    releaseDate: x.release_date || x.releaseDate || undefined,
    rating: typeof x.rating === 'number' ? x.rating : undefined,
    metacritic: typeof x.metacritic === 'number' ? x.metacritic : undefined,
    genres: genres.length > 0 ? genres : [category],
    icon: img || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=400&auto=format&fit=crop',
    banner: x.banner || x.background_image || undefined,
    description: x.description || x.summary || x.about || '',
    links,
    hasUpdates: links.some(l => l.type === 'Update' || l.type === 'DLC'),
  };
}

async function enrichWithRawg(game, apiKey) {
  if (!apiKey) return null;
  // NEVER scan homebrew / app catalogs!
  if (game.catalogSource === 'homebrew' || game.catalogSource === 'evox' || game.category === 'Homebrew') {
    return null;
  }

  const searchTitle = game.normalizedTitle || game.title;
  try {
    const searchUrl = `https://api.rawg.io/api/games?key=${encodeURIComponent(apiKey)}&search=${encodeURIComponent(searchTitle)}&page_size=1`;
    const res = await fetch(searchUrl);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.results || data.results.length === 0) return null;

    const hit = data.results[0];

    // Fetch detailed info
    let descriptionRaw = '';
    let developers = [];
    let publishers = [];
    let esrb = '';
    let playtime = 0;
    let website = '';
    let redditUrl = '';
    let metacriticUrl = '';
    let tags = [];

    try {
      const detailRes = await fetch(`https://api.rawg.io/api/games/${hit.id}?key=${encodeURIComponent(apiKey)}`);
      if (detailRes.ok) {
        const detail = await detailRes.json();
        descriptionRaw = detail.description_raw || detail.description || '';
        developers = detail.developers?.map(d => d.name) || [];
        publishers = detail.publishers?.map(p => p.name) || [];
        esrb = detail.esrb_rating?.name || '';
        playtime = detail.playtime || 0;
        website = detail.website || '';
        redditUrl = detail.reddit_url || '';
        metacriticUrl = detail.metacritic_url || '';
        tags = detail.tags?.slice(0, 6).map(t => t.name) || [];
      }
    } catch {
      // ignore
    }

    // Screenshots
    let screenshots = hit.short_screenshots?.map(s => s.image) || [];

    return {
      rawgId: hit.id,
      rawgSlug: hit.slug,
      releaseDate: hit.released,
      rating: hit.rating,
      metacritic: hit.metacritic,
      metacriticUrl: metacriticUrl || undefined,
      banner: hit.background_image,
      genres: hit.genres?.map(g => g.name) || [],
      developers: developers.length > 0 ? developers : undefined,
      publishers: publishers.length > 0 ? publishers : undefined,
      esrb: esrb || undefined,
      playtime: playtime > 0 ? playtime : undefined,
      website: website || undefined,
      redditUrl: redditUrl || undefined,
      tags: tags.length > 0 ? tags : undefined,
      screenshots: screenshots.length > 0 ? screenshots : undefined,
      description: descriptionRaw || undefined,
      enrichedAt: new Date().toISOString()
    };
  } catch (e) {
    return null;
  }
}

async function main() {
  console.log('=== evoX CoreOS - Construction de la base de données unifiée ===');
  if (RAWG_API_KEY) {
    console.log('✓ Token RAWG.io détecté, enrichissement automatique activé (Jeux uniquement).');
  } else {
    console.log('ℹ Aucun token RAWG.io spécifié (RAWG_API_KEY). Normalisation directe.');
  }

  const allGames = [];

  for (const src of SOURCES) {
    console.log(`\nRécupération du catalogue : ${src.name}...`);
    let loaded = null;
    for (const u of src.urls) {
      try {
        const res = await fetch(u, { headers: { 'User-Agent': 'evoX-Hub-Store-Build/1.0' } });
        if (res.ok) {
          loaded = await res.json();
          console.log(`  ✓ Données téléchargées depuis : ${u}`);
          break;
        }
      } catch (err) {
        console.warn(`  ! Impossible de contacter ${u}: ${err.message}`);
      }
    }

    if (loaded) {
      const items = Array.isArray(loaded)
        ? loaded
        : (loaded.releases || loaded.apps || loaded.packages || loaded.items || []);
      console.log(`  → ${items.length} éléments bruts trouvés.`);
      const normalized = items.map((x, idx) => normalizeItem(x, idx, src.id, src.name));
      allGames.push(...normalized);
    } else {
      console.log(`  ⚠️ Aucun contenu récupéré pour ${src.name}.`);
    }
  }

  console.log(`\nTotal titres normalisés : ${allGames.length}`);

  // Charger le cache existant pour ne PAS rescrapper ce qui est déjà enrichi
  const existingDbPath = path.resolve(__dirname, '../public/catalog_database.json');
  const diskCachePath = path.resolve(__dirname, '../.rawg_cache.json');
  const memoryCache = new Map();

  function populateCacheFromList(list) {
    if (!Array.isArray(list)) return;
    for (const item of list) {
      if (item && item.enrichedAt) {
        if (item.titleId && item.titleId !== 'N/A') {
          memoryCache.set('ID:' + item.titleId.toUpperCase(), item);
        }
        if (item.normalizedTitle) {
          memoryCache.set('TITLE:' + item.normalizedTitle.toLowerCase().trim(), item);
        }
        if (item.title) {
          memoryCache.set('TITLE:' + item.title.toLowerCase().trim(), item);
        }
      }
    }
  }

  if (fs.existsSync(existingDbPath)) {
    try {
      const existingDb = JSON.parse(fs.readFileSync(existingDbPath, 'utf-8'));
      populateCacheFromList(existingDb);
    } catch {}
  }
  if (fs.existsSync(diskCachePath)) {
    try {
      const diskCache = JSON.parse(fs.readFileSync(diskCachePath, 'utf-8'));
      populateCacheFromList(diskCache);
    } catch {}
  }

  if (memoryCache.size > 0) {
    console.log(`⚡ Cache détecté : ${memoryCache.size} fiches déjà enrichies prêtes à être réutilisées instantanément.`);
  }

  if (RAWG_API_KEY && allGames.length > 0) {
    const gameItems = allGames.filter(g => g.catalogSource !== 'homebrew' && g.catalogSource !== 'evox' && g.category !== 'Homebrew');
    console.log(`\nTraitement des ${gameItems.length} jeux (Homebrew exclus)...`);
    
    let reusedCount = 0;
    let newlyEnrichedCount = 0;

    for (let i = 0; i < allGames.length; i++) {
      const g = allGames[i];
      if (g.catalogSource === 'homebrew' || g.catalogSource === 'evox' || g.category === 'Homebrew') {
        continue;
      }

      // 1. Vérifier si le jeu a déjà été enrichi dans le cache
      const cached = (g.titleId && g.titleId !== 'N/A' && memoryCache.get('ID:' + g.titleId.toUpperCase()))
        || memoryCache.get('TITLE:' + (g.normalizedTitle || g.title).toLowerCase().trim());

      if (cached && cached.enrichedAt) {
        // Réutilisation instantanée sans appel réseau ! (0 ms)
        allGames[i] = {
          ...g,
          rawgId: cached.rawgId,
          rawgSlug: cached.rawgSlug,
          releaseDate: cached.releaseDate || g.releaseDate,
          rating: cached.rating,
          metacritic: cached.metacritic,
          metacriticUrl: cached.metacriticUrl,
          banner: cached.banner || g.banner,
          icon: g.icon && !g.icon.includes('placeholder') && !g.icon.includes('unsplash')
            ? g.icon
            : (cached.banner || cached.icon || g.icon),
          genres: cached.genres && cached.genres.length > 0 ? cached.genres : g.genres,
          developers: cached.developers,
          publishers: cached.publishers,
          esrb: cached.esrb,
          playtime: cached.playtime,
          website: cached.website,
          redditUrl: cached.redditUrl,
          tags: cached.tags,
          screenshots: cached.screenshots,
          description: cached.description || g.description,
          enrichedAt: cached.enrichedAt
        };
        reusedCount++;
        continue;
      }

      // 2. Si le jeu est nouveau : appel à RAWG.io
      newlyEnrichedCount++;
      const gameShortTitle = (g.title || 'Inconnu').slice(0, 35);
      console.log(`  [+${newlyEnrichedCount}] RAWG Scraping (${i + 1}/${allGames.length}) : "${gameShortTitle}"...`);
      
      const enriched = await enrichWithRawg(g, RAWG_API_KEY);
      if (enriched) {
        allGames[i] = {
          ...g,
          ...enriched,
          genres: enriched.genres && enriched.genres.length > 0 ? enriched.genres : g.genres,
          description: enriched.description || g.description
        };
      } else {
        // Marquer comme traité pour éviter de réinterroger RAWG à chaque run
        allGames[i].enrichedAt = new Date().toISOString();
      }

      // Ajouter au cache mémoire
      if (g.titleId && g.titleId !== 'N/A') memoryCache.set('ID:' + g.titleId.toUpperCase(), allGames[i]);
      memoryCache.set('TITLE:' + (g.normalizedTitle || g.title).toLowerCase().trim(), allGames[i]);

      // Sauvegarde progressive du cache sur disque tous les 20 nouveaux jeux (sécurité)
      if (newlyEnrichedCount % 20 === 0) {
        try {
          const cacheData = Array.from(memoryCache.values());
          fs.writeFileSync(diskCachePath, JSON.stringify(cacheData, null, 2), 'utf-8');
        } catch {}
      }

      // Pause de 220ms pour respecter la limite de taux de RAWG.io
      await new Promise(r => setTimeout(r, 220));
    }
    console.log(`\n✓ Résumé : ${reusedCount} jeux réutilisés du cache (instantané 0ms), ${newlyEnrichedCount} nouveaux jeux enrichis.`);
  }

  // Sauvegarde finale du cache disque persistant
  try {
    const cacheData = Array.from(memoryCache.values());
    fs.writeFileSync(diskCachePath, JSON.stringify(cacheData, null, 2), 'utf-8');
  } catch {}

  // Écriture du fichier final
  const outputDir = path.resolve(__dirname, '../public');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, 'catalog_database.json');
  fs.writeFileSync(outputPath, JSON.stringify(allGames, null, 2), 'utf-8');

  console.log(`\n✓ Base de données finale générée avec succès :`);
  console.log(`  Fichier : ${outputPath}`);
  console.log(`  Titres : ${allGames.length}`);
  console.log(`  Mises à jour & DLCs détectés : ${allGames.filter(g => g.hasUpdates).length}`);
  console.log('=========================================================\n');
}

main().catch(err => {
  console.error('Erreur critique pendant la génération du catalogue:', err);
  process.exit(1);
});
