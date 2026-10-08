import React, { useState, useEffect } from 'react';
import { Info, ChevronLeft, ChevronRight, Download, Sparkles } from 'lucide-react';
import { NormalizedGame } from '../types/catalog';

interface HeroFeaturedProps {
  games: NormalizedGame[];
  onSelectGame: (game: NormalizedGame) => void;
}

export const HeroFeatured: React.FC<HeroFeaturedProps> = ({ games, onSelectGame }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (games.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % games.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [games.length]);

  if (!games || games.length === 0) return null;

  const current = games[currentIndex] || games[0];
  const bgImage = current.banner || current.icon;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + games.length) % games.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % games.length);
  };

  const sourceLabel = current.catalogSourceName?.toLowerCase().includes('catalog_database')
    ? 'CATALOGUE OFFICIEL'
    : (current.catalogSourceName || 'PS5 STORE').toUpperCase();

  return (
    <div className="relative w-full h-[370px] sm:h-[400px] rounded-3xl overflow-hidden mb-8 border border-[#1b2a44] shadow-[0_25px_60px_rgba(0,0,0,0.85)] group select-none">
      {/* Background with subtle zoom */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-700 ease-out"
        style={{
          backgroundImage: `url('${bgImage}')`,
          filter: 'brightness(0.42) contrast(1.15)',
        }}
      />

      {/* Gradients */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#050811] via-[#050811]/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#050811] via-[#050811]/75 to-transparent" />

      {/* Slide Navigation Buttons */}
      <button
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-[#0a1120]/75 border border-[#1b2a44] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-[#ff0055] transition-all cursor-pointer backdrop-blur-md"
        aria-label="Jeu précédent"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-[#0a1120]/75 border border-[#1b2a44] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-[#ff0055] transition-all cursor-pointer backdrop-blur-md"
        aria-label="Jeu suivant"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Content matching Photo 2 */}
      <div className="relative z-10 h-full p-6 sm:p-10 flex flex-col justify-end max-w-3xl">
        <div className="flex items-center gap-2.5 text-xs font-semibold text-[#8ba2c4] mb-2.5">
          <span className="text-[#ff0055] uppercase tracking-wider font-extrabold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            À LA UNE · {sourceLabel}
          </span>
          <span aria-hidden="true" className="text-[#1b2a44] font-bold">/</span>
          <span className="text-white font-bold">{current.category}</span>
          <span aria-hidden="true" className="text-[#1b2a44] font-bold">/</span>
          <span className="text-[#00d9ff] font-mono">{current.size}</span>
          {current.metacritic && (
            <>
              <span aria-hidden="true" className="text-[#1b2a44] font-bold">/</span>
              <span className="text-[#00e676] font-bold">Metacritic {current.metacritic}</span>
            </>
          )}
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight mb-2.5 line-clamp-1 drop-shadow-md">
          {current.title}
        </h1>

        {/* Description */}
        <p className="text-xs sm:text-sm text-[#94a9c9] line-clamp-2 max-w-2xl mb-5 leading-relaxed">
          {current.description || `Retrouvez ${current.title} (${current.titleId}) avec tous les packages disponibles, correctifs et DLCs prêts au téléchargement.`}
        </p>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onSelectGame(current)}
            className="bg-[#ff0055] hover:bg-[#e6004c] text-white font-bold px-6 py-2.5 rounded-xl text-xs sm:text-sm shadow-[0_4px_20px_rgba(255,0,85,0.4)] flex items-center gap-2 transition-all transform hover:-translate-y-0.5 cursor-pointer"
          >
            <Info className="w-4 h-4" />
            Voir la fiche complète
          </button>

          {current.links && current.links.length > 0 && (
            <button
              onClick={() => onSelectGame(current)}
              className="bg-[#0e172a]/90 hover:bg-[#152342] text-white border border-[#1b2a44] font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#00d9ff]" />
              {current.links.length} {current.links.length > 1 ? 'fichiers disponibles' : 'fichier'}
            </button>
          )}
        </div>
      </div>

      {/* Dots Indicator */}
      <div className="absolute right-6 bottom-6 z-20 flex items-center gap-2">
        {games.slice(0, 8).map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`transition-all duration-300 rounded-full cursor-pointer ${
              idx === currentIndex
                ? 'w-7 h-2 bg-[#ff0055]'
                : 'w-2 h-2 bg-white/30 hover:bg-white/60'
            }`}
            aria-label={`Aller au slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
