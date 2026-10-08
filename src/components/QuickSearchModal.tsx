import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowUpRight, Sparkles } from 'lucide-react';
import { NormalizedGame } from '../types/catalog';

interface QuickSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  games: NormalizedGame[];
  onSelectGame: (game: NormalizedGame) => void;
}

export const QuickSearchModal: React.FC<QuickSearchModalProps> = ({
  isOpen,
  onClose,
  games,
  onSelectGame,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Trigger open via parent
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const results = query.trim()
    ? games.filter((g) => {
        const q = query.toLowerCase().trim();
        return (
          g.title.toLowerCase().includes(q) ||
          g.titleId.toLowerCase().includes(q) ||
          g.category.toLowerCase().includes(q) ||
          g.genres?.some((genre) => genre.toLowerCase().includes(q))
        );
      }).slice(0, 20)
    : [];

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 bg-[#04070d]/85 backdrop-blur-md flex items-start justify-center pt-20 p-4 animate-in fade-in duration-150"
    >
      <div className="w-full max-w-2xl bg-[#09101d] border border-[#1b2a44] rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-150">
        
        {/* Search Input Bar */}
        <div className="p-4 border-b border-[#1b2a44] flex items-center gap-3 bg-[#060a14]">
          <Search className="w-5 h-5 text-[#ff0055]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher par nom de jeu, CUSA, PPSA, genre..."
            className="flex-1 bg-transparent text-white placeholder-[#61799e] text-sm focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-[#7990b5] hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline bg-[#131f38] text-[10px] text-[#7990b5] px-2 py-1 rounded font-mono">
            ESC
          </kbd>
        </div>

        {/* Results Body */}
        <div className="p-3 overflow-y-auto divide-y divide-[#1b2a44]/50 flex-1">
          {query.trim() === '' ? (
            <div className="py-12 text-center text-[#7990b5] space-y-2">
              <Sparkles className="w-6 h-6 text-[#ff0055] mx-auto opacity-70" />
              <p className="text-xs">Tapez un titre ou un Title ID pour lancer la recherche instantanée.</p>
              <p className="text-[11px] text-[#546a8d]">Exemple: Ragnarok, PPSA08330, Cyberpunk, Homebrew...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="py-12 text-center text-[#7990b5] text-xs">
              Aucun résultat pour <span className="text-white font-bold">"{query}"</span>.
            </div>
          ) : (
            results.map((game, idx) => (
              <div
                key={`${game.id}-${idx}`}
                onClick={() => {
                  onSelectGame(game);
                  onClose();
                }}
                className="p-3 hover:bg-[#0e1930] rounded-xl flex items-center justify-between gap-4 cursor-pointer group transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-13 rounded-lg overflow-hidden bg-[#04070d] flex-shrink-0">
                    <img src={game.icon} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-white group-hover:text-[#ff0055] transition-colors truncate">
                      {game.title}
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] text-[#7990b5] mt-0.5">
                      <span className="font-mono text-[#00d9ff]">{game.titleId}</span>
                      <span aria-hidden="true">·</span>
                      <span>{game.category}</span>
                      <span aria-hidden="true">·</span>
                      <span>{game.size}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-[#8ba2c4]">{game.catalogSourceName}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-[#ff0055] font-bold group-hover:underline flex items-center gap-1">
                    Ouvrir
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};
