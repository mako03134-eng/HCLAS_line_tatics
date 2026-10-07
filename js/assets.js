// 스프라이트 로더 — 키('cat/basic' 등)로 이미지 읽기
// 로드 실패해도 죽지 않고 sprites.js가 캔버스 드로잉으로 폴백
const images = new Map(); // key -> HTMLImageElement
const whiteCache = new Map(); // key -> 흰 실루엣 canvas (피격 플래시용)

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
  // jobs: [{ key, src }] / onProgress: (완료수, 전체수)
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
  // 피격 플래시용 흰 실루엣(최초 1회만 생성)
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