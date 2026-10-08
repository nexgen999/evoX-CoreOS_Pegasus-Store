export interface DownloadLink {
  name: string;
  url: string;
  type: 'Base Game' | 'Update' | 'DLC' | 'Backport' | 'Homebrew' | 'Fichier';
  size?: string;
  version?: string;
}

export interface NormalizedGame {
  id: string; // Unique internal ID
  titleId: string; // e.g., PPSA01234, CUSA01234, or N/A
  title: string;
  normalizedTitle: string;
  category: string; // PS5, PS4, Homebrew, Tool, App
  catalogSource: string; // blackbox, pippo, dlps, pfs, evox, homebrew, custom
  catalogSourceName: string;
  version: string;
  size: string;
  sizeBytes: number;
  releaseDate?: string;
  rating?: number; // 0 to 5 (from RAWG)
  metacritic?: number; // 0 to 100
  metacriticUrl?: string;
  genres: string[];
  tags?: string[];
  developers?: string[];
  publishers?: string[];
  esrb?: string;
  playtime?: number; // in hours
  website?: string;
  redditUrl?: string;
  trailerUrl?: string;
  icon: string; // Cover poster
  banner?: string; // High-res background image
  screenshots?: string[];
  description: string;
  links: DownloadLink[];
  rawgId?: number;
  rawgSlug?: string;
  enrichedAt?: string;
  hasUpdates?: boolean;
}

export interface CatalogSourceConfig {
  id: string;
  name: string;
  iconName: string;
  urls: string[];
  description?: string;
  enabled: boolean;
  isCustom?: boolean;
  isGameCatalog: boolean; // TRUE for BlackBox, Pippo, DLPS, PFS - FALSE for Homebrew/evoX
}

export interface RAWGSearchResult {
  id: number;
  slug: string;
  name: string;
  released?: string;
  background_image?: string;
  rating?: number;
  metacritic?: number;
  genres?: { id: number; name: string; slug: string }[];
  short_screenshots?: { id: number; image: string }[];
  description_raw?: string;
}

export interface UserSyncState {
  favorites: string[];
  customCatalogs: CatalogSourceConfig[];
  rawgToken?: string;
  lastSyncDate: string;
  detailMode: 'page' | 'popup';
  defaultViewMode: 'grid' | 'cards' | 'list' | 'table';
}

export type ViewMode = 'grid' | 'cards' | 'list' | 'table';
export type DetailMode = 'page' | 'popup';
export type NavTab = 'discover' | 'browse' | 'updates';
