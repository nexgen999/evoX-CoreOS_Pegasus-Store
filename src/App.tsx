import React, { useState, useEffect, useCallback } from 'react';
import { 
  DEFAULT_CATALOG_SOURCES, 
  INITIAL_SAMPLE_GAMES 
} from './data/defaultCatalogs';
import { 
  CatalogSourceConfig, 
  DetailMode, 
  NavTab, 
  NormalizedGame, 
  UserSyncState 
} from './types/catalog';
import { getLocalSyncState, saveLocalSyncState } from './services/sync';
import { getLocalEnrichedDatabase, saveEnrichedDatabaseLocally } from './services/rawg';

import { Header } from './components/Header';
import { DiscoverView } from './components/DiscoverView';
import { BrowseView } from './components/BrowseView';
import { RecentUpdatesView } from './components/RecentUpdatesView';
import { StudioModal } from './components/StudioModal';
import { GameDetailPage } from './components/GameDetailPage';
import { GameDetailModal } from './components/GameDetailModal';
import { QuickSearchModal } from './components/QuickSearchModal';
import { SlidersHorizontal } from 'lucide-react';
import { getAppConfig, SocialLink } from './utils/config';

export default function App() {
  const appConfig = getAppConfig();
  const [games, setGames] = useState<NormalizedGame[]>(INITIAL_SAMPLE_GAMES);
  const [catalogConfigs, setCatalogConfigs] = useState<CatalogSourceConfig[]>(DEFAULT_CATALOG_SOURCES);
  const [activeTab, setActiveTab] = useState<NavTab>('discover');
  const [selectedCatalog, setSelectedCatalog] = useState<string>('all');
  const [selectedGame, setSelectedGame] = useState<NormalizedGame | null>(null);
  const [detailMode, setDetailMode] = useState<DetailMode>('page');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [rawgToken, setRawgToken] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isStudioOpen, setIsStudioOpen] = useState(false);

  // Initialize from LocalStorage / Sync state
  useEffect(() => {
    const localState = getLocalSyncState();
    setFavorites(localState.favorites || []);
    if (localState.detailMode) setDetailMode(localState.detailMode);
    if (localState.rawgToken) setRawgToken(localState.rawgToken);

    if (localState.customCatalogs && localState.customCatalogs.length > 0) {
      setCatalogConfigs((prev) => {
        const customIds = new Set(localState.customCatalogs.map(c => c.id));
        const filteredPrev = prev.filter(c => !customIds.has(c.id));
        return [...filteredPrev, ...localState.customCatalogs];
      });
    }

    if (typeof window !== 'undefined' && window.location.search.includes('studio=1')) {
      setIsStudioOpen(true);
    }
  }, []);

  // Save changes to Sync state
  useEffect(() => {
    const custom = catalogConfigs.filter(c => c.isCustom);
    const syncState: UserSyncState = {
      favorites,
      customCatalogs: custom,
      rawgToken,
      lastSyncDate: new Date().toISOString(),
      detailMode,
      defaultViewMode: 'grid',
    };
    saveLocalSyncState(syncState);
  }, [favorites, catalogConfigs, rawgToken, detailMode]);

  // Load catalog database reliably without wiping enriched data
  const loadCatalogs = useCallback(async () => {
    // 1. Fetch the pre-compiled / workflow-generated catalog_database.json
    // Support GitHub Pages subpath (import.meta.env.BASE_URL) and relative path
    const candidateUrls = [
      './catalog_database.json',
      `${import.meta.env.BASE_URL || '/'}catalog_database.json`.replace('//', '/'),
      '/catalog_database.json'
    ];

    for (const url of candidateUrls) {
      try {
        const res = await fetch(url, { cache: 'no-cache' });
        if (res.ok) {
          const contentType = res.headers.get('content-type') || '';
          if (contentType.includes('text/html')) {
            // Received index.html fallback from SPA routing instead of JSON
            continue;
          }
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setGames(data);
            try {
              saveEnrichedDatabaseLocally(data);
            } catch {
              // localStorage quota exceeded is non-fatal
            }
            return;
          }
        }
      } catch {
        // try next candidate url
      }
    }

    // 2. Fallback to localStorage if offline
    const locallyEnriched = getLocalEnrichedDatabase();
    if (locallyEnriched && locallyEnriched.length > 0) {
      setGames(locallyEnriched);
      return;
    }

    // 3. Fallback to sample games
    setGames(INITIAL_SAMPLE_GAMES);
  }, []);

  useEffect(() => {
    loadCatalogs();
  }, [loadCatalogs]);

  // Toggle Favorite
  const handleToggleFavorite = (e: React.MouseEvent, gameId: string) => {
    e.stopPropagation();
    setFavorites((prev) =>
      prev.includes(gameId) ? prev.filter((id) => id !== gameId) : [...prev, gameId]
    );
  };

  // Switch to browse with a specific catalog selected
  const handleBrowseCatalog = (catalogKey: string) => {
    setSelectedCatalog(catalogKey);
    setActiveTab('browse');
    setSelectedGame(null);
  };

  return (
    <div className="min-h-screen bg-[#050811] text-[#eaf1fa] flex flex-col selection:bg-[#ff0055] selection:text-white font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Header (Clean, zero-clutter matching photo 2) */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setSelectedGame(null);
        }}
        detailMode={detailMode}
        setDetailMode={setDetailMode}
        onSelectCatalog={handleBrowseCatalog}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      {/* Main Content Area centered with breathing room matching Photo 2 */}
      <main className="flex-1 max-w-[1480px] w-full mx-auto px-4 sm:px-8 py-6">
        {/* Fullscreen Page Detail View */}
        {selectedGame && detailMode === 'page' ? (
          <GameDetailPage
            game={selectedGame}
            onBack={() => setSelectedGame(null)}
            isFavorite={favorites.includes(selectedGame.id)}
            onToggleFavorite={handleToggleFavorite}
          />
        ) : (
          /* Normal Tab Content */
          <>
            {activeTab === 'discover' && (
              <DiscoverView
                games={games}
                catalogConfigs={catalogConfigs.filter(c => c.enabled)}
                onSelectGame={(game) => setSelectedGame(game)}
                onBrowseCatalog={handleBrowseCatalog}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
              />
            )}

            {activeTab === 'browse' && (
              <BrowseView
                games={games}
                catalogConfigs={catalogConfigs.filter(c => c.enabled)}
                selectedCatalog={selectedCatalog}
                setSelectedCatalog={setSelectedCatalog}
                onSelectGame={(game) => setSelectedGame(game)}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
              />
            )}

            {activeTab === 'updates' && (
              <RecentUpdatesView
                games={games}
                onSelectGame={(game) => setSelectedGame(game)}
              />
            )}
          </>
        )}
      </main>

      {/* Pop-up Detail Modal (when detailMode is 'popup' and a game is selected) */}
      {selectedGame && detailMode === 'popup' && (
        <GameDetailModal
          game={selectedGame}
          onClose={() => setSelectedGame(null)}
          isFavorite={favorites.includes(selectedGame.id)}
          onToggleFavorite={handleToggleFavorite}
        />
      )}

      {/* Quick Search Modal (Ctrl + K) */}
      <QuickSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        games={games}
        onSelectGame={(game) => setSelectedGame(game)}
      />

      {/* Studio & Workflow Modal (for testing or exporting) */}
      {isStudioOpen && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setIsStudioOpen(false); }}
          className="fixed inset-0 z-50 bg-[#04070d]/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200"
        >
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#09101d] border border-[#1b2a44] rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.95)] overflow-y-auto p-6">
            <div className="flex justify-between items-center pb-4 mb-4 border-b border-[#1b2a44]">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-[#ff0055]" />
                <h2 className="text-base font-extrabold text-white">Studio de Données, RAWG & GitHub Actions</h2>
              </div>
              <button
                onClick={() => setIsStudioOpen(false)}
                className="bg-[#050811] hover:bg-[#ff0055] text-white border border-[#1b2a44] text-xs px-3 py-1.5 rounded-xl font-bold cursor-pointer"
              >
                Fermer
              </button>
            </div>

            <StudioModal
              games={games}
              setGames={(updated) => {
                setGames(updated);
                if (typeof updated === 'function') {
                  // handle functional update
                } else {
                  saveEnrichedDatabaseLocally(updated);
                }
              }}
              catalogConfigs={catalogConfigs}
              setCatalogConfigs={setCatalogConfigs}
              rawgToken={rawgToken}
              setRawgToken={setRawgToken}
            />
          </div>
        </div>
      )}

      {/* Footer matching console interface & configurable via /web/config.js */}
      <footer className="border-t border-[#1b2a44] bg-[#060911] py-8 text-center text-xs text-[#627798]">
        <div className="max-w-[1480px] mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-5">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">{appConfig.brandName || 'evoX CoreOS'}</span>
            <span className="text-[#ff0055]">●</span>
            <span className="text-[#7990b5]">{appConfig.brandSub || 'Pegasus Store'}</span>
          </div>

          {/* Social Icons (Font Awesome or custom image URLs configured in /web/config.js) */}
          <div className="flex items-center gap-2.5">
            {appConfig.socialLinks.map((link, idx) => {
              const isImage = link.icon.startsWith('http://') || link.icon.startsWith('https://') || link.icon.startsWith('/') || link.icon.includes('.png') || link.icon.includes('.svg');
              return (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  title={link.name}
                  className="w-9 h-9 rounded-xl bg-[#09101d] hover:bg-[#121c33] border border-[#1b2a44] hover:border-[#ff0055]/60 text-[#8ba2c4] hover:text-[#ff0055] flex items-center justify-center transition-all hover:scale-110 shadow-sm"
                >
                  {isImage ? (
                    <img src={link.icon} alt={link.name} className="w-4 h-4 object-contain" />
                  ) : (
                    <i className={`${link.icon} text-sm`} aria-hidden="true" />
                  )}
                </a>
              );
            })}
          </div>

          {/* Right Text / Custom Link (configured in /web/config.js) */}
          <div className="flex items-center gap-3 text-xs">
            {appConfig.footerRightLink ? (
              <a
                href={appConfig.footerRightLink}
                target="_blank"
                rel="noreferrer"
                className="text-[#7990b5] hover:text-white transition-colors"
              >
                {appConfig.footerRightText}
              </a>
            ) : (
              <span className="text-[#7990b5]">{appConfig.footerRightText}</span>
            )}

            {appConfig.showStudioInFooter && (
              <button
                onClick={() => setIsStudioOpen(true)}
                className="text-[#7990b5] hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer text-[11px] ml-2"
                title="Accéder au Studio RAWG"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#ff0055]" />
                <span>Studio</span>
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
