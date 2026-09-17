// The offline copy (D50). Only the standalone build registers the worker: inside claude.ai
// the page is served by the host, which a worker of ours has no business caching.
export function registerOffline(onUpdate: () => void): void {
  if ('claude' in window || !('serviceWorker' in navigator) || !window.isSecureContext) return;
  const hadController = navigator.serviceWorker.controller !== null;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (hadController) onUpdate();
  });
  navigator.serviceWorker.register('sw.js').catch(() => {
    // Not fatal: the page works online without it.
  });
}

type Downloads = { save(file: { filename: string; data: string | Blob }): Promise<unknown> };
type Host = { use(name: string): Promise<unknown> };

/** Offers a file to save: through the host inside claude.ai, as a plain link elsewhere. */
export async function saveFile(filename: string, text: string): Promise<boolean> {
  const host = (window as unknown as { claude?: Host }).claude;
  if (host) {
    try {
      const downloads = (await host.use('downloads')) as Downloads | null;
      if (!downloads) return false;
      await downloads.save({ filename, data: new Blob([text], { type: 'application/json' }) });
      return true;
    } catch {
      return false;
    }
  }
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.append(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  return true;
}
