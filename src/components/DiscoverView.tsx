import React from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ArrowRight, 
  Box, 
  Gamepad2, 
  Layers, 
  Boxes, 
  Rocket, 
  Code2, 
  Star,
  Sparkles
} from 'lucide-react';
import { CatalogSourceConfig, NormalizedGame } from '../types/catalog';
import { HeroFeatured } from './HeroFeatured';
import { GameCard } from './GameCard';

interface DiscoverViewProps {
  games: NormalizedGame[];
  catalogConfigs: CatalogSourceConfig[];
  onSelectGame: (game: NormalizedGame) => void;
  onBrowseCatalog: (catalogKey: string) => void;
  favorites: string[];
  onToggleFavorite: (e: React.MouseEvent, gameId: string) => void;
}

export const DiscoverView: React.FC<DiscoverViewProps> = ({
  games,
  catalogConfigs,
  onSelectGame,
  onBrowseCatalog,
  favorites,
  onToggleFavorite,
}) => {
  const getIconForSource = (id: string) => {
    switch (id) {
      case 'blackbox': return <Box className="w-4 h-4 text-[#ff0055]" />;
      case 'pippo': return <Gamepad2 className="w-4 h-4 text-[#ff0055]" />;
      case 'dlps': return <Layers className="w-4 h-4 text-[#ff0055]" />;
      case 'pfs': return <Boxes className="w-4 h-4 text-[#ff0055]" />;
      case 'evox': return <Rocket className="w-4 h-4 text-[#ff0055]" />;
      case 'homebrew': return <Code2 className="w-4 h-4 text-[#00d9ff]" />;
      default: return <Sparkles className="w-4 h-4 text-[#ff0055]" />;
    }
  };

  // Group games by source
  const groupedBySource: Record<string, NormalizedGame[]> = {};
  games.forEach((g) => {
    if (!groupedBySource[g.catalogSource]) {
      groupedBySource[g.catalogSource] = [];
    }
    groupedBySource[g.catalogSource].push(g);
  });

  // Top Rated games for critical highlights (RAWG / Metacritic)
  const topRated = [...games]
    .filter(g => (g.rating && g.rating >= 4.0) || (g.metacritic && g.metacritic >= 85))
    .sort((a, b) => ((b.metacritic || 0) + (b.rating || 0) * 10) - ((a.metacritic || 0) + (a.rating || 0) * 10))
    .slice(0, 15);

  const scrollContainer = (id: string, direction: number) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollBy({ left: direction * 520, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      {/* Hero Showcase Slideshow */}
      <HeroFeatured
        games={games.slice(0, 8)}
        onSelectGame={onSelectGame}
      />

      {/* Top Rated Showcase (RAWG.io Highlights) if available */}
      {topRated.length > 0 && (
        <section className="space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Star className="w-5 h-5 text-[#ffb703] fill-[#ffb703]" />
              <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                Titres acclamés par la critique (RAWG / Metacritic)
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => scrollContainer('track-top-rated', -1)}
                className="w-8 h-8 rounded-full bg-[#0a1120] border border-[#1b2a44] text-white hover:bg-[#ff0055] hover:border-[#ff0055] transition-colors flex items-center justify-center cursor-pointer"
                title="Défiler à gauche"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scrollContainer('track-top-rated', 1)}
                className="w-8 h-8 rounded-full bg-[#0a1120] border border-[#1b2a44] text-white hover:bg-[#ff0055] hover:border-[#ff0055] transition-colors flex items-center justify-center cursor-pointer"
                title="Défiler à droite"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div
            id="track-top-rated"
            className="flex gap-3.5 overflow-x-auto pb-4 pt-1 no-scrollbar scroll-smooth"
          >
            {topRated.map((game, idx) => (
              <div key={`${game.id}-${idx}`} className="flex-none w-[155px] sm:w-[168px]">
                <GameCard
                  game={game}
                  viewMode="grid"
                  onSelect={onSelectGame}
                  isFavorite={favorites.includes(game.id)}
                  onToggleFavorite={onToggleFavorite}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Carousels by Catalog Source (BlackBox, Pippo, DLPS, PFS, evoX, Homebrew) */}
      {catalogConfigs.map((cfg) => {
        const catGames = groupedBySource[cfg.id] || [];
        if (catGames.length === 0) return null;

        const trackId = `track-${cfg.id}`;

        return (
          <section key={cfg.id} className="space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {getIconForSource(cfg.id)}
                <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                  {cfg.name}
                </h2>
                <span className="text-xs font-semibold text-[#7990b5] ml-1">
                  ({catGames.length} titres)
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => scrollContainer(trackId, -1)}
                    className="w-8 h-8 rounded-full bg-[#0a1120] border border-[#1b2a44] text-white hover:bg-[#ff0055] hover:border-[#ff0055] transition-colors flex items-center justify-center cursor-pointer"
                    title="Défiler à gauche"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => scrollContainer(trackId, 1)}
                    className="w-8 h-8 rounded-full bg-[#0a1120] border border-[#1b2a44] text-white hover:bg-[#ff0055] hover:border-[#ff0055] transition-colors flex items-center justify-center cursor-pointer"
                    title="Défiler à droite"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={() => onBrowseCatalog(cfg.id)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#0e1628] hover:bg-[#ff0055] text-[#8ba2c4] hover:text-white border border-[#1b2a44] hover:border-[#ff0055] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ml-1"
                >
                  Voir tout ({catGames.length})
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div
              id={trackId}
              className="flex gap-3.5 overflow-x-auto pb-4 pt-1 no-scrollbar scroll-smooth"
            >
              {catGames.slice(0, 30).map((game, idx) => (
                <div key={`${game.id}-${idx}`} className="flex-none w-[155px] sm:w-[168px]">
                  <GameCard
                    game={game}
                    viewMode="grid"
                    onSelect={onSelectGame}
                    isFavorite={favorites.includes(game.id)}
                    onToggleFavorite={onToggleFavorite}
                  />
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
};
