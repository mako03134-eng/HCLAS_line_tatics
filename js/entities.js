// Fighter(유닛·적 공용) / Base(성)
import { FIELD_W, ROW_TOP, ROW_BOT, PLAYER_BASE_X, ENEMY_BASE_X, clamp } from './config.js';
import { game } from './state.js';
import { WALLET } from './data/index.js';
import { targetsInAttackRange, makeProjectile, foesOf } from './combat.js';
import { addText, addSlash, addPoof, addExplosion, addLaser } from './effects.js';

export class Fighter {
  constructor(def, x, side) {
    this.side = side; this.dir = side === 'player' ? -1 : 1; // 아군은 왼쪽으로 진군
    this.def = def; this.x = x;
    this.y = ROW_TOP + Math.random() * (ROW_BOT - ROW_TOP); // 시각적 행(겹침 방지)
    this.maxHp = def.hp; this.hp = def.hp;
    this.radius = 15 * (def.size || 1);
    this.state = 'idle'; // idle | windup | backswing | kb
    this.windupT = 0; this.backswingT = 0; this.kbT = 0;
    this.kbThreshold = def.hp / def.kb; // 원작식 넉백 판정 기준
    this.dmgTaken = 0;
    this.hitT = 0; this.attackT = 0; this.spawnT = .35;
    this.walkPhase = Math.random() * Math.PI * 2;
    this.moving = false; this.alive = true;
  }

  update(dt) {
    this.hitT = Math.max(0, this.hitT - dt);
    this.attackT = Math.max(0, this.attackT - dt);
    this.moving = false;
    if (this.spawnT > 0) { this.spawnT -= dt; return; }

    if (this.state === 'kb') { // 넉백: 뒤로 구르고 경직
      this.kbT -= dt;
      this.x = clamp(this.x - this.dir * 150 * dt, 25, FIELD_W - 25);
      if (this.kbT <= 0) this.state = 'idle';
      return;
    }
    if (this.state === 'backswing') { // 후딜
      this.backswingT -= dt;
      if (this.backswingT <= 0) this.state = 'idle';
      return;
    }
    if (this.state === 'windup') { // 전딜 → 타격 판정
      this.windupT -= dt;
      if (this.windupT <= 0) {
        this.strike();
        this.state = 'backswing'; this.backswingT = this.def.backswing;
      }
      return;
    }
    // idle: 사거리에 적이 있으면 공격 개시, 없으면 전진
    if (targetsInAttackRange(this).length > 0) {
      this.state = 'windup'; this.windupT = this.def.windup;
    } else {
      this.moving = true;
      this.x = clamp(this.x + this.dir * this.def.speed * dt, 25, FIELD_W - 25);
      this.walkPhase += dt * (4 + this.def.speed / 20);
    }
  }

  strike() {
    const foes = targetsInAttackRange(this);
    if (foes.length === 0) return; // 헛스윙
    this.attackT = .18;
    if (this.def.aoe) game.projectiles.push(makeProjectile(this, foes[0]));
    else { addSlash(foes[0].x, foes[0].y - 16); foes[0].takeDamage(this.def.atk); }
  }

  takeDamage(amount) {
    if (this.hp <= 0) return;
    this.hp -= amount; this.hitT = .12;
    addText(this.x, this.y - 52, Math.round(amount), this.side === 'player' ? '#ffb066' : '#ff5b5b');
    if (this.hp <= 0) { this.die(); return; }
    this.dmgTaken += amount;
    if (this.dmgTaken >= this.kbThreshold) { // 누적 피해 → 넉백
      this.dmgTaken = 0; this.state = 'kb'; this.kbT = .55;
    }
  }

  die() {
    this.alive = false;
    addPoof(this.x, this.y, this.def.color || '#e8e8e8');
    if (this.side === 'enemy' && this.def.reward) {
      const wl = WALLET.levels[game.walletLv];
      game.money = Math.min(wl.max, game.money + this.def.reward);
      addText(this.x, this.y - 68, '+' + this.def.reward, '#ffe25b');
      game.kills++;
    }
  }
}

export class Base { // 성: tower 데이터가 주입된 아군 성은 직접 공격도 함
  constructor(side, hp) {
    this.side = side; this.dir = side === 'player' ? -1 : 1;
    this.x = side === 'player' ? PLAYER_BASE_X : ENEMY_BASE_X;
    this.y = 322; this.radius = 48;
    this.maxHp = hp; this.hp = hp; this.hitT = 0; this.alive = true;
    this.tower = null;   // scenes.js에서 주입(null이면 공격 안 하는 기존 성)
    this.attackCd = 0;   // 다음 발사까지 남은 시간
    this.fireT = 0;      // 발사 이미지 스왑 유지 시간(렌더용)
  }

  update(dt) {
    this.hitT = Math.max(0, this.hitT - dt);
    this.fireT = Math.max(0, this.fireT - dt);
    if (!this.tower || !this.alive || game.resultPending) return;
    this.attackCd = Math.max(0, this.attackCd - dt);
    if (this.attackCd > 0) return;

    // 사거리 내 가장 가까운 적 → 레이저 발사
    const sign = this.side === 'player' ? 1 : -1;
    let best = null, bestAhead = Infinity;
    for (const c of foesOf(this.side)) {
      const ahead = (this.x - c.x) * sign;
      if (ahead > 0 && ahead <= this.tower.range && ahead < bestAhead) { best = c; bestAhead = ahead; }
    }
    if (!best) return;
    this.attackCd = this.tower.interval;
    this.fireT = .28; // 레이저 표시 시간과 동일하게
    const eyeX = this.x + this.dir * 10;
    const eyeY = this.y - (this.tower.height || 110) * (this.tower.eyeH || .72);
    addLaser(eyeX, eyeY, best.x, best.y - 20);
    best.takeDamage(this.tower.atk);
  }

  takeDamage(amount) {
    if (this.hp <= 0 || game.resultPending) return;
    this.hp = Math.max(0, this.hp - amount);
    this.hitT = .25; game.shake = Math.min(1, game.shake + .3);
    addText(this.x, this.y - 160, Math.round(amount), this.side === 'player' ? '#ffb066' : '#ff5b5b');
    if (this.hp <= 0) {
      this.alive = false;
      addExplosion(this.x, this.y, 90);
      game.shake = 1; game.spawnQueue = [];
      game.resultPending = { win: this.side === 'enemy', t: 1.6 };
    }
  }
    }
