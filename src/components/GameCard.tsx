import React from 'react';
import { Star, Download, Heart, ArrowUpRight } from 'lucide-react';
import { NormalizedGame, ViewMode } from '../types/catalog';

interface GameCardProps {
  game: NormalizedGame;
  viewMode: ViewMode;
  onSelect: (game: NormalizedGame) => void;
  isFavorite: boolean;
  onToggleFavorite: (e: React.MouseEvent, gameId: string) => void;
}

export const GameCard: React.FC<GameCardProps> = ({
  game,
  viewMode,
  onSelect,
  isFavorite,
  onToggleFavorite,
}) => {
  const fallbackCover = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=400&auto=format&fit=crop';

  if (viewMode === 'cards') {
    return (
      <div
        onClick={() => onSelect(game)}
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onSelect(game)}
        className="group bg-[#09101d] hover:bg-[#0e1930] border border-[#1b2a44] hover:border-[#ff0055] rounded-2xl p-3.5 flex gap-4 transition-all duration-200 cursor-pointer shadow-lg hover:shadow-[0_10px_30px_rgba(255,0,85,0.2)]"
      >
        <div className="w-24 h-28 rounded-xl overflow-hidden bg-[#04070d] flex-shrink-0 relative">
          <img
            src={game.icon}
            alt={game.title}
            onError={(e) => { (e.target as HTMLImageElement).src = fallbackCover; }}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          {game.metacritic && (
            <div className="absolute top-1.5 left-1.5 bg-[#0a1426]/90 border border-[#00e676]/40 text-[#00e676] text-[10px] font-bold px-1.5 py-0.5 rounded-md">
              {game.metacritic}
            </div>
          )}
        </div>

        <div className="flex flex-col justify-between flex-1 min-w-0">
          <div>
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-bold text-white text-sm sm:text-base group-hover:text-[#ff0055] transition-colors truncate">
                {game.title}
              </h3>
              <button
                onClick={(e) => onToggleFavorite(e, game.id)}
                className="text-[#7990b5] hover:text-[#ff0055] p-1 rounded-lg hover:bg-[#1a2744] transition-colors cursor-pointer"
                title={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'text-[#ff0055] fill-[#ff0055]' : ''}`} />
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs text-[#7990b5] mt-1">
              <span className="font-mono text-[#00d9ff]">{game.titleId}</span>
              <span aria-hidden="true">·</span>
              <span>{game.category}</span>
              <span aria-hidden="true">·</span>
              <span>{game.version}</span>
            </div>

            {game.description && (
              <p className="text-xs text-[#8ca0c0] mt-1.5 line-clamp-2 leading-relaxed">
                {game.description}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between text-xs font-semibold text-[#8ca0c0] pt-2 border-t border-[#1b2a44]/60">
            <span className="text-[#00d9ff] font-mono">{game.size}</span>
            <span className="text-[#7990b5]">{game.catalogSourceName}</span>
          </div>
        </div>
      </div>
    );
  }

  if (viewMode === 'list') {
    return (
      <div
        onClick={() => onSelect(game)}
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onSelect(game)}
        className="group bg-[#09101d] hover:bg-[#0e1930] border border-[#1b2a44] hover:border-[#ff0055] rounded-xl px-4 py-2.5 flex items-center justify-between gap-4 transition-all cursor-pointer"
      >
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          <div className="w-10 h-12 rounded-lg overflow-hidden bg-[#04070d] flex-shrink-0">
            <img
              src={game.icon}
              alt={game.title}
              onError={(e) => { (e.target as HTMLImageElement).src = fallbackCover; }}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-white text-sm group-hover:text-[#ff0055] transition-colors truncate">
              {game.title}
            </h3>
            <div className="flex items-center gap-2 text-xs text-[#7990b5] mt-0.5">
              <span className="font-mono text-[#00d9ff]">{game.titleId}</span>
              <span aria-hidden="true">·</span>
              <span>{game.category}</span>
              <span aria-hidden="true">·</span>
              <span>{game.version}</span>
              <span aria-hidden="true">·</span>
              <span className="text-[#8ba2c4]">{game.catalogSourceName}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 flex-shrink-0">
          <span className="text-xs font-mono font-bold text-[#00d9ff] hidden sm:inline">
            {game.size}
          </span>
          <button
            onClick={(e) => onToggleFavorite(e, game.id)}
            className="text-[#7990b5] hover:text-[#ff0055] p-1.5 rounded-lg hover:bg-[#1a2744] transition-colors cursor-pointer"
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'text-[#ff0055] fill-[#ff0055]' : ''}`} />
          </button>
          <span className="bg-[#ff0055] group-hover:bg-[#e6004c] text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors">
            Voir
            <ArrowUpRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    );
  }

  // Exact Layout from Photo 2
  return (
    <div
      onClick={() => onSelect(game)}
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onSelect(game)}
      className="group bg-[#09101d] hover:bg-[#0c1529] border border-[#1b2a44] hover:border-[#ff0055] rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_12px_28px_rgba(255,0,85,0.28)] cursor-pointer select-none relative"
    >
      {/* Poster Image */}
      <div className="w-full aspect-[1/1.18] bg-[#04070d] overflow-hidden relative">
        <img
          src={game.icon}
          alt={game.title}
          onError={(e) => { (e.target as HTMLImageElement).src = fallbackCover; }}
          className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-500"
          loading="lazy"
        />

        {/* Favorite Heart Button */}
        <button
          onClick={(e) => onToggleFavorite(e, game.id)}
          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-[#0a1120]/80 border border-[#1b2a44] backdrop-blur-md flex items-center justify-center text-[#7990b5] hover:text-[#ff0055] transition-all hover:scale-110 z-10 cursor-pointer"
          title={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        >
          <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'text-[#ff0055] fill-[#ff0055]' : ''}`} />
        </button>

        {/* Metacritic Score */}
        {game.metacritic && (
          <div className="absolute top-2 left-2 bg-[#060a14]/85 border border-[#00e676]/50 text-[#00e676] text-[10px] font-black px-1.5 py-0.5 rounded-md backdrop-blur-md shadow-sm">
            {game.metacritic}
          </div>
        )}

        {/* Updates / DLC badge indicator if applicable */}
        {game.hasUpdates && (
          <div className="absolute bottom-2 left-2 bg-[#ff0055]/90 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-md backdrop-blur-md shadow-sm uppercase tracking-wide">
            DLC / Update
          </div>
        )}
      </div>

      {/* Info Container matching photo 2 */}
      <div className="p-3 flex flex-col justify-between flex-1">
        <div>
          <h3 
            className="font-bold text-[13px] text-white group-hover:text-[#ff0055] transition-colors truncate"
            title={game.title}
          >
            {game.title}
          </h3>

          {/* Line 2: Title ID (cyan) and Size (grey) */}
          <div className="flex items-center justify-between text-[11px] text-[#7990b5] mt-1 font-medium">
            <span className="font-mono text-[#00d9ff]">{game.titleId}</span>
            <span className="text-[#a4b8d6] font-mono">{game.size}</span>
          </div>
        </div>

        {/* Line 3: Catalog Source and Version */}
        <div className="flex items-center justify-between text-[10px] text-[#637a9f] mt-2 pt-1.5 border-t border-[#1b2a44]/50">
          <span className="truncate max-w-[95px]">{game.catalogSourceName}</span>
          <span>{game.version}</span>
        </div>
      </div>
    </div>
  );
};
