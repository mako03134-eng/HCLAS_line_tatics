import { W, FIELD_W, PLAYER_BASE_X, ENEMY_BASE_X, WORLD_SCALE } from './config.js';
import { game } from './state.js';
import { CATS, ENEMY_TYPES, CANNON, WALLET } from './data/index.js';
import { Fighter } from './entities.js';
import { addPoof, addText } from './effects.js';

export function spawnEnemy(type) {
  const def = ENEMY_TYPES[type];
  if (!def) { console.warn(`[spawn] 등록되지 않은 적 '${type}' — stage.js의 spawns 확인`); return; }
  game.enemies.push(new Fighter(def, ENEMY_BASE_X + 25 + Math.random() * 15, 'enemy'));
  if (def.id === 'hippo' && !game.hippoWarned) {
    game.hippoWarned = true; game.shake = Math.max(game.shake, .6);
    addText(FIELD_W / 2, 180, '보스 출몰!!', '#ff5b5b', 1.6, 20);
  }
}

export function deployCat(i) {
  if (game.scene !== 'battle' || game.paused || game.resultPending) return;
  const cat = CATS[i];
  if (game.t < (game.cd[cat.id] || 0) || game.money < cat.cost) return;
  game.money -= cat.cost;
  game.cd[cat.id] = game.t + cat.cd;
  game.units.push(new Fighter(cat, PLAYER_BASE_X - 25 - Math.random() * 20, 'player'));
  game.spawnedCount++;
  addPoof(PLAYER_BASE_X - 35, 315, '#ffffff');
}

export function upgradeWallet() {
  if (game.scene !== 'battle' || game.paused || game.resultPending) return;
  if (game.walletLv >= WALLET.costs.length) return;
  const cost = WALLET.costs[game.walletLv];
  if (game.money < cost) return;
  game.money -= cost; game.walletLv++;
  addText(PLAYER_BASE_X - 120, 235, `지갑 Lv.${game.walletLv + 1}!`, '#7ee08a', 1, 15);
}

export function fireCannon() {
  if (game.scene !== 'battle' || game.paused || game.resultPending) return;
  if (game.cannonCharge < CANNON.chargeTime) return;
  game.cannonCharge = 0; game.shake = 1;
  const b = game.playerBase;
  const tw = b.tower || {};
  const eyeX = b.x + b.dir * 10;
  const eyeY = b.y - (tw.height || 110) * (tw.eyeH || .72);
  game.fx.push({ t: 0, life: .9, draw(c) { 
    const p = this.t / this.life, fade = 1 - p;
    const ax = eyeX * WORLD_SCALE;
    const flick = .8 + Math.random() * .5; 
    c.save();
    c.globalCompositeOperation = 'lighter';
    c.lineCap = 'round';
    for (const off of [-6, 6]) {
      const ay = eyeY + off;
      c.globalAlpha = fade * .3; c.strokeStyle = '#ff1a1a'; c.lineWidth = 34 * flick;
      c.beginPath(); c.moveTo(ax, ay); c.lineTo(0, 300); c.stroke();
      c.globalAlpha = fade * .85; c.strokeStyle = '#ff5b5b'; c.lineWidth = 16 * flick;
      c.beginPath(); c.moveTo(ax, ay); c.lineTo(0, 300); c.stroke();
      c.globalAlpha = fade; c.strokeStyle = '#ffffff'; c.lineWidth = 5.5 * flick;
      c.beginPath(); c.moveTo(ax, ay); c.lineTo(0, 300); c.stroke();
    }
    const g = c.createRadialGradient(ax, eyeY, 0, ax, eyeY, 40);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(.4, 'rgba(255,80,80,.9)');
    g.addColorStop(1, 'rgba(255,0,0,0)');
    c.globalAlpha = fade; c.fillStyle = g;
    c.beginPath(); c.arc(ax, eyeY, 40, 0, 7); c.fill();
    c.globalAlpha = fade * .5; c.fillStyle = '#ffdddd';
    c.fillRect(0, 296, ax, 8);
    c.restore();
  }});
  for (const e of game.enemies) {
    if (!e.alive) continue;
    e.takeDamage(CANNON.atk);
    if (e.alive) { e.dmgTaken = 0; e.state = 'kb'; e.kbT = .6; }
  }
}

export function rageSpawn() { //상대 타워 HP 50% → 분노 효과
  game.shake = .7;
  addText(FIELD_W / 2, 200, '적 성이 분노했다!', '#ff5b5b', 1.4, 18);
  for (const s of [{ type: 'snache', n: 2, gap: 1.5 }, { type: 'pigge', n: 1, gap: 2 }])
    for (let i = 0; i < s.n; i++) game.spawnQueue.push({ t: game.t + 1 + i * s.gap, type: s.type });
  game.spawnQueue.sort((a, b) => a.t - b.t);
         }
