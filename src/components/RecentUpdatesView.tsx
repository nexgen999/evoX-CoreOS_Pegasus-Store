import React, { useState } from 'react';
import { History, Download, Copy, Check, Sparkles, Filter, ExternalLink } from 'lucide-react';
import { NormalizedGame } from '../types/catalog';

interface RecentUpdatesViewProps {
  games: NormalizedGame[];
  onSelectGame: (game: NormalizedGame) => void;
}

export const RecentUpdatesView: React.FC<RecentUpdatesViewProps> = ({ games, onSelectGame }) => {
  const [filterType, setFilterType] = useState<'all' | 'Update' | 'DLC' | 'Backport'>('all');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // Extract all individual update/DLC links paired with game metadata
  const updateEntries = games.flatMap((game) => {
    return game.links
      .filter((l) => l.type === 'Update' || l.type === 'DLC' || l.type === 'Backport')
      .map((link) => ({
        game,
        link,
      }));
  });

  const filtered = updateEntries.filter((item) => {
    if (filterType === 'all') return true;
    return item.link.type === filterType;
  });

  const handleCopy = (e: React.MouseEvent, url: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#0d172e] to-[#070b14] border border-[#1b2a44] rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-[#ff0055]/15 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-bold text-[#ff0055] uppercase tracking-wider mb-2">
            <History className="w-4 h-4" />
            Flux des Correctifs & Contenus Additionnels
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
            Mises à jour récentes & DLCs
          </h1>
          <p className="text-xs sm:text-sm text-[#8ba2c4] leading-relaxed">
            Consultez les derniers patchs de compatibilité, backports récents et extensions DLC répertoriés dans vos catalogues connectés.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[#1b2a44] pb-3">
        <span className="text-xs font-bold text-[#7990b5] uppercase tracking-wider mr-2 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" />
          Filtrer par type :
        </span>
        <button
          onClick={() => setFilterType('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            filterType === 'all'
              ? 'bg-[#ff0055] text-white shadow-sm'
              : 'bg-[#09101d] text-[#8ba2c4] hover:text-white border border-[#1b2a44]'
          }`}
        >
          Tous les paquets ({updateEntries.length})
        </button>
        <button
          onClick={() => setFilterType('Update')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            filterType === 'Update'
              ? 'bg-[#00d9ff] text-black shadow-sm font-black'
              : 'bg-[#09101d] text-[#8ba2c4] hover:text-white border border-[#1b2a44]'
          }`}
        >
          Mises à jour / Patchs ({updateEntries.filter(i => i.link.type === 'Update').length})
        </button>
        <button
          onClick={() => setFilterType('DLC')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            filterType === 'DLC'
              ? 'bg-[#ff0055] text-white shadow-sm'
              : 'bg-[#09101d] text-[#8ba2c4] hover:text-white border border-[#1b2a44]'
          }`}
        >
          DLCs & Extensions ({updateEntries.filter(i => i.link.type === 'DLC').length})
        </button>
        <button
          onClick={() => setFilterType('Backport')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            filterType === 'Backport'
              ? 'bg-[#00e676] text-black shadow-sm font-black'
              : 'bg-[#09101d] text-[#8ba2c4] hover:text-white border border-[#1b2a44]'
          }`}
        >
          Backports ({updateEntries.filter(i => i.link.type === 'Backport').length})
        </button>
      </div>

      {/* Updates List */}
      {filtered.length === 0 ? (
        <div className="bg-[#09101d] border border-[#1b2a44] rounded-2xl p-10 text-center text-[#7990b5] text-xs">
          Aucun paquet correspondant dans vos catalogues.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(({ game, link }, idx) => {
            const isCopied = copiedUrl === link.url;
            return (
              <div
                key={`${game.id}-${link.url}-${idx}`}
                onClick={() => onSelectGame(game)}
                className="group bg-[#09101d] hover:bg-[#0d162b] border border-[#1b2a44] hover:border-[#ff0055] rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all duration-200 cursor-pointer shadow-md"
              >
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="w-12 h-15 rounded-xl bg-[#04070d] overflow-hidden flex-shrink-0">
                    <img src={game.icon} alt="" className="w-full h-full object-cover" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                          link.type === 'Update'
                            ? 'bg-[#00d9ff]/20 text-[#00d9ff] border border-[#00d9ff]/40'
                            : link.type === 'DLC'
                            ? 'bg-[#ff0055]/20 text-[#ff0055] border border-[#ff0055]/40'
                            : 'bg-[#00e676]/20 text-[#00e676] border border-[#00e676]/40'
                        }`}
                      >
                        {link.type}
                      </span>
                      <h3 className="font-bold text-white text-sm group-hover:text-[#ff0055] transition-colors truncate">
                        {game.title}
                      </h3>
                    </div>

                    <div className="text-xs text-[#8ca0c0] font-medium mt-1 truncate">
                      {link.name}
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-[#617799] mt-1 font-mono">
                      <span>{game.titleId}</span>
                      <span aria-hidden="true">·</span>
                      <span>{game.catalogSourceName}</span>
                      {link.size && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-[#00d9ff]">{link.size}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-[#1b2a44]/60">
                  <button
                    onClick={(e) => handleCopy(e, link.url)}
                    className="bg-[#050811] hover:bg-[#121c33] border border-[#1b2a44] text-[#8ca0c0] hover:text-white px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
                    title="Copier l'URL directe du fichier"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#00e676]" />
                        <span className="text-[#00e676]">Copié</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copier</span>
                      </>
                    )}
                  </button>

                  <a
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="bg-[#ff0055] hover:bg-[#e6004c] text-white px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-[0_2px_10px_rgba(255,0,85,0.3)]"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Télécharger</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
