import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Copy, 
  Check, 
  ExternalLink, 
  Star, 
  ShieldCheck, 
  Youtube, 
  Heart,
  Globe,
  Clock,
  Gamepad,
  Building
} from 'lucide-react';
import { NormalizedGame } from '../types/catalog';

interface GameDetailModalProps {
  game: NormalizedGame | null;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (e: React.MouseEvent, gameId: string) => void;
}

export const GameDetailModal: React.FC<GameDetailModalProps> = ({
  game,
  onClose,
  isFavorite,
  onToggleFavorite,
}) => {
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [batchCopied, setBatchCopied] = useState(false);

  if (!game) return null;

  const fallbackCover = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=400&auto=format&fit=crop';
  const ytSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(game.title + ' PS5 4K gameplay trailer')}`;
  const psStoreUrl = `https://store.playstation.com/en-us/search/${encodeURIComponent(game.title)}`;
  const prosperoPatchesUrl = `https://prosperopatches.com/search?q=${encodeURIComponent(game.titleId !== 'N/A' ? game.titleId : game.title)}&p=1`;

  const handleCopySingle = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const handleCopyAll = () => {
    if (!game.links || game.links.length === 0) return;
    const allUrls = game.links.map(l => l.url).join('\n');
    navigator.clipboard.writeText(allUrls);
    setBatchCopied(true);
    setTimeout(() => setBatchCopied(false), 2500);
  };

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 bg-[#04070d]/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-[#0a1120] border border-[#1b2a44] rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.95)] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-[#050811]/80 hover:bg-[#ff0055] border border-[#1b2a44] text-white flex items-center justify-center transition-colors cursor-pointer"
          title="Fermer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-[#0d162a] to-[#0a1120] border-b border-[#1b2a44] flex items-start gap-4">
          <div className="w-20 h-24 rounded-xl overflow-hidden bg-[#04070d] border border-[#1b2a44] flex-shrink-0">
            <img
              src={game.icon}
              alt=""
              onError={(e) => { (e.target as HTMLImageElement).src = fallbackCover; }}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="min-w-0 flex-1 pr-6">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#8ba2c4] mb-1">
              <span className="text-[#ff0055] font-extrabold uppercase">{game.catalogSourceName}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-[#00d9ff]">{game.titleId}</span>
              <span aria-hidden="true">·</span>
              <span>{game.size}</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white truncate mb-2">
              {game.title}
            </h2>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={(e) => onToggleFavorite(e, game.id)}
                className={`text-xs font-bold px-3 py-1 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isFavorite ? 'bg-[#ff0055] text-white' : 'bg-[#050811] text-[#8ba2c4] border border-[#1b2a44] hover:text-white'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-white' : ''}`} />
                {isFavorite ? 'Favori' : 'Ajouter'}
              </button>

              <a
                href={ytSearchUrl}
                target="_blank"
                rel="noreferrer"
                className="bg-[#050811] text-[#8ba2c4] hover:text-[#ff0000] border border-[#1b2a44] text-xs font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors"
              >
                <Youtube className="w-3.5 h-3.5 text-[#ff0000]" />
                Trailer
              </a>

              <a
                href={prosperoPatchesUrl}
                target="_blank"
                rel="noreferrer"
                className="bg-[#050811] text-[#8ba2c4] hover:text-[#00d9ff] border border-[#1b2a44] text-xs font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#00d9ff]" />
                Prospero
              </a>

              {game.website && (
                <a
                  href={game.website}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-[#050811] text-[#8ba2c4] hover:text-[#00e676] border border-[#1b2a44] text-xs font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors"
                >
                  <Globe className="w-3.5 h-3.5 text-[#00e676]" />
                  Site
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Technical Specs quick bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#050811] border border-[#1b2a44] rounded-xl p-3 text-xs">
            <div>
              <span className="text-[#647b9d] block text-[10px] uppercase font-bold">Version</span>
              <span className="font-bold text-white">{game.version}</span>
            </div>
            <div>
              <span className="text-[#647b9d] block text-[10px] uppercase font-bold">Plateforme</span>
              <span className="font-bold text-[#ff0055]">{game.category}</span>
            </div>
            {game.metacritic && (
              <div>
                <span className="text-[#647b9d] block text-[10px] uppercase font-bold">Metacritic</span>
                <span className="font-bold text-[#00e676]">{game.metacritic} / 100</span>
              </div>
            )}
            {game.playtime && (
              <div>
                <span className="text-[#647b9d] block text-[10px] uppercase font-bold">Durée de jeu</span>
                <span className="font-bold text-white">~{game.playtime}h</span>
              </div>
            )}
          </div>

          {/* Description */}
          {game.description && (
            <div className="bg-[#050811] border border-[#1b2a44] rounded-xl p-4">
              <h4 className="text-xs font-extrabold text-[#7990b5] uppercase tracking-wider mb-1.5">
                Description
              </h4>
              <p className="text-xs text-[#9cb1cf] leading-relaxed whitespace-pre-line">
                {game.description}
              </p>
            </div>
          )}

          {/* Download Links Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                <Download className="w-4 h-4 text-[#ff0055]" />
                Liens de téléchargement ({game.links.length})
              </h3>
              {game.links.length > 0 && (
                <button
                  onClick={handleCopyAll}
                  className="bg-[#00e676]/15 hover:bg-[#00e676]/25 border border-[#00e676]/40 text-[#00e676] px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  {batchCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {batchCopied ? 'Copié !' : 'Copier tout'}
                </button>
              )}
            </div>

            {game.links.length === 0 ? (
              <div className="text-xs text-[#7990b5] py-4 text-center">
                Aucun lien de téléchargement direct disponible.
              </div>
            ) : (
              <div className="space-y-2">
                {game.links.map((link, idx) => {
                  const isCopied = copiedUrl === link.url;
                  return (
                    <div
                      key={idx}
                      className="bg-[#050811] border border-[#1b2a44] rounded-xl p-3 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="font-extrabold text-[10px] text-[#00d9ff] uppercase">
                          [{link.type}]
                        </span>
                        <span className="font-medium text-white truncate" title={link.name}>
                          {link.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleCopySingle(link.url)}
                          className="p-1.5 text-[#7990b5] hover:text-white rounded-lg bg-[#0a1120] border border-[#1b2a44] cursor-pointer"
                          title="Copier le lien"
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5 text-[#00e676]" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-[#ff0055] hover:bg-[#e6004c] text-white px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 transition-colors"
                        >
                          <Download className="w-3 h-3" />
                          Télécharger
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
