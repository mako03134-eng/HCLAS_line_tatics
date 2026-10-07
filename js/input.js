// 입력 배선: 키보드 + 상단바/오버레이 버튼 → 명령·씬 호출만 함
import { CATS } from './data/index.js';
import { game } from './state.js';
import { deployCat, upgradeWallet, fireCannon } from './commands.js';
import { initBattle, showTitle, togglePause, toggleSpeed } from './scenes.js';

export function initInput() {
  window.addEventListener('keydown', e => {
    if (e.repeat) return;
    if (e.code.startsWith('Digit')) {
      const i = +e.code.slice(5) - 1;
      if (i >= 0 && i < CATS.length) deployCat(i);
    }
    else if (e.code === 'KeyQ') upgradeWallet();
    else if (e.code === 'KeyC') fireCannon();
    else if (e.code === 'KeyS') toggleSpeed();
    else if (e.code === 'KeyP') togglePause();
  });

  document.getElementById('speedBtn').addEventListener('click', toggleSpeed);
  document.getElementById('pauseBtn').addEventListener('click', () => togglePause());

  document.getElementById('overlay').addEventListener('click', e => { // 오버레이 버튼 위임
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const [act, arg] = btn.dataset.action.split(':');
    if (act === 'start') initBattle(+arg);
    else if (act === 'retry') initBattle(game.stageIdx);
    else if (act === 'title') showTitle();
    else if (act === 'resume') togglePause(false);
  });
}
