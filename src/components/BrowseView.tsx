import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  LayoutGrid, 
  IdCard, 
  List, 
  TableProperties, 
  X, 
  RotateCcw,
  Heart
} from 'lucide-react';
import { CatalogSourceConfig, NormalizedGame, ViewMode } from '../types/catalog';
import { GameCard } from './GameCard';

interface BrowseViewProps {
  games: NormalizedGame[];
  catalogConfigs: CatalogSourceConfig[];
  selectedCatalog: string; // 'all' or catalog ID
  setSelectedCatalog: (id: string) => void;
  onSelectGame: (game: NormalizedGame) => void;
  favorites: string[];
  onToggleFavorite: (e: React.MouseEvent, gameId: string) => void;
}

export const BrowseView: React.FC<BrowseViewProps> = ({
  games,
  catalogConfigs,
  selectedCatalog,
  setSelectedCatalog,
  onSelectGame,
  favorites,
  onToggleFavorite,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [sortBy, setSortBy] = useState<string>('date-desc');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Extract all unique genres
  const availableGenres = useMemo(() => {
    const set = new Set<string>();
    games.forEach(g => {
      if (Array.isArray(g.genres)) {
        g.genres.forEach(gen => {
          if (gen && gen.trim().length > 0 && gen !== 'N/A') {
            set.add(gen.trim());
          }
        });
      }
    });
    return Array.from(set).slice(0, 16);
  }, [games]);

  // Filtered & Sorted games
  const filteredGames = useMemo(() => {
    let result = games.filter(g => {
      // Favorites filter
      if (onlyFavorites && !favorites.includes(g.id)) {
        return false;
      }
      // Catalog match
      if (selectedCatalog !== 'all' && g.catalogSource !== selectedCatalog) {
        return false;
      }
      // Platform / Category match
      if (selectedCategory !== 'all' && g.category.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }
      // Genre match
      if (selectedGenre !== 'all' && !g.genres?.some(gen => gen.toLowerCase() === selectedGenre.toLowerCase())) {
        return false;
      }
      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const inTitle = g.title.toLowerCase().includes(query);
        const inId = g.titleId.toLowerCase().includes(query);
        const inDesc = g.description.toLowerCase().includes(query);
        const inGenre = g.genres?.some(ge => ge.toLowerCase().includes(query));
        if (!inTitle && !inId && !inDesc && !inGenre) {
          return false;
        }
      }
      return true;
    });

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'rating-desc') {
        const scoreA = (a.metacritic || 0) + (a.rating ? a.rating * 15 : 0);
        const scoreB = (b.metacritic || 0) + (b.rating ? b.rating * 15 : 0);
        return scoreB - scoreA;
      }
      if (sortBy === 'title-asc') {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === 'title-desc') {
        return b.title.localeCompare(a.title);
      }
      if (sortBy === 'size-desc') {
        return b.sizeBytes - a.sizeBytes;
      }
      if (sortBy === 'size-asc') {
        return a.sizeBytes - b.sizeBytes;
      }
      if (sortBy === 'date-desc') {
        if (!a.releaseDate) return 1;
        if (!b.releaseDate) return -1;
        return b.releaseDate.localeCompare(a.releaseDate);
      }
      return 0;
    });

    return result;
  }, [games, selectedCatalog, selectedCategory, selectedGenre, searchTerm, sortBy, onlyFavorites, favorites]);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCatalog('all');
    setSelectedGenre('all');
    setSelectedCategory('all');
    setOnlyFavorites(false);
    setSortBy('date-desc');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Search & Top Controls */}
      <div className="bg-[#080d1a] border border-[#1b2a44] rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          
          {/* Main Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#7990b5] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher par titre, Title ID (PPSA/CUSA), mot-clé..."
              className="w-full bg-[#050811] border border-[#1b2a44] rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-white placeholder-[#587094] focus:outline-none focus:border-[#ff0055] transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7990b5] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-56">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#7990b5] absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-[#050811] border border-[#1b2a44] rounded-xl pl-9 pr-8 py-2.5 text-xs font-semibold text-white focus:outline-none focus:border-[#ff0055] cursor-pointer appearance-none"
              >
                <option value="date-desc">Trier : Date de sortie</option>
                <option value="rating-desc">Trier : Note RAWG / Metacritic</option>
                <option value="title-asc">Trier : Titre (A à Z)</option>
                <option value="title-desc">Trier : Titre (Z à A)</option>
                <option value="size-desc">Trier : Taille (Décroissante)</option>
                <option value="size-asc">Trier : Taille (Croissante)</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-[#050811] border border-[#1b2a44] p-1 rounded-xl">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'grid' ? 'bg-[#ff0055] text-white' : 'text-[#7990b5] hover:text-white'
                }`}
                title="Vue Jaquettes Grille"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'cards' ? 'bg-[#ff0055] text-white' : 'text-[#7990b5] hover:text-white'
                }`}
                title="Vue Bannières Cartes"
              >
                <IdCard className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'list' ? 'bg-[#ff0055] text-white' : 'text-[#7990b5] hover:text-white'
                }`}
                title="Vue Liste"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'table' ? 'bg-[#ff0055] text-white' : 'text-[#7990b5] hover:text-white'
                }`}
                title="Vue Tableau Technique"
              >
                <TableProperties className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

        {/* Catalog Selector Pills & Favorites */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar pt-2 border-t border-[#1b2a44]/50">
          <span className="text-[11px] font-bold text-[#7990b5] uppercase tracking-wider mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3 text-[#ff0055]" />
            Source :
          </span>

          <button
            onClick={() => { setSelectedCatalog('all'); setOnlyFavorites(false); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              selectedCatalog === 'all' && !onlyFavorites
                ? 'bg-[#ff0055] text-white shadow-sm'
                : 'bg-[#050811] text-[#8ba2c4] hover:text-white border border-[#1b2a44]'
            }`}
          >
            Tous les catalogues ({games.length})
          </button>

          {/* Favorites quick toggle */}
          {favorites.length > 0 && (
            <button
              onClick={() => setOnlyFavorites(!onlyFavorites)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                onlyFavorites
                  ? 'bg-[#ff0055] text-white shadow-sm'
                  : 'bg-[#050811] text-[#8ba2c4] hover:text-white border border-[#1b2a44]'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-white' : 'text-[#ff0055]'}`} />
              Favoris ({favorites.length})
            </button>
          )}

          {catalogConfigs.map((cfg) => {
            const count = games.filter(g => g.catalogSource === cfg.id).length;
            if (count === 0) return null;
            return (
              <button
                key={cfg.id}
                onClick={() => { setSelectedCatalog(cfg.id); setOnlyFavorites(false); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedCatalog === cfg.id && !onlyFavorites
                    ? 'bg-[#ff0055] text-white shadow-sm'
                    : 'bg-[#050811] text-[#8ba2c4] hover:text-white border border-[#1b2a44]'
                }`}
              >
                {cfg.name} ({count})
              </button>
            );
          })}
        </div>

        {/* Genre & Platform Quick Filter Buttons */}
        {availableGenres.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            <span className="text-[11px] font-bold text-[#7990b5] uppercase tracking-wider mr-1">
              Genre :
            </span>
            <button
              onClick={() => setSelectedGenre('all')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap cursor-pointer ${
                selectedGenre === 'all'
                  ? 'bg-white/10 text-white border border-white/20'
                  : 'text-[#7990b5] hover:text-white'
              }`}
            >
              Tous
            </button>
            {availableGenres.map((genre) => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  selectedGenre === genre
                    ? 'bg-[#00d9ff]/20 text-[#00d9ff] border border-[#00d9ff]/40 font-bold'
                    : 'text-[#7990b5] hover:text-white'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Header Info & Reset */}
      <div className="flex items-center justify-between text-xs font-semibold text-[#7990b5] px-1">
        <div>
          Affichage de <b className="text-white font-bold">{filteredGames.length}</b> titres
          {selectedCatalog !== 'all' && ` dans ${catalogConfigs.find(c => c.id === selectedCatalog)?.name || selectedCatalog}`}
          {onlyFavorites && ` (Favoris)`}
        </div>
        {(searchTerm || selectedCatalog !== 'all' || selectedGenre !== 'all' || selectedCategory !== 'all' || onlyFavorites) && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1.5 text-[#ff0055] hover:text-[#ff3377] transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Réinitialiser les filtres
          </button>
        )}
      </div>

      {/* Empty State */}
      {filteredGames.length === 0 ? (
        <div className="bg-[#080d1a] border border-[#1b2a44] rounded-3xl p-12 text-center space-y-4 max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-[#ff0055]/10 text-[#ff0055] mx-auto flex items-center justify-center">
            <Search className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-extrabold text-white">Aucun résultat trouvé</h3>
          <p className="text-xs text-[#7990b5] leading-relaxed">
            Aucun jeu ne correspond à vos critères de recherche actuels. Essayez de réinitialiser vos filtres ou de changer de catalogue.
          </p>
          <button
            onClick={resetFilters}
            className="bg-[#ff0055] hover:bg-[#e6004c] text-white font-bold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer"
          >
            Réinitialiser la recherche
          </button>
        </div>
      ) : (
        /* Content Display based on ViewMode */
        viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-3.5 sm:gap-4">
            {filteredGames.map((game, idx) => (
              <GameCard
                key={`${game.id}-${idx}`}
                game={game}
                viewMode="grid"
                onSelect={onSelectGame}
                isFavorite={favorites.includes(game.id)}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>
        ) : viewMode === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredGames.map((game, idx) => (
              <GameCard
                key={`${game.id}-${idx}`}
                game={game}
                viewMode="cards"
                onSelect={onSelectGame}
                isFavorite={favorites.includes(game.id)}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>
        ) : viewMode === 'list' ? (
          <div className="space-y-2">
            {filteredGames.map((game, idx) => (
              <GameCard
                key={`${game.id}-${idx}`}
                game={game}
                viewMode="list"
                onSelect={onSelectGame}
                isFavorite={favorites.includes(game.id)}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>
        ) : (
          /* Table View */
          <div className="overflow-x-auto rounded-2xl border border-[#1b2a44] bg-[#09101d]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#050811] text-[#7990b5] border-b border-[#1b2a44] font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Titre</th>
                  <th className="py-3.5 px-4">Title ID</th>
                  <th className="py-3.5 px-4">Version</th>
                  <th className="py-3.5 px-4">Taille</th>
                  <th className="py-3.5 px-4">Note</th>
                  <th className="py-3.5 px-4">Catalogue</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1b2a44]/50 text-white">
                {filteredGames.map((game, idx) => (
                  <tr
                    key={`${game.id}-${idx}`}
                    onClick={() => onSelectGame(game)}
                    className="hover:bg-[#0e1930] transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-4 font-bold flex items-center gap-2.5">
                      <div className="w-7 h-9 rounded bg-[#04070d] overflow-hidden flex-shrink-0">
                        <img src={game.icon} alt="" className="w-full h-full object-cover" />
                      </div>
                      <span className="group-hover:text-[#ff0055] transition-colors">
                        {game.title}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[#00d9ff]">{game.titleId}</td>
                    <td className="py-3 px-4 text-[#8ba2c4]">{game.version}</td>
                    <td className="py-3 px-4 font-mono">{game.size}</td>
                    <td className="py-3 px-4">
                      {game.metacritic ? (
                        <span className="text-[#00e676] font-bold">{game.metacritic}</span>
                      ) : game.rating ? (
                        <span className="text-[#ffb703] font-bold">{game.rating.toFixed(1)}/5</span>
                      ) : (
                        <span className="text-[#556988]">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-[#8ba2c4]">{game.catalogSourceName}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => { e.stopPropagation(); onSelectGame(game); }}
                        className="bg-[#ff0055] hover:bg-[#e6004c] text-white px-3 py-1.5 rounded-lg font-bold text-[11px] transition-colors cursor-pointer"
                      >
                        Voir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
};
