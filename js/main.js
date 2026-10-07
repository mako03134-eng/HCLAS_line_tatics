// 진입점: 스프라이트 선로딩 → 모듈 조립 → 게임 루프
import { game } from './state.js';
import { CATS, ENEMY_TYPES, TOWER } from './data/index.js';
import { assetSrc, preload } from './assets.js';
import { updateBattle } from './update.js';
import { render } from './render.js';
import { initHud, updateHud } from './hud.js';
import { initBattle, showTitle, showOverlay } from './scenes.js';
import { initInput } from './input.js';

async function boot() {
  // 1) 명단의 이미지 전부 선로딩 (실패해도 시작 — 임시 드로잉 폴백)
  const jobs = [
    ...CATS.filter(c => c.img).map(c => ({ key: 'cat/' + c.id, src: assetSrc('cats', c.img) })),
    ...Object.values(ENEMY_TYPES).filter(e => e.img).map(e => ({ key: 'enemy/' + e.id, src: assetSrc('enemies', e.img) })),
    ...(TOWER.img ? [{ key: 'tower/player', src: assetSrc('towers', TOWER.img) }] : []),
    ...(TOWER.imgFire ? [{ key: 'tower/player_fire', src: assetSrc('towers', TOWER.imgFire) }] : []),
  ];
  showOverlay(`<div class="panel"><h2>에셋 로딩 중</h2>
    <div id="loadBarWrap"><div id="loadBar"></div></div>
    <p class="sub" id="loadText">0 / ${jobs.length}</p></div>`);
  await preload(jobs, (done, total) => {
    document.getElementById('loadBar').style.width = (done / total * 100) + '%';
    document.getElementById('loadText').textContent = `${done} / ${total}`;
  });

  // 2) 조립 후 시작
  initHud();
  initInput();
  initBattle(0);   // 타이틀 뒤에 보일 배경
  game.scene = 'title';
  showTitle();
  requestAnimationFrame(loop);
}

let last = performance.now();
function loop(now) {
  requestAnimationFrame(loop);
  const rawDt = Math.min(.05, (now - last) / 1000);
  last = now;
  if (game.scene === 'battle' && !game.paused) updateBattle(rawDt * game.speed);
  render();
  updateHud();
}

boot();
