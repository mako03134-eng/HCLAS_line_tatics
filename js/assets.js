const images = new Map(); 
const whiteCache = new Map(); 

export const assetSrc = (folder, file) => `assets/${folder}/${file}`;

function loadImage(key, src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      images.set(key, img);
      resolve(true);
    };
    img.onerror = () => {
      console.warn(`[assets] 로드 실패: ${src} → 임시 드로잉으로 대체`);
      resolve(false);
    };
    img.src = src;
  });
}

export async function preload(jobs, onProgress) {
  let done = 0;
  await Promise.all(
    jobs.map((j) =>
      loadImage(j.key, j.src).then(() => {
        done++;
        onProgress && onProgress(done, jobs.length);
      })
    )
  );
}

export const getImage = (key) => images.get(key) || null;

export function getWhiteImage(key) {
  const img = images.get(key);
  if (!img) return null;

  let w = whiteCache.get(key);
  if (!w) {
    w = document.createElement('canvas');
    w.width = img.naturalWidth;
    w.height = img.naturalHeight;

    const g = w.getContext('2d');
    g.drawImage(img, 0, 0);
    g.globalCompositeOperation = 'source-in';
    g.fillStyle = '#fff';
    g.fillRect(0, 0, w.width, w.height);

    whiteCache.set(key, w);
  }
  return w;
}