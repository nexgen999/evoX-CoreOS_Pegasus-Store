import React, { useState } from 'react';
import { 
  RefreshCw, 
  QrCode, 
  Copy, 
  Check, 
  Download, 
  Upload, 
  Sparkles, 
  ShieldCheck, 
  Smartphone, 
  Tv, 
  Laptop,
  AlertCircle
} from 'lucide-react';
import { UserSyncState } from '../types/catalog';
import { exportSyncPayload, importSyncPayload, downloadJsonFile } from '../services/sync';

interface MultiDeviceSyncModalProps {
  syncState: UserSyncState;
  onApplySyncState: (newState: UserSyncState) => void;
}

export const MultiDeviceSyncModal: React.FC<MultiDeviceSyncModalProps> = ({
  syncState,
  onApplySyncState,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [importCodeInput, setImportCodeInput] = useState('');
  const [importStatus, setImportStatus] = useState<{ success: boolean; message: string } | null>(null);

  const payloadString = exportSyncPayload(syncState);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(payloadString);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleApplyCode = () => {
    if (!importCodeInput.trim()) return;
    try {
      const parsed = importSyncPayload(importCodeInput.trim());
      onApplySyncState(parsed);
      setImportStatus({ success: true, message: 'Synchronisation réussie ! Vos données ont été appliquées.' });
      setImportCodeInput('');
    } catch (e: any) {
      setImportStatus({ success: false, message: e.message });
    }
  };

  const handleExportFile = () => {
    downloadJsonFile(syncState, `evox-sync-backup-${new Date().toISOString().split('T')[0]}.json`);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const json = JSON.parse(evt.target?.result as string);
        onApplySyncState(json);
        setImportStatus({ success: true, message: 'Fichier de sauvegarde restauré avec succès !' });
      } catch (err: any) {
        setImportStatus({ success: false, message: 'Format de fichier invalide: ' + err.message });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#0d172e] to-[#070b14] border border-[#1b2a44] rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-bold text-[#ff0055] uppercase tracking-wider mb-2">
            <RefreshCw className="w-4 h-4" />
            Synchronisation Cross-Device
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
            Synchronisation Multi-Appareils
          </h1>
          <p className="text-xs sm:text-sm text-[#8ba2c4] leading-relaxed">
            Transférez instantanément vos jeux favoris, vos catalogues personnalisés et votre clé RAWG entre votre console (PS5/PS4), votre PC et votre smartphone.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Step 1: Export from this device */}
        <div className="bg-[#09101d] border border-[#1b2a44] rounded-2xl p-6 space-y-4 shadow-lg flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Laptop className="w-4 h-4 text-[#00d9ff]" />
              <h3>1. Exporter depuis cet appareil</h3>
            </div>
            <p className="text-xs text-[#7990b5] leading-relaxed">
              Copiez ce code compact ou exportez un fichier pour l'importer sur votre autre appareil (téléphone, console, etc.).
            </p>

            <div className="bg-[#050811] border border-[#1b2a44] rounded-xl p-3">
              <div className="text-[10px] font-mono text-[#7990b5] break-all max-h-24 overflow-y-auto">
                {payloadString}
              </div>
            </div>

            <div className="text-[11px] text-[#60779b] space-y-1">
              <div>✓ Favoris inclus : <b className="text-white">{syncState.favorites.length} titres</b></div>
              <div>✓ Catalogues personnalisés : <b className="text-white">{syncState.customCatalogs.length}</b></div>
              <div>✓ Mode d'affichage préféré : <b className="text-white">{syncState.detailMode}</b></div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 pt-3 border-t border-[#1b2a44]/60">
            <button
              onClick={handleCopyCode}
              className="bg-[#ff0055] hover:bg-[#e6004c] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md"
            >
              {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copiedCode ? 'Code copié !' : 'Copier le code de sync'}
            </button>

            <button
              onClick={handleExportFile}
              className="bg-[#050811] hover:bg-[#121c33] border border-[#1b2a44] text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#00e676]" />
              Sauvegarder en JSON
            </button>
          </div>
        </div>

        {/* Step 2: Import into target device */}
        <div className="bg-[#09101d] border border-[#1b2a44] rounded-2xl p-6 space-y-4 shadow-lg flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Tv className="w-4 h-4 text-[#ff0055]" />
              <h3>2. Importer sur cet appareil</h3>
            </div>
            <p className="text-xs text-[#7990b5] leading-relaxed">
              Collez ci-dessous le code de synchronisation généré depuis votre autre appareil ou chargez un fichier de sauvegarde.
            </p>

            <textarea
              rows={4}
              value={importCodeInput}
              onChange={(e) => setImportCodeInput(e.target.value)}
              placeholder="Collez ici le code de synchronisation Base64..."
              className="w-full bg-[#050811] border border-[#1b2a44] rounded-xl p-3 text-xs font-mono text-white focus:outline-none focus:border-[#ff0055]"
            />

            {importStatus && (
              <div
                className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                  importStatus.success
                    ? 'bg-[#00e676]/10 border-[#00e676]/40 text-[#00e676]'
                    : 'bg-[#ff0055]/10 border-[#ff0055]/40 text-[#ff0055]'
                }`}
              >
                {importStatus.success ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                {importStatus.message}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5 pt-3 border-t border-[#1b2a44]/60">
            <button
              onClick={handleApplyCode}
              disabled={!importCodeInput.trim()}
              className="bg-[#ff0055] hover:bg-[#e6004c] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all disabled:opacity-40 cursor-pointer shadow-md"
            >
              <RefreshCw className="w-4 h-4" />
              Appliquer la synchronisation
            </button>

            <label className="bg-[#050811] hover:bg-[#121c33] border border-[#1b2a44] text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer">
              <Upload className="w-4 h-4 text-[#00d9ff]" />
              Charger un fichier
              <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
