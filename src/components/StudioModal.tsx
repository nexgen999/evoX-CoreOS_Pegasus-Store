import React, { useState } from 'react';
import { 
  Key, 
  Check, 
  AlertCircle, 
  Sparkles, 
  Play, 
  Square, 
  Download, 
  Upload, 
  FileJson, 
  Code, 
  Copy, 
  Plus, 
  Trash2, 
  ExternalLink,
  Layers,
  Database,
  Terminal,
  Globe
} from 'lucide-react';
import { CatalogSourceConfig, NormalizedGame } from '../types/catalog';
import { testRawgApiKey, enrichGamesBatch, saveEnrichedDatabaseLocally } from '../services/rawg';
import { parseRawCatalog, normalizeItem } from '../utils/normalizer';
import { downloadJsonFile } from '../services/sync';

interface StudioModalProps {
  games: NormalizedGame[];
  setGames: React.Dispatch<React.SetStateAction<NormalizedGame[]>>;
  catalogConfigs: CatalogSourceConfig[];
  setCatalogConfigs: React.Dispatch<React.SetStateAction<CatalogSourceConfig[]>>;
  rawgToken: string;
  setRawgToken: (token: string) => void;
}

export const StudioModal: React.FC<StudioModalProps> = ({
  games,
  setGames,
  catalogConfigs,
  setCatalogConfigs,
  rawgToken,
  setRawgToken,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'rawg' | 'convert' | 'sources' | 'workflow'>('rawg');

  // RAWG state
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [testing, setTesting] = useState(false);
  const [enriching, setEnriching] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, title: '' });
  const [stopRequested, setStopRequested] = useState(false);

  // Converter state
  const [rawJsonText, setRawJsonText] = useState('');
  const [remoteUrl, setRemoteUrl] = useState('');
  const [customCatalogName, setCustomCatalogName] = useState('Mon Catalogue');
  const [convertedPreview, setConvertedPreview] = useState<NormalizedGame[] | null>(null);
  const [convertStatus, setConvertStatus] = useState<string | null>(null);

  // New source state
  const [newSourceName, setNewSourceName] = useState('');
  const [newSourceUrl, setNewSourceUrl] = useState('');

  // Workflow copy status
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedWorkflow, setCopiedWorkflow] = useState(false);

  const handleTestKey = async () => {
    setTesting(true);
    setTestResult(null);
    const res = await testRawgApiKey(rawgToken);
    setTestResult(res);
    setTesting(false);
  };

  const handleStartEnrichment = async () => {
    if (!rawgToken) {
      setTestResult({ success: false, message: 'Veuillez saisir votre clé API RAWG.io ci-dessus.' });
      return;
    }

    setEnriching(true);
    setStopRequested(false);
    setProgress({ current: 0, total: games.length, title: 'Démarrage...' });

    try {
      const updatedGames = await enrichGamesBatch(
        games,
        rawgToken,
        (current, total, title) => {
          setProgress({ current, total, title });
        },
        () => stopRequested
      );

      saveEnrichedDatabaseLocally(updatedGames);
      setGames(updatedGames);
      setTestResult({ 
        success: true, 
        message: `✓ Enrichissement terminé et sauvegardé localement ! ${updatedGames.length} titres mis à jour. Vous ne perdrez plus ces données au rechargement.` 
      });
    } catch (e: any) {
      setTestResult({ success: false, message: `Erreur durant l'enrichissement: ${e.message}` });
    } finally {
      setEnriching(false);
    }
  };

  const handleConvertRawJson = (rawContent: string, catalogName: string) => {
    try {
      const parsed = JSON.parse(rawContent);
      const catId = catalogName.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'custom';
      const normalized = parseRawCatalog(parsed, catId, catalogName);
      setConvertedPreview(normalized);
      setConvertStatus(`Succès : ${normalized.length} titres normalisés détectés.`);
    } catch (err: any) {
      setConvertStatus(`Erreur de syntaxe JSON : ${err.message}`);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      setRawJsonText(content);
      handleConvertRawJson(content, file.name.replace(/\.[^/.]+$/, ''));
    };
    reader.readAsText(file);
  };

  const handleFetchRemoteUrl = async () => {
    if (!remoteUrl.trim()) return;
    setConvertStatus('Téléchargement en cours...');
    try {
      const res = await fetch(remoteUrl.trim());
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const contentStr = JSON.stringify(data, null, 2);
      setRawJsonText(contentStr);
      handleConvertRawJson(contentStr, customCatalogName);
    } catch (err: any) {
      setConvertStatus(`Erreur de téléchargement : ${err.message}. Vérifiez le lien ou le CORS.`);
    }
  };

  const handleMergeToCurrentStore = () => {
    if (!convertedPreview || convertedPreview.length === 0) return;
    setGames((prev) => {
      const existingIds = new Set(prev.map(g => g.id));
      const toAdd = convertedPreview.filter(g => !existingIds.has(g.id));
      return [...toAdd, ...prev];
    });
    setConvertStatus(`✓ ${convertedPreview.length} titres fusionnés dans votre store !`);
  };

  const handleExportNormalizedJson = () => {
    const dataToExport = convertedPreview && convertedPreview.length > 0 ? convertedPreview : games;
    downloadJsonFile(dataToExport, 'catalog_database.json');
  };

  const handleAddNewCatalogSource = () => {
    if (!newSourceName.trim() || !newSourceUrl.trim()) return;
    const newConfig: CatalogSourceConfig = {
      id: 'custom-' + Date.now(),
      name: newSourceName.trim(),
      iconName: 'Globe',
      urls: [newSourceUrl.trim()],
      enabled: true,
      isCustom: true,
      isGameCatalog: true,
    };
    setCatalogConfigs((prev) => [...prev, newConfig]);
    setNewSourceName('');
    setNewSourceUrl('');
  };

  const handleRemoveSource = (id: string) => {
    setCatalogConfigs((prev) => prev.filter(c => c.id !== id));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#0d172e] to-[#070b14] border border-[#1b2a44] rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-bold text-[#ff0055] uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4" />
            Studio de Métadonnées & Architecture
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
            Convertisseur de Catalogues & Enrichissement RAWG.io
          </h1>
          <p className="text-xs sm:text-sm text-[#8ba2c4] leading-relaxed">
            Centralisez vos fichiers JSON multiples en une base de données normalisée, enrichissez automatiquement les jaquettes et notes avec votre token RAWG, et automatisez le déploiement GitHub Pages.
          </p>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-[#1b2a44] pb-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveSubTab('rawg')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'rawg'
              ? 'bg-[#ff0055] text-white shadow-sm'
              : 'bg-[#09101d] text-[#8ba2c4] hover:text-white border border-[#1b2a44]'
          }`}
        >
          <Key className="w-4 h-4" />
          Enrichissement RAWG.io
        </button>

        <button
          onClick={() => setActiveSubTab('convert')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'convert'
              ? 'bg-[#ff0055] text-white shadow-sm'
              : 'bg-[#09101d] text-[#8ba2c4] hover:text-white border border-[#1b2a44]'
          }`}
        >
          <FileJson className="w-4 h-4" />
          Convertisseur JSON Unique
        </button>

        <button
          onClick={() => setActiveSubTab('sources')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'sources'
              ? 'bg-[#ff0055] text-white shadow-sm'
              : 'bg-[#09101d] text-[#8ba2c4] hover:text-white border border-[#1b2a44]'
          }`}
        >
          <Globe className="w-4 h-4" />
          Gestion des Catalogues ({catalogConfigs.length})
        </button>

        <button
          onClick={() => setActiveSubTab('workflow')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'workflow'
              ? 'bg-[#ff0055] text-white shadow-sm'
              : 'bg-[#09101d] text-[#8ba2c4] hover:text-white border border-[#1b2a44]'
          }`}
        >
          <Terminal className="w-4 h-4" />
          GitHub Actions & Script
        </button>
      </div>

      {/* TAB 1: RAWG.io */}
      {activeSubTab === 'rawg' && (
        <div className="bg-[#09101d] border border-[#1b2a44] rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="max-w-2xl space-y-2">
            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
              <Key className="w-5 h-5 text-[#ff0055]" />
              Configuration du Token RAWG.io
            </h2>
            <p className="text-xs text-[#7990b5] leading-relaxed">
              RAWG.io fournit une base de données de plus de 500 000 jeux vidéo avec jaquettes officielles haute définition, scores Metacritic, notes, synopsis et captures d'écran.
              Obtenez une clé API gratuite sur{' '}
              <a href="https://rawg.io/apidocs" target="_blank" rel="noreferrer" className="text-[#00d9ff] underline inline-flex items-center gap-1">
                rawg.io/apidocs <ExternalLink className="w-3 h-3" />
              </a>.
            </p>
          </div>

          <div className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-xs font-bold text-[#8ba2c4] uppercase tracking-wider mb-2">
                Votre Token API RAWG
              </label>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={rawgToken}
                  onChange={(e) => setRawgToken(e.target.value)}
                  placeholder="Exemple: 8a7c6b54d3e210..."
                  className="flex-1 bg-[#050811] border border-[#1b2a44] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#ff0055]"
                />
                <button
                  onClick={handleTestKey}
                  disabled={testing}
                  className="bg-[#050811] hover:bg-[#121c33] border border-[#1b2a44] text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                >
                  {testing ? 'Test en cours...' : 'Tester la clé'}
                </button>
              </div>
            </div>

            {testResult && (
              <div
                className={`p-3 rounded-xl border text-xs flex items-center gap-2.5 ${
                  testResult.success
                    ? 'bg-[#00e676]/10 border-[#00e676]/40 text-[#00e676]'
                    : 'bg-[#ff0055]/10 border-[#ff0055]/40 text-[#ff0055]'
                }`}
              >
                {testResult.success ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                <div className="flex-1">{testResult.message}</div>
                {testResult.success && (
                  <button
                    onClick={() => downloadJsonFile(games, 'catalog_database.json')}
                    className="bg-[#00e676] hover:bg-[#00c864] text-black font-extrabold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-all flex-shrink-0 cursor-pointer shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Télécharger le JSON pour GitHub
                  </button>
                )}
              </div>
            )}

            {/* Notice Homebrew */}
            <div className="bg-[#050811] border border-[#1b2a44] rounded-xl p-3 text-[11px] text-[#7990b5]">
              🛡️ <b>Filtrage de sécurité :</b> Seuls les catalogues de jeux (<i>BlackBox, Pippo, PFS, DLPS</i>) sont scannés. Les applications et catalogues Homebrew (<i>evoX APPS, Homebrew Store</i>) sont automatiquement ignorés pour préserver vos requêtes RAWG.
            </div>

            {/* Batch Enrichment Control */}
            <div className="pt-4 border-t border-[#1b2a44]/60 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
                    Enrichissement automatique des titres actuels
                  </h3>
                  <p className="text-[11px] text-[#7990b5]">
                    Parcourt les jeux de votre store pour récupérer les jaquettes HD, développeurs, durée et métadonnées.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {enriching ? (
                    <button
                      onClick={() => setStopRequested(true)}
                      className="bg-[#ff0055] hover:bg-[#e6004c] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer"
                    >
                      <Square className="w-3.5 h-3.5" />
                      Arrêter
                    </button>
                  ) : (
                    <button
                      onClick={handleStartEnrichment}
                      className="bg-[#ff0055] hover:bg-[#e6004c] text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-[0_4px_15px_rgba(255,0,85,0.3)] cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      Lancer l'enrichissement
                    </button>
                  )}
                </div>
              </div>

              {enriching && (
                <div className="bg-[#050811] border border-[#1b2a44] rounded-xl p-4 space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-white">Progression : {progress.current} / {progress.total}</span>
                    <span className="text-[#00d9ff] truncate max-w-[250px]">{progress.title}</span>
                  </div>
                  <div className="w-full h-2 bg-[#09101d] rounded-full overflow-hidden border border-[#1b2a44]">
                    <div
                      className="h-full bg-gradient-to-r from-[#ff0055] to-[#00d9ff] transition-all duration-300"
                      style={{ width: `${(progress.current / Math.max(1, progress.total)) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CONVERTISSEUR JSON */}
      {activeSubTab === 'convert' && (
        <div className="bg-[#09101d] border border-[#1b2a44] rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="space-y-1">
            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
              <FileJson className="w-5 h-5 text-[#ff0055]" />
              Convertisseur de Catalogues Bruts vers Base Normalisée
            </h2>
            <p className="text-xs text-[#7990b5]">
              Importez n'importe quel catalogue JSON (format BlackBox, Pippo, PFS, DLPS ou liste personnalisée). Le script extrait automatiquement les liens (base, patch, DLC), les tailles, les Title IDs et harmonise la structure.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Input Method 1: File Upload */}
            <div className="bg-[#050811] border border-[#1b2a44] rounded-xl p-4 space-y-3">
              <label className="block text-xs font-bold text-white uppercase tracking-wider">
                Option A : Importer un fichier .json depuis votre PC
              </label>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="w-full text-xs text-[#8ba2c4] file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border file:border-[#1b2a44] file:text-xs file:font-bold file:bg-[#09101d] file:text-white hover:file:bg-[#111c33] cursor-pointer"
              />
            </div>

            {/* Input Method 2: Remote URL */}
            <div className="bg-[#050811] border border-[#1b2a44] rounded-xl p-4 space-y-3">
              <label className="block text-xs font-bold text-white uppercase tracking-wider">
                Option B : Télécharger depuis une URL directe
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={remoteUrl}
                  onChange={(e) => setRemoteUrl(e.target.value)}
                  placeholder="https://.../catalog.json"
                  className="flex-1 bg-[#09101d] border border-[#1b2a44] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#ff0055]"
                />
                <button
                  onClick={handleFetchRemoteUrl}
                  className="bg-[#ff0055] hover:bg-[#e6004c] text-white px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Charger
                </button>
              </div>
            </div>
          </div>

          {/* Paste Raw JSON */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-[#8ba2c4] uppercase tracking-wider">
                Contenu JSON brut (ou coller directement ci-dessous) :
              </label>
              <button
                onClick={() => handleConvertRawJson(rawJsonText, customCatalogName)}
                disabled={!rawJsonText.trim()}
                className="bg-[#050811] hover:bg-[#121c33] border border-[#1b2a44] text-[#00d9ff] px-3 py-1 rounded-lg text-xs font-bold transition-all disabled:opacity-40"
              >
                Normaliser le texte
              </button>
            </div>
            <textarea
              rows={6}
              value={rawJsonText}
              onChange={(e) => setRawJsonText(e.target.value)}
              placeholder="Collez ici le JSON de votre catalogue..."
              className="w-full font-mono text-xs bg-[#050811] border border-[#1b2a44] rounded-xl p-3 text-[#9ab0d0] focus:outline-none focus:border-[#ff0055]"
            />
          </div>

          {convertStatus && (
            <div className="p-3 rounded-xl bg-[#050811] border border-[#1b2a44] text-xs font-semibold text-white">
              {convertStatus}
            </div>
          )}

          {/* Action Export / Merge */}
          <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-[#1b2a44]/60">
            {convertedPreview && convertedPreview.length > 0 && (
              <button
                onClick={handleMergeToCurrentStore}
                className="bg-[#ff0055] hover:bg-[#e6004c] text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md"
              >
                <Plus className="w-4 h-4" />
                Fusionner ({convertedPreview.length} titres) dans le Store
              </button>
            )}

            <button
              onClick={handleExportNormalizedJson}
              className="bg-[#050811] hover:bg-[#121c33] border border-[#1b2a44] text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#00e676]" />
              Télécharger catalog_database.json (Base Unifiée)
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: SOURCES EXTERNES */}
      {activeSubTab === 'sources' && (
        <div className="bg-[#09101d] border border-[#1b2a44] rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="space-y-1">
            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-[#ff0055]" />
              Sources & Catalogues Connectés
            </h2>
            <p className="text-xs text-[#7990b5]">
              Activez ou désactivez les catalogues selon vos préférences, ou ajoutez vos propres URLs de catalogues personnalisés.
            </p>
          </div>

          {/* Add New Source */}
          <div className="bg-[#050811] border border-[#1b2a44] rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Ajouter un nouveau catalogue distant
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
              <input
                type="text"
                value={newSourceName}
                onChange={(e) => setNewSourceName(e.target.value)}
                placeholder="Nom du catalogue (ex: PS5 Community Repack)"
                className="sm:col-span-4 bg-[#09101d] border border-[#1b2a44] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              />
              <input
                type="url"
                value={newSourceUrl}
                onChange={(e) => setNewSourceUrl(e.target.value)}
                placeholder="URL directe du JSON (https://.../catalog.json)"
                className="sm:col-span-6 bg-[#09101d] border border-[#1b2a44] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              />
              <button
                onClick={handleAddNewCatalogSource}
                className="sm:col-span-2 bg-[#ff0055] hover:bg-[#e6004c] text-white px-3 py-2 rounded-xl text-xs font-bold cursor-pointer"
              >
                Ajouter
              </button>
            </div>
          </div>

          {/* List of Configured Sources */}
          <div className="space-y-2">
            {catalogConfigs.map((cfg) => (
              <div
                key={cfg.id}
                className="bg-[#050811] border border-[#1b2a44] rounded-xl p-3.5 flex items-center justify-between gap-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-white">{cfg.name}</span>
                    {cfg.isCustom && (
                      <span className="text-[10px] bg-[#00d9ff]/20 text-[#00d9ff] px-2 py-0.5 rounded font-bold">
                        Personnalisé
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-[#7990b5] truncate mt-0.5 font-mono">
                    {cfg.urls.join(', ')}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={cfg.enabled}
                      onChange={() => {
                        setCatalogConfigs(prev => prev.map(c => c.id === cfg.id ? { ...c, enabled: !c.enabled } : c));
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-[#1b2a44] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#ff0055]"></div>
                  </label>

                  {cfg.isCustom && (
                    <button
                      onClick={() => handleRemoveSource(cfg.id)}
                      className="text-[#ff0055] p-1.5 rounded-lg hover:bg-[#ff0055]/10"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: GITHUB ACTIONS & WORKFLOW */}
      {activeSubTab === 'workflow' && (
        <div className="bg-[#09101d] border border-[#1b2a44] rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="space-y-1">
            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
              <Terminal className="w-5 h-5 text-[#ff0055]" />
              Déploiement Automatisé sur GitHub Pages
            </h2>
            <p className="text-xs text-[#7990b5]">
              Voici la solution complète pour déployer automatiquement le site statique rapide sur GitHub Pages avec mise à jour programmée de la base de données.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="bg-[#050811] border border-[#1b2a44] rounded-xl p-4 space-y-2">
              <div className="w-7 h-7 rounded-lg bg-[#ff0055]/20 text-[#ff0055] font-black flex items-center justify-center text-xs">
                1
              </div>
              <h3 className="font-bold text-white text-xs">Créer le Secret RAWG_API_KEY</h3>
              <p className="text-[11px] text-[#7990b5] leading-relaxed">
                Dans votre dépôt GitHub : allez dans <b>Settings &gt; Secrets and variables &gt; Actions</b>, puis ajoutez un nouveau secret nommé <code>RAWG_API_KEY</code> contenant votre clé.
              </p>
            </div>

            <div className="bg-[#050811] border border-[#1b2a44] rounded-xl p-4 space-y-2">
              <div className="w-7 h-7 rounded-lg bg-[#00d9ff]/20 text-[#00d9ff] font-black flex items-center justify-center text-xs">
                2
              </div>
              <h3 className="font-bold text-white text-xs">Activer GitHub Pages</h3>
              <p className="text-[11px] text-[#7990b5] leading-relaxed">
                Dans <b>Settings &gt; Pages &gt; Build and deployment</b>, choisissez la source : <b>GitHub Actions</b>.
              </p>
            </div>

            <div className="bg-[#050811] border border-[#1b2a44] rounded-xl p-4 space-y-2">
              <div className="w-7 h-7 rounded-lg bg-[#00e676]/20 text-[#00e676] font-black flex items-center justify-center text-xs">
                3
              </div>
              <h3 className="font-bold text-white text-xs">Automatisation Quotidienne</h3>
              <p className="text-[11px] text-[#7990b5] leading-relaxed">
                Le workflow tourne chaque jour à 04:00 UTC pour mettre à jour les nouveaux packages et jaquettes, ou à chaque <code>git push</code>.
              </p>
            </div>
          </div>

          {/* Workflow Code Box */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <Code className="w-4 h-4 text-[#ff0055]" />
                Fichier du workflow : <code>.github/workflows/deploy.yml</code>
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`name: Deploy evoX Store to GitHub Pages
on:
  push:
    branches: [main]
  schedule:
    - cron: '0 4 * * *'
  workflow_dispatch:
permissions:
  contents: read
  pages: write
  id-token: write
jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci || npm install
      - env:
          RAWG_API_KEY: \${{ secrets.RAWG_API_KEY }}
        run: node scripts/build-catalog.js
      - run: npm run build
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'
      - uses: actions/deploy-pages@v4`);
                  setCopiedWorkflow(true);
                  setTimeout(() => setCopiedWorkflow(false), 2000);
                }}
                className="bg-[#050811] hover:bg-[#121c33] border border-[#1b2a44] text-[#8ca0c0] hover:text-white px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                {copiedWorkflow ? <Check className="w-3.5 h-3.5 text-[#00e676]" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedWorkflow ? 'Copié !' : 'Copier le workflow'}
              </button>
            </div>
            <pre className="bg-[#050811] border border-[#1b2a44] rounded-xl p-4 text-[11px] font-mono text-[#8ca0c0] overflow-x-auto max-h-48 leading-relaxed">
{`name: Deploy evoX Store to GitHub Pages
on:
  push:
    branches: [main]
  schedule:
    - cron: '0 4 * * *'
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci || npm install
      - env:
          RAWG_API_KEY: \${{ secrets.RAWG_API_KEY }}
        run: node scripts/build-catalog.js
      - run: npm run build
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'
      - uses: actions/deploy-pages@v4`}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
