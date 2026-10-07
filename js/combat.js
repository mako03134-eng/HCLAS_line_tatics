// 전투 판정: 타겟팅(1차원 사거리) + 광역 투사체
import { WORLD_SCALE } from './config.js';
import { game } from './state.js';
import { addExplosion } from './effects.js';

export function foesOf(side) {
  // 해당 진영이 때릴 상대 목록(적 유닛 + 적 성)
  const list = (side === 'player' ? game.enemies : game.units).filter((a) => a.alive);
  const base = side === 'player' ? game.enemyBase : game.playerBase;
  if (base && base.alive) list.push(base);
  return list;
}

export function targetsInAttackRange(f) {
  const sign = f.side === 'player' ? 1 : -1; // '앞쪽 거리' = (f.x - 적.x) * sign
  const res = [];
  for (const c of foesOf(f.side)) {
    const ahead = (f.x - c.x) * sign;
    if (ahead >= -c.radius && ahead <= f.def.range + c.radius) {
      res.push({ c, ahead });
    }
  }
  res.sort((a, b) => a.ahead - b.ahead); // 가장 가까운 적부터
  return res.map((r) => r.c);
}

export function makeProjectile(f, target) {
  // 광역 유닛용, 착탄 시점 판정
  return {
    x: f.x + f.dir * 16,
    y: f.y - 26,
    tx: target.x,
    ty: target.y - 20,
    side: f.side,
    atk: f.def.atk,
    aoe: f.def.aoe,
    speed: 380,
    t: 0,
    dead: false,
    ang: 0,

    update(dt) {
      if (target.alive && target.hp > 0) {
        this.tx = target.x;
        this.ty = target.y - 20;
      }
      const dx = this.tx - this.x;
      const dy = this.ty - this.y;
      const dist = Math.hypot(dx, dy) || 1;
      this.ang = Math.atan2(dy, dx);
      const step = this.speed * dt;

      if (dist <= step + 10) {
        this.impact();
        this.dead = true;
      } else {
        this.x += (dx / dist) * step;
        this.y += (dy / dist) * step;
      }
    },

    impact() {
      addExplosion(this.tx, this.ty + 16, this.aoe);
      for (const c of foesOf(this.side)) {
        if (Math.abs(c.x - this.tx) <= this.aoe) {
          c.takeDamage(this.atk);
        }
      }
    },

    draw(c) {
      const sx = this.x * WORLD_SCALE;
      c.save();

      // 잔상
      c.globalAlpha = 0.4;
      c.fillStyle = '#b18cf5';
      c.beginPath();
      c.arc(sx - Math.cos(this.ang) * 12, this.y - Math.sin(this.ang) * 12, 4, 0, 7);
      c.fill();

      // 외곽
      c.globalAlpha = 1;
      c.fillStyle = '#c9a4ff';
      c.beginPath();
      c.arc(sx, this.y, 5, 0, 7);
      c.fill();

      // 중심
      c.fillStyle = '#fff';
      c.beginPath();
      c.arc(sx, this.y, 2.2, 0, 7);
      c.fill();

      c.restore();
    },
  };
}