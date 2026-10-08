import React, { useState } from 'react';
import { 
  Compass, 
  Gamepad2, 
  Grid3X3, 
  History, 
  Search, 
  ChevronDown, 
  Box, 
  Layers, 
  Boxes, 
  Rocket, 
  Code2,
  Tv,
  Maximize2
} from 'lucide-react';
import { DetailMode, NavTab } from '../types/catalog';

import { getAppConfig, resolveAvatarUrl } from '../utils/config';

interface HeaderProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  detailMode: DetailMode;
  setDetailMode: (mode: DetailMode) => void;
  onSelectCatalog: (catalogKey: string) => void;
  onOpenSearch: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  detailMode,
  setDetailMode,
  onSelectCatalog,
  onOpenSearch,
}) => {
  const [gamesMenuOpen, setGamesMenuOpen] = useState(false);
  const [homebrewMenuOpen, setHomebrewMenuOpen] = useState(false);
  const [avatarLoadError, setAvatarLoadError] = useState(false);

  const appConfig = getAppConfig();
  const avatarUrl = resolveAvatarUrl(appConfig);

  return (
    <header className="sticky top-0 z-40 bg-[#060911]/92 backdrop-blur-xl border-b border-[#1b2a44] transition-all">
      <div className="max-w-[1480px] mx-auto px-4 sm:px-8 py-3 flex items-center justify-between gap-4">
        
        {/* Brand with GitHub Avatar */}
        <div 
          onClick={() => setActiveTab('discover')}
          className="flex items-center gap-2.5 cursor-pointer group select-none flex-shrink-0"
          tabIndex={0}
          role="button"
          onKeyDown={(e) => e.key === 'Enter' && setActiveTab('discover')}
        >
          <div className="w-9 h-9 rounded-xl overflow-hidden border border-[#ff0055]/50 shadow-[0_0_18px_rgba(255,0,85,0.45)] group-hover:scale-105 transition-transform flex items-center justify-center bg-[#0a1120] relative">
            {!avatarLoadError ? (
              <img
                src={avatarUrl}
                alt="GitHub Avatar"
                onError={() => setAvatarLoadError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#ff0055] to-[#88002e] flex items-center justify-center font-black text-white text-base">
                e
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <div className="font-black text-lg tracking-tight leading-none flex items-center gap-1">
              <span className="text-white">evo</span>
              <span className="text-white font-black">X</span>
              <span className="text-[#ff0055] font-extrabold ml-0.5">CoreOS</span>
            </div>
            <span className="text-[11px] font-semibold text-[#7990b5] tracking-wide mt-0.5">
              Pegasus Store
            </span>
          </div>
        </div>

        {/* Navigation Menus (Pristine, no clutter) */}
        <nav className="hidden lg:flex items-center gap-2 flex-1 justify-center">
          <button
            onClick={() => setActiveTab('discover')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'discover'
                ? 'bg-[#ff0055] text-white shadow-[0_4px_18px_rgba(255,0,85,0.4)]'
                : 'text-[#8ba2c4] hover:text-white hover:bg-[#0e162a]'
            }`}
          >
            <Compass className="w-4 h-4" />
            Accueil
          </button>

          <button
            onClick={() => setActiveTab('browse')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'browse'
                ? 'bg-[#ff0055] text-white shadow-[0_4px_18px_rgba(255,0,85,0.4)]'
                : 'text-[#8ba2c4] hover:text-white hover:bg-[#0e162a]'
            }`}
          >
            <Grid3X3 className="w-4 h-4" />
            Catalogue
          </button>

          {/* Menu Déroulant Catalogues Jeux */}
          <div 
            className="relative"
            onMouseEnter={() => setGamesMenuOpen(true)}
            onMouseLeave={() => setGamesMenuOpen(false)}
          >
            <button
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-[#8ba2c4] hover:text-white hover:bg-[#0e162a] transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Gamepad2 className="w-4 h-4 text-[#ff0055]" />
              Catalogues Jeux
              <ChevronDown className="w-3 h-3 text-[#7990b5]" />
            </button>
            {gamesMenuOpen && (
              <div className="absolute top-full left-0 mt-1 w-56 bg-[#0a1224] border border-[#1b2a44] rounded-2xl p-1.5 shadow-[0_20px_45px_rgba(0,0,0,0.9)] z-50 backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-150">
                <button
                  onClick={() => { onSelectCatalog('blackbox'); setGamesMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-[#8ba2c4] hover:text-white hover:bg-[#ff0055] flex items-center gap-2.5 transition-all cursor-pointer"
                >
                  <Box className="w-3.5 h-3.5" />
                  BlackBox Catalog
                </button>
                <button
                  onClick={() => { onSelectCatalog('pippo'); setGamesMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-[#8ba2c4] hover:text-white hover:bg-[#ff0055] flex items-center gap-2.5 transition-all cursor-pointer"
                >
                  <Gamepad2 className="w-3.5 h-3.5" />
                  Pippo Catalog
                </button>
                <button
                  onClick={() => { onSelectCatalog('pfs'); setGamesMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-[#8ba2c4] hover:text-white hover:bg-[#ff0055] flex items-center gap-2.5 transition-all cursor-pointer"
                >
                  <Boxes className="w-3.5 h-3.5" />
                  PFS Catalog
                </button>
                <button
                  onClick={() => { onSelectCatalog('dlps'); setGamesMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-[#8ba2c4] hover:text-white hover:bg-[#ff0055] flex items-center gap-2.5 transition-all cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5" />
                  DLPS Catalog
                </button>
              </div>
            )}
          </div>

          {/* Menu Déroulant Homebrew */}
          <div 
            className="relative"
            onMouseEnter={() => setHomebrewMenuOpen(true)}
            onMouseLeave={() => setHomebrewMenuOpen(false)}
          >
            <button
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-[#8ba2c4] hover:text-white hover:bg-[#0e162a] transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Code2 className="w-4 h-4 text-[#00d9ff]" />
              Homebrew
              <ChevronDown className="w-3 h-3 text-[#7990b5]" />
            </button>
            {homebrewMenuOpen && (
              <div className="absolute top-full left-0 mt-1 w-56 bg-[#0a1224] border border-[#1b2a44] rounded-2xl p-1.5 shadow-[0_20px_45px_rgba(0,0,0,0.9)] z-50 backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-150">
                <button
                  onClick={() => { onSelectCatalog('evox'); setHomebrewMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-[#8ba2c4] hover:text-white hover:bg-[#ff0055] flex items-center gap-2.5 transition-all cursor-pointer"
                >
                  <Rocket className="w-3.5 h-3.5 text-[#ff0055]" />
                  evoX-CoreOS APPS
                </button>
                <button
                  onClick={() => { onSelectCatalog('homebrew'); setHomebrewMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-[#8ba2c4] hover:text-white hover:bg-[#ff0055] flex items-center gap-2.5 transition-all cursor-pointer"
                >
                  <Code2 className="w-3.5 h-3.5 text-[#00d9ff]" />
                  Homebrew Store
                </button>
              </div>
            )}
          </div>

          {/* Mises à jour */}
          <button
            onClick={() => setActiveTab('updates')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'updates'
                ? 'bg-[#ff0055] text-white shadow-[0_4px_18px_rgba(255,0,85,0.4)]'
                : 'text-[#8ba2c4] hover:text-white hover:bg-[#0e162a]'
            }`}
          >
            <History className="w-4 h-4" />
            Mises à jour
          </button>
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          {/* Detail Mode Switcher (Page vs Popup) */}
          <div className="flex items-center bg-[#0a1120] border border-[#1b2a44] p-0.5 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setDetailMode('page')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                detailMode === 'page'
                  ? 'bg-[#ff0055] text-white shadow-sm font-bold'
                  : 'text-[#7990b5] hover:text-white'
              }`}
              title="Affichage des détails en pleine page"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              Page
            </button>
            <button
              onClick={() => setDetailMode('popup')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                detailMode === 'popup'
                  ? 'bg-[#ff0055] text-white shadow-sm font-bold'
                  : 'text-[#7990b5] hover:text-white'
              }`}
              title="Affichage des détails en pop-up modal"
            >
              <Tv className="w-3.5 h-3.5" />
              Pop-up
            </button>
          </div>

          {/* Search Trigger Button */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 bg-[#ff0055] hover:bg-[#e6004c] text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-[0_4px_16px_rgba(255,0,85,0.35)] transition-all cursor-pointer"
            title="Recherche rapide (Ctrl + K)"
          >
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline">Rechercher</span>
            <kbd className="hidden md:inline bg-black/25 text-[10px] px-1.5 py-0.5 rounded text-white/80 font-mono">
              ⌘K
            </kbd>
          </button>
        </div>

      </div>

      {/* Mobile Navigation bar */}
      <div className="flex lg:hidden overflow-x-auto px-4 py-2 border-t border-[#1b2a44]/60 gap-1.5 no-scrollbar bg-[#060911]">
        <button
          onClick={() => setActiveTab('discover')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer ${
            activeTab === 'discover' ? 'bg-[#ff0055] text-white' : 'text-[#8ba2c4]'
          }`}
        >
          Accueil
        </button>
        <button
          onClick={() => setActiveTab('browse')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer ${
            activeTab === 'browse' ? 'bg-[#ff0055] text-white' : 'text-[#8ba2c4]'
          }`}
        >
          Catalogue
        </button>
        <button
          onClick={() => setActiveTab('updates')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer ${
            activeTab === 'updates' ? 'bg-[#ff0055] text-white' : 'text-[#8ba2c4]'
          }`}
        >
          Mises à jour
        </button>
      </div>
    </header>
  );
};
