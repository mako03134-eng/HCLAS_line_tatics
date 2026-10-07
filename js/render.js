// 렌더 오케스트레이션: 배경 → 성 → 유닛(y정렬) → 이펙트
import { ctx, rr, drawHpBar } from './canvas.js';
import { W, H, HORIZON, WORLD_SCALE } from './config.js';
import { game } from './state.js';
import { drawFighter } from './sprites.js';
import { getImage } from './assets.js';

const decor = {
  clouds: Array.from({ length: 4 }, () => ({ x: Math.random() * W, y: 25 + Math.random() * 90, s: .7 + Math.random() * .7 })),
  tufts: Array.from({ length: 30 }, () => ({ x: Math.random() * W, y: HORIZON + 12 + Math.random() * 145 })),
  flowers: Array.from({ length: 9 }, () => ({ x: Math.random() * W, y: HORIZON + 18 + Math.random() * 140 })),
};

function drawBackground() {
  ctx.fillStyle = '#cfe9f5'; ctx.fillRect(0, 0, W, HORIZON); // 하늘
  ctx.fillStyle = 'rgba(255,255,255,.9)';
  for (const cl of decor.clouds) { // 구름
    const cx = ((cl.x + game.t * 5) % (W + 180)) - 90;
    ctx.beginPath();
    ctx.arc(cx, cl.y, 14 * cl.s, 0, 7); ctx.arc(cx + 16 * cl.s, cl.y - 6 * cl.s, 11 * cl.s, 0, 7);
    ctx.arc(cx + 30 * cl.s, cl.y, 12 * cl.s, 0, 7); ctx.fill();
  }
  ctx.fillStyle = '#b7dba5'; // 원경 언덕
  for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.arc(90 + i * 220, HORIZON + 30, 62, 0, 7); ctx.fill(); }
  ctx.fillStyle = '#a3d193';
  for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.arc(40 + i * 180, HORIZON + 22, 36, 0, 7); ctx.fill(); }
  ctx.fillStyle = '#8cc45e'; ctx.fillRect(0, HORIZON, W, H - HORIZON); // 지면
  ctx.fillStyle = '#7ab34e'; ctx.fillRect(0, HORIZON, W, 5);
  ctx.strokeStyle = '#6ea844'; ctx.lineWidth = 2; ctx.beginPath(); // 잔디
  for (const tf of decor.tufts) {
    ctx.moveTo(tf.x, tf.y); ctx.lineTo(tf.x - 3, tf.y - 6);
    ctx.moveTo(tf.x, tf.y); ctx.lineTo(tf.x, tf.y - 8);
    ctx.moveTo(tf.x, tf.y); ctx.lineTo(tf.x + 3, tf.y - 6);
  }
  ctx.stroke();
  for (const fl of decor.flowers) { // 꽃
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(fl.x, fl.y, 3, 0, 7); ctx.fill();
    ctx.fillStyle = '#ffd54a'; ctx.beginPath(); ctx.arc(fl.x, fl.y, 1.3, 0, 7); ctx.fill();
  }
}

// ── 아군 기지 = 캐릭터 이미지 (기존 성 드로잉은 완전 삭제됨) ──
function drawPlayerTower(b) {
  const h = b.tower ? (b.tower.height || 110) : 110;
  const sx = b.x * WORLD_SCALE;
  // 발사 중이면 레이저 눈 이미지로 0.28초간 스왑
  const fireImg = b.fireT > 0 ? getImage('tower/player_fire') : null;
  const img = fireImg || getImage('tower/player');

  ctx.save();
  ctx.translate(sx + (b.hitT > 0 ? (Math.random() - .5) * 5 : 0), b.y);
  ctx.fillStyle = 'rgba(0,0,0,.15)'; // 그림자
  ctx.beginPath(); ctx.ellipse(0, 2, h * .26, 7, 0, 0, 7); ctx.fill();

  if (img) {
    const iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
    const s = h / ih; // 높이 정규화 — 원본 해상도 무관
    if (b.tower && b.tower.pixel) ctx.imageSmoothingEnabled = false;
    ctx.scale(-s, s);                  // 오른쪽 기준 이미지 → 반전해 왼쪽(적)을 보게 함
    ctx.drawImage(img, -iw / 2, -ih);  // 발 = 이미지 하단 중앙
  } else {
    // 이미지 아직 없을 때 임시 받침대 — assets/towers/player.png 넣으면 사라짐
    ctx.fillStyle = '#5b5f70'; rr(-40, -16, 80, 16, 6); ctx.fill();
    ctx.strokeStyle = '#2e2a3e'; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = '#ffd54a'; ctx.font = 'bold 12px "Malgun Gothic",sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('타워 이미지 없음', 0, -26);
  }
  ctx.restore();

  drawHpBar(sx, b.y - h - 14, b.hp / b.maxHp, 96, b.side);
  ctx.fillStyle = '#2e2a3e'; ctx.font = 'bold 11px "Malgun Gothic",sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('우리 기지', sx, b.y - h - 20);
}

