import { UserSyncState } from '../types/catalog';

const SYNC_STORAGE_KEY = 'evox_pegasus_sync_state_v1';

export function getLocalSyncState(): UserSyncState {
  try {
    const raw = localStorage.getItem(SYNC_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error reading sync state:', e);
  }

  return {
    favorites: [],
    customCatalogs: [],
    rawgToken: localStorage.getItem('evox_rawg_token') || '',
    lastSyncDate: new Date().toISOString(),
    detailMode: (localStorage.getItem('evoX_detailMode') as any) || 'page',
    defaultViewMode: 'grid',
  };
}

export function saveLocalSyncState(state: UserSyncState): void {
  try {
    state.lastSyncDate = new Date().toISOString();
    localStorage.setItem(SYNC_STORAGE_KEY, JSON.stringify(state));
    if (state.rawgToken) {
      localStorage.setItem('evox_rawg_token', state.rawgToken);
    }
    if (state.detailMode) {
      localStorage.setItem('evoX_detailMode', state.detailMode);
    }
  } catch (e) {
    console.error('Error saving sync state:', e);
  }
}

export function exportSyncPayload(state: UserSyncState): string {
  const payload = {
    app: 'evox-pegasus-store',
    v: 1,
    data: state,
  };
  return btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
}

export function importSyncPayload(code: string): UserSyncState {
  try {
    const jsonStr = decodeURIComponent(escape(atob(code.trim())));
    const parsed = JSON.parse(jsonStr);
    if (parsed && parsed.data) {
      return parsed.data as UserSyncState;
    }
    return parsed as UserSyncState;
  } catch (err: any) {
    throw new Error('Code de synchronisation invalide ou corrompu: ' + err.message);
  }
}

export function downloadJsonFile(data: any, filename: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
