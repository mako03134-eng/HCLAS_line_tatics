import { game } from './state.js';
import { CATS, ENEMY_TYPES, TOWER } from './data/index.js';
import { assetSrc, preload } from './assets.js';
import { updateBattle } from './update.js';
import { render } from './render.js';
import { initHud, updateHud } from './hud.js';
import { initBattle, showTitle, showOverlay } from './scenes.js';
import { initInput } from './input.js';

async function boot() {
  const jobs = [
    ...CATS.filter(c => c.img).map(c => ({ key: 'cat/' + c.id, src: assetSrc('characters', c.img) })),
    ...CATS.filter(c => c.imgAtk).map(c => ({ key: 'cat/' + c.id + '_atk', src: assetSrc('characters', c.imgAtk) })),       // 공격 모션
    ...Object.values(ENEMY_TYPES).filter(e => e.img).map(e => ({ key: 'enemy/' + e.id, src: assetSrc('enemies', e.img) })),
    ...Object.values(ENEMY_TYPES).filter(e => e.imgAtk).map(e => ({ key: 'enemy/' + e.id + '_atk', src: assetSrc('enemies', e.imgAtk) })),
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

  initHud();
  initInput();
  initBattle(0);   
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