// ── 적 성: 기존 캐릭터 성 그대로 ──
function drawEnemyBase(b) {
  const x = b.x * WORLD_SCALE, y = b.y, flash = b.hitT > 0;
  ctx.save();
  ctx.translate(x + (flash ? (Math.random() - .5) * 5 : 0), y);
  if (game.raged) { // 분노 오라
    ctx.globalAlpha = .22 + Math.sin(game.t * 6) * .08; ctx.fillStyle = '#ff4d4d';
    ctx.beginPath(); ctx.ellipse(0, -60, 62, 62, 0, 0, 7); ctx.fill(); ctx.globalAlpha = 1;
  }
  ctx.fillStyle = 'rgba(0,0,0,.15)';
  ctx.beginPath(); ctx.ellipse(0, 4, 46, 8, 0, 0, 7); ctx.fill();
  const wall = flash ? '#ffffff' : '#9a93a8';
  const roof = '#6e5a8e';
  const line = '#2e2a3e';
  ctx.fillStyle = wall; rr(-42, -108, 84, 108, 7); ctx.fill(); // 성벽
  ctx.strokeStyle = line; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = roof; // 톱니
  for (let i = -2; i <= 2; i++) { rr(i * 17 - 6, -121, 12, 15, 3); ctx.fill(); ctx.lineWidth = 2; ctx.stroke(); }
  rr(-45, -110, 90, 11, 5); ctx.fill(); ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = '#4a3654'; // 문
  ctx.beginPath(); ctx.moveTo(-13, 0); ctx.lineTo(-13, -30);
  ctx.arc(0, -30, 13, Math.PI, 0); ctx.lineTo(13, 0); ctx.closePath();
  ctx.fill(); ctx.stroke();
  ctx.fillStyle = flash ? '#fff' : '#333340'; // 눈(창)
  for (const ex of [-24, 24]) { rr(ex - 5, -86, 10, 15, 4); ctx.fill(); }
  ctx.strokeStyle = '#333340'; ctx.lineWidth = 3; ctx.beginPath(); // 화난 눈썹
  ctx.moveTo(-30, -92); ctx.lineTo(-18, -86); ctx.moveTo(30, -92); ctx.lineTo(18, -86); ctx.stroke();
  drawHpBar(0, -162, b.hp / b.maxHp, 96, b.side);
  ctx.fillStyle = '#2e2a3e'; ctx.font = 'bold 11px "Malgun Gothic",sans-serif';
  ctx.textAlign = 'center'; ctx.fillText('적 성', 0, -168);
  ctx.restore();
}

function drawBase(b) {
  if (b.side === 'player') drawPlayerTower(b);
  else drawEnemyBase(b);
}

export function render() {
  ctx.save();
  if (game.shake > 0 && !game.paused)
    ctx.translate((Math.random() - .5) * game.shake * 12, (Math.random() - .5) * game.shake * 8);
  drawBackground();
  drawBase(game.enemyBase);
  drawBase(game.playerBase);
  const fighters = [...game.units, ...game.enemies].sort((a, b) => a.y - b.y); // y정렬(깊이)
  for (const f of fighters) drawFighter(f);
  for (const p of game.projectiles) p.draw(ctx);
  for (const fx of game.fx) fx.draw(ctx);
  ctx.restore();
    }
