import aplayerScriptUrl from 'aplayer/dist/APlayer.min.js?url&no-inline';
import aplayerStyleUrl from 'aplayer/dist/APlayer.min.css?url&no-inline';
import metingScriptUrl from 'meting/dist/Meting.min.js?url&no-inline';

let musicAssetsPromise: Promise<void> | null = null;

declare global {
  interface Window {
    APlayer?: unknown;
  }
}

function loadStylesheet(url: string) {
  const existing = document.querySelector<HTMLLinkElement>(
    'link[data-music-player-style="true"]',
  );

  if (existing?.dataset.loaded === 'true') {
    return Promise.resolve();
  }

  return new Promise<void>((resolve, reject) => {
    const stylesheet = existing ?? document.createElement('link');
    stylesheet.addEventListener(
      'load',
      () => {
        stylesheet.dataset.loaded = 'true';
        resolve();
      },
      { once: true },
    );
    stylesheet.addEventListener(
      'error',
      () => {
        stylesheet.remove();
        reject(new Error(`Failed to load stylesheet: ${url}`));
      },
      { once: true },
    );

    if (!existing) {
      stylesheet.rel = 'stylesheet';
      stylesheet.href = url;
      stylesheet.dataset.musicPlayerStyle = 'true';
      document.head.append(stylesheet);
    }
  });
}

function loadScript(url: string, id: string) {
  const existing = document.getElementById(id) as HTMLScriptElement | null;

  if (existing?.dataset.loaded === 'true') {
    return Promise.resolve();
  }

  return new Promise<void>((resolve, reject) => {
    const script = existing ?? document.createElement('script');

    const handleLoad = () => {
      script.dataset.loaded = 'true';
      resolve();
    };

    script.addEventListener('load', handleLoad, { once: true });
    script.addEventListener(
      'error',
      () => {
        script.remove();
        reject(new Error(`Failed to load script: ${url}`));
      },
      { once: true },
    );

    if (!existing) {
      script.id = id;
      script.src = url;
      script.defer = true;
      document.head.append(script);
    }
  });
}

export function loadMusicAssets() {
  if (window.customElements.get('meting-js') && window.APlayer) {
    return Promise.resolve();
  }

  if (!musicAssetsPromise) {
    musicAssetsPromise = (async () => {
      await Promise.all([
        loadStylesheet(aplayerStyleUrl),
        loadScript(aplayerScriptUrl, 'aplayer-script'),
      ]);

      if (!window.APlayer) {
        throw new Error('APlayer was not registered');
      }

      await loadScript(metingScriptUrl, 'meting-script');

      if (!window.customElements.get('meting-js')) {
        throw new Error('MetingJS custom element was not registered');
      }
    })().catch((error) => {
      musicAssetsPromise = null;
      throw error;
    });
  }

  return musicAssetsPromise;
}
