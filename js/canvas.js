// 캔버스 컨텍스트 공유 + 그리기 공용 유틸
export const ctx = document.getElementById('field').getContext('2d');

export function rr(x, y, w, h, r) { // 둥근 사각형 경로
  r = Math.min(r, w / 2, h / 2);

  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function drawHpBar(cx, cy, ratio, w, side) {
  ctx.fillStyle = 'rgba(20,21,28,.8)';
  rr(cx - w / 2 - 1.5, cy - 1.5, w + 3, 8, 2.5);
  ctx.fill();

  ctx.fillStyle = side === 'player' ? '#5ec951' : '#e8564e';

  if (ratio > 0) {
    rr(cx - w / 2, cy, Math.max(2, w * ratio), 5, 2);
    ctx.fill();
  }
}
