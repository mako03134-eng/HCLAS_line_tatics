// 씬 전환: 타이틀/결과/일시정지 오버레이 + 배틀 초기화
import { game } from './state.js';
import { STAGES, TOWER } from './data/index.js';
import { Base } from './entities.js';
import { setStageName, updateSpeedBtn } from './hud.js';

const overlay = document.getElementById('overlay');

export function showOverlay(html) { overlay.innerHTML = html; overlay.style.display = 'flex'; }
export function hideOverlay() { overlay.style.display = 'none'; }

const getCleared = () => { try { return JSON.parse(localStorage.getItem('nyankoClear') || '[]'); } catch (e) { return []; } };
const setCleared = a => { try { localStorage.setItem('nyankoClear', JSON.stringify(a)); } catch (e) {} };

export function showTitle() {
  game.scene = 'title';
  const cleared = getCleared();
  showOverlay(`<div class="panel">
    <h1 class="title">냥코 대전쟁 <span style="font-size:13px;color:#999">web prototype</span></h1>
    <p class="sub">적성 뿌시기<br>열심히 운영 ㄱㄱ</p>
    ${STAGES.map((s, i) =>
      `<button class="stageBtn" data-action="start:${i}">${s.name}${cleared.includes(i) ? ' ★' : ''}</button>`).join('')}
    <p class="hint">숫자키 1~9: 캐릭터 생성 · Q: 지갑 강화 · C: 빔 · S: 배속 · P: 일시정지</p>
  </div>`);
}

export function showResult(win) {
  game.scene = 'result';
  if (win) {
    const cleared = getCleared();
    if (!cleared.includes(game.stageIdx)) { cleared.push(game.stageIdx); setCleared(cleared); }
  }
  const mm = String(Math.floor(game.t / 60)).padStart(2, '0');
  const ss = String(Math.floor(game.t % 60)).padStart(2, '0');
  showOverlay(`<div class="panel">
    <h2 class="${win ? 'win' : 'lose'}">${win ? '승리!' : '패배...'}</h2>
    <p class="stats">${STAGES[game.stageIdx].name} · ${mm}:${ss}<br>적 처치 ${game.kills} · 캐릭터 생성 ${game.spawnedCount}</p>
    <button class="stageBtn" data-action="retry">다시하기</button>
    <button class="stageBtn alt" data-action="title">레벨택</button>
  </div>`);
}

export function initBattle(idx) {
  const st = STAGES[idx];
  game.scene = 'battle'; game.paused = false; game.stageIdx = idx;
  game.t = 0; game.speed = 1; game.money = st.startMoney; game.walletLv = 0;
  game.units = []; game.enemies = []; game.projectiles = []; game.fx = []; game.spawnQueue = [];
  game.playerBase = new Base('player', st.playerBaseHp);
  game.enemyBase = new Base('enemy', st.baseHp);
  game.playerBase.tower = st.tower || TOWER; // 아군만 타워(스킨 + 레이저)
  game.enemyBase.tower = null;               // 적 성은 공격도 스킨도 없음
  game.raged = false; game.hippoWarned = false; game.resultPending = null;
  game.cannonCharge = 0; game.cd = {};
  game.kills = 0; game.spawnedCount = 0; game.shake = 0;
  for (const s of st.spawns)
    for (let i = 0; i < (s.n || 1); i++) game.spawnQueue.push({ t: s.t + i * (s.gap || 0), type: s.type });
  game.spawnQueue.sort((a, b) => a.t - b.t);
  setStageName(`예준이 대전쟁 · ${st.name}`);
  updateSpeedBtn();
  hideOverlay();
}

export function togglePause(force) {
  if (game.scene !== 'battle') return;
  game.paused = force !== undefined ? force : !game.paused;
  if (game.paused)
    showOverlay(`<div class="panel"><h2>일시정지</h2><button class="stageBtn" data-action="resume">계속하기</button></div>`);
  else hideOverlay();
}

export function toggleSpeed() {
  if (game.scene !== 'battle') return;
  game.speed = game.speed === 1 ? 2 : 1;
  updateSpeedBtn();
}
