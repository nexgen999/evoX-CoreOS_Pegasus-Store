import React from 'react';
import { Heart, Trash2, ArrowRight } from 'lucide-react';
import { NormalizedGame } from '../types/catalog';
import { GameCard } from './GameCard';

interface FavoritesViewProps {
  games: NormalizedGame[];
  favorites: string[];
  onSelectGame: (game: NormalizedGame) => void;
  onToggleFavorite: (e: React.MouseEvent, gameId: string) => void;
  onClearFavorites: () => void;
  onGoToBrowse: () => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  games,
  favorites,
  onSelectGame,
  onToggleFavorite,
  onClearFavorites,
  onGoToBrowse,
}) => {
  const favoriteGames = games.filter((g) => favorites.includes(g.id));

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1b2a44] pb-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Heart className="w-6 h-6 text-[#ff0055] fill-[#ff0055]" />
            Vos Titres Favoris & Liste de Souhaits
          </h1>
          <p className="text-xs text-[#7990b5] mt-1">
            {favoriteGames.length} {favoriteGames.length > 1 ? 'titres sauvegardés' : 'titre sauvegardé'} sur cet appareil.
          </p>
        </div>

        {favoriteGames.length > 0 && (
          <button
            onClick={onClearFavorites}
            className="flex items-center gap-1.5 text-xs text-[#ff0055] hover:text-[#ff3377] bg-[#ff0055]/10 hover:bg-[#ff0055]/20 border border-[#ff0055]/30 px-3.5 py-1.5 rounded-xl font-bold transition-colors w-fit"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Vider les favoris
          </button>
        )}
      </div>

      {favoriteGames.length === 0 ? (
        <div className="bg-[#09101d] border border-[#1b2a44] rounded-3xl p-12 text-center max-w-md mx-auto space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#ff0055]/10 text-[#ff0055] mx-auto flex items-center justify-center">
            <Heart className="w-7 h-7" />
          </div>
          <h3 className="text-base font-extrabold text-white">Aucun favori pour le moment</h3>
          <p className="text-xs text-[#7990b5] leading-relaxed">
            Cliquez sur l'icône de cœur sur n'importe quel jeu du catalogue pour l'ajouter à vos favoris et y accéder rapidement.
          </p>
          <button
            onClick={onGoToBrowse}
            className="bg-[#ff0055] hover:bg-[#e6004c] text-white text-xs font-bold px-4 py-2 rounded-xl inline-flex items-center gap-1.5 transition-all shadow-md"
          >
            Explorer le catalogue
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
          {favoriteGames.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              viewMode="grid"
              onSelect={onSelectGame}
              isFavorite={true}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );
};
