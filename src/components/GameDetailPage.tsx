import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Download, 
  Copy, 
  Check, 
  ExternalLink, 
  Star, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  Youtube, 
  Heart,
  Sparkles,
  Layers,
  Globe,
  MessageSquare,
  Building,
  Gamepad
} from 'lucide-react';
import { DownloadLink, NormalizedGame } from '../types/catalog';

interface GameDetailPageProps {
  game: NormalizedGame;
  onBack: () => void;
  isFavorite: boolean;
  onToggleFavorite: (e: React.MouseEvent, gameId: string) => void;
}

export const GameDetailPage: React.FC<GameDetailPageProps> = ({
  game,
  onBack,
  isFavorite,
  onToggleFavorite,
}) => {
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [batchCopied, setBatchCopied] = useState(false);
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);

  const fallbackCover = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=400&auto=format&fit=crop';
  const backdropImage = game.banner || game.icon;

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

  // External Links URLs
  const ytSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(game.title + ' PS5 4K gameplay trailer')}`;
  const psStoreUrl = `https://store.playstation.com/en-us/search/${encodeURIComponent(game.title)}`;
  const prosperoPatchesUrl = `https://prosperopatches.com/search?q=${encodeURIComponent(game.titleId !== 'N/A' ? game.titleId : game.title)}&p=1`;

  return (
    <div className="relative min-h-screen pb-20 animate-in fade-in duration-200">
      {/* Dynamic Blurred Backdrop Glow */}
      <div
        className="absolute top-0 left-0 right-0 h-[480px] bg-cover bg-center filter blur-3xl opacity-20 pointer-events-none -z-10"
        style={{ backgroundImage: `url('${backdropImage}')` }}
      />
      <div className="absolute top-0 left-0 right-0 h-[480px] bg-gradient-to-b from-transparent via-[#050811]/70 to-[#050811] pointer-events-none -z-10" />

      {/* Top Bar with Back Button and Quick Actions */}
      <div className="flex items-center justify-between mb-8 pt-2">
        <button
          onClick={onBack}
          className="flex items-center gap-2 bg-[#0a1120]/80 hover:bg-[#121c33] border border-[#1b2a44] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au catalogue
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={(e) => onToggleFavorite(e, game.id)}
            className={`flex items-center gap-2 border px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isFavorite
                ? 'bg-[#ff0055] text-white border-[#ff0055]'
                : 'bg-[#0a1120]/80 text-[#8ba2c4] hover:text-white border-[#1b2a44]'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-white' : ''}`} />
            {isFavorite ? 'Dans vos favoris' : 'Ajouter aux favoris'}
          </button>
        </div>
      </div>

      {/* Main Game Hero Header */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10 items-start">
        {/* Poster Jaquette */}
        <div className="lg:col-span-3">
          <div className="aspect-[1/1.25] w-full max-w-[280px] mx-auto lg:max-w-none rounded-2xl overflow-hidden border border-[#1b2a44] shadow-[0_20px_50px_rgba(0,0,0,0.85)] bg-[#04070d] relative group">
            <img
              src={game.icon}
              alt={game.title}
              onError={(e) => { (e.target as HTMLImageElement).src = fallbackCover; }}
              className="w-full h-full object-cover"
            />
            {game.metacritic && (
              <div className="absolute top-3 left-3 bg-[#0a1426]/90 border border-[#00e676]/50 text-[#00e676] text-xs font-black px-2.5 py-1 rounded-lg shadow-lg backdrop-blur-md">
                Metacritic {game.metacritic}
              </div>
            )}
            {game.esrb && (
              <div className="absolute bottom-3 left-3 bg-[#0a1426]/90 border border-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-md">
                {game.esrb}
              </div>
            )}
          </div>
        </div>

        {/* Center Game Meta & Title */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#8ba2c4]">
            <span className="text-[#ff0055] font-extrabold uppercase tracking-wide">
              {game.catalogSourceName}
            </span>
            <span aria-hidden="true">·</span>
            <span className="text-white font-bold">{game.category}</span>
            <span aria-hidden="true">·</span>
            <span className="text-[#00d9ff] font-mono">{game.size}</span>
            {game.releaseDate && (
              <>
                <span aria-hidden="true">·</span>
                <span>{new Date(game.releaseDate).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            {game.title}
          </h1>

          {/* Developers & Publishers info */}
          {(game.developers || game.publishers) && (
            <div className="text-xs text-[#8ca0c0] flex flex-wrap gap-4 pt-0.5">
              {game.developers && (
                <div className="flex items-center gap-1.5">
                  <Gamepad className="w-3.5 h-3.5 text-[#ff0055]" />
                  <span>Développeur : <b className="text-white">{game.developers.join(', ')}</b></span>
                </div>
              )}
              {game.publishers && (
                <div className="flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-[#00d9ff]" />
                  <span>Éditeur : <b className="text-white">{game.publishers.join(', ')}</b></span>
                </div>
              )}
            </div>
          )}

          {/* Genres & Tags */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {game.genres && game.genres.map((g) => (
              <span
                key={g}
                className="bg-[#0e172a] border border-[#1b2a44] text-[#8ba2c4] text-xs px-2.5 py-1 rounded-lg font-medium"
              >
                {g}
              </span>
            ))}
            {game.tags && game.tags.map((t) => (
              <span
                key={t}
                className="bg-[#050811] border border-[#1b2a44]/60 text-[#677e9e] text-[11px] px-2 py-0.5 rounded-lg"
              >
                #{t}
              </span>
            ))}
          </div>

          {/* External Action Links (YouTube, PS Store, Prospero, Website, Reddit) */}
          <div className="flex flex-wrap items-center gap-2 pt-4">
            <a
              href={ytSearchUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-[#0a1120] hover:bg-[#ff0000]/20 hover:text-[#ff4d4d] border border-[#1b2a44] hover:border-[#ff0000]/50 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              <Youtube className="w-4 h-4 text-[#ff0000]" />
              Trailers YouTube
              <ExternalLink className="w-3 h-3 text-[#7990b5]" />
            </a>

            <a
              href={psStoreUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-[#0a1120] hover:bg-[#0070d1]/20 hover:text-[#00d9ff] border border-[#1b2a44] hover:border-[#0070d1]/50 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              <ExternalLink className="w-4 h-4 text-[#0070d1]" />
              PlayStation Store
            </a>

            <a
              href={prosperoPatchesUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-[#0a1120] hover:bg-[#00d9ff]/20 hover:text-[#00d9ff] border border-[#1b2a44] hover:border-[#00d9ff]/50 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              <ShieldCheck className="w-4 h-4 text-[#00d9ff]" />
              Prospero Patches
            </a>

            {game.website && (
              <a
                href={game.website}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-[#0a1120] hover:bg-[#121c33] border border-[#1b2a44] text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm"
              >
                <Globe className="w-4 h-4 text-[#00e676]" />
                Site Officiel
              </a>
            )}

            {game.redditUrl && (
              <a
                href={game.redditUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-[#0a1120] hover:bg-[#ff4500]/20 hover:text-[#ff4500] border border-[#1b2a44] text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm"
              >
                <MessageSquare className="w-4 h-4 text-[#ff4500]" />
                Reddit
              </a>
            )}
          </div>
        </div>

        {/* Right Specs Card */}
        <div className="lg:col-span-3 bg-[#09101d] border border-[#1b2a44] rounded-2xl p-5 space-y-3.5 shadow-lg">
          <div className="text-xs font-extrabold text-[#7990b5] uppercase tracking-wider border-b border-[#1b2a44] pb-2">
            Spécifications techniques
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-[#7990b5]">Title ID</span>
            <span
              onClick={() => handleCopySingle(game.titleId)}
              className="font-mono font-bold text-[#00d9ff] hover:text-[#ff0055] cursor-pointer flex items-center gap-1"
              title="Cliquer pour copier"
            >
              {game.titleId}
              <Copy className="w-3 h-3 text-[#50688a]" />
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-[#7990b5]">Version</span>
            <span className="font-bold text-white">{game.version}</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-[#7990b5]">Taille totale</span>
            <span className="font-mono font-bold text-white">{game.size}</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-[#7990b5]">Plateforme</span>
            <span className="font-bold text-[#ff0055]">{game.category}</span>
          </div>

          {game.playtime && game.playtime > 0 && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#7990b5]">Durée de jeu</span>
              <span className="font-bold text-white flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#00d9ff]" />
                ~{game.playtime} heures
              </span>
            </div>
          )}

          {game.rating && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#7990b5]">Note RAWG.io</span>
              <span className="font-bold text-[#ffb703] flex items-center gap-1">
                <Star className="w-3 h-3 fill-current" />
                {game.rating.toFixed(2)} / 5
              </span>
            </div>
          )}

          {game.metacritic && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#7990b5]">Score Metacritic</span>
              {game.metacriticUrl ? (
                <a
                  href={game.metacriticUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-[#00e676] hover:underline flex items-center gap-1"
                >
                  {game.metacritic} / 100
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              ) : (
                <span className="font-bold text-[#00e676]">{game.metacritic} / 100</span>
              )}
            </div>
          )}

          {game.rawgId && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#7990b5]">ID RAWG</span>
              <span className="font-mono text-[#7990b5]">#{game.rawgId}</span>
            </div>
          )}
        </div>
      </div>

      {/* Description Panel */}
      {game.description && (
        <div className="bg-[#09101d] border border-[#1b2a44] rounded-2xl p-6 mb-8 shadow-md">
          <h2 className="text-sm font-extrabold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#ff0055]" />
            Description & Synopsis
          </h2>
          <p className="text-xs sm:text-sm text-[#9cb1cf] leading-relaxed whitespace-pre-line">
            {game.description}
          </p>
        </div>
      )}

      {/* RAWG Screenshots Gallery if available */}
      {game.screenshots && game.screenshots.length > 0 && (
        <div className="bg-[#09101d] border border-[#1b2a44] rounded-2xl p-6 mb-8 shadow-md space-y-4">
          <h2 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#00d9ff]" />
            Captures d'écran in-game officielles (RAWG.io)
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {game.screenshots.map((s, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedScreenshot(s)}
                className="aspect-video rounded-xl overflow-hidden bg-[#050811] border border-[#1b2a44] cursor-pointer hover:border-[#ff0055] hover:scale-102 transition-all shadow-sm"
              >
                <img src={s} alt="" className="w-full h-full object-cover" loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Download Section with Batch JDownloader Copy */}
      <div className="bg-[#09101d] border border-[#1b2a44] rounded-2xl p-6 shadow-md space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1b2a44] pb-4">
          <div>
            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
              <Download className="w-5 h-5 text-[#ff0055]" />
              Fichiers & Liens de téléchargement
            </h2>
            <p className="text-xs text-[#7990b5] mt-0.5">
              {game.links.length} {game.links.length > 1 ? 'liens disponibles pour ce titre' : 'lien disponible'}
            </p>
          </div>

          {game.links.length > 0 && (
            <button
              onClick={handleCopyAll}
              className="bg-[#00e676]/15 hover:bg-[#00e676]/25 border border-[#00e676]/40 text-[#00e676] px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              {batchCopied ? (
                <>
                  <Check className="w-4 h-4" />
                  Tous les liens copiés !
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copier tout pour JDownloader
                </>
              )}
            </button>
          )}
        </div>

        {game.links.length === 0 ? (
          <div className="text-center py-10 text-xs text-[#7990b5]">
            Aucun lien de téléchargement direct spécifié pour ce titre dans ce catalogue.
          </div>
        ) : (
          <div className="space-y-3">
            {game.links.map((link, idx) => {
              const isCopied = copiedUrl === link.url;
              return (
                <div
                  key={idx}
                  className="bg-[#050811] border border-[#1b2a44] hover:border-[#ff0055]/50 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md flex-shrink-0 ${
                        link.type === 'Update'
                          ? 'bg-[#00d9ff]/20 text-[#00d9ff] border border-[#00d9ff]/40'
                          : link.type === 'DLC'
                          ? 'bg-[#ff0055]/20 text-[#ff0055] border border-[#ff0055]/40'
                          : link.type === 'Backport'
                          ? 'bg-[#00e676]/20 text-[#00e676] border border-[#00e676]/40'
                          : 'bg-[#0070d1]/20 text-[#00d9ff] border border-[#0070d1]/40'
                      }`}
                    >
                      {link.type}
                    </span>

                    <span className="text-xs font-bold text-white truncate" title={link.name}>
                      {link.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      onClick={() => handleCopySingle(link.url)}
                      className="bg-[#0a1120] hover:bg-[#121c33] border border-[#1b2a44] text-[#8ca0c0] hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                      title="Copier le lien"
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
                      className="bg-[#ff0055] hover:bg-[#e6004c] text-white px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Télécharger
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Screenshot Lightbox Modal if clicked */}
      {selectedScreenshot && (
        <div
          onClick={() => setSelectedScreenshot(null)}
          className="fixed inset-0 z-50 bg-black/92 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-5xl max-h-[90vh]">
            <img
              src={selectedScreenshot}
              alt="Capture d'écran plein écran"
              className="rounded-2xl border border-[#1b2a44] object-contain max-h-[85vh] w-auto shadow-2xl"
            />
            <button
              onClick={() => setSelectedScreenshot(null)}
              className="absolute top-4 right-4 bg-[#0a1120] text-white border border-[#1b2a44] px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
