import { WORLD_SCALE } from './config.js';
import { game } from './state.js';

export function addText(x, y, str, color, life = .8, size = 13) {
  game.fx.push({ t: 0, life, draw(c) {
    const p = this.t / this.life;
    c.save(); c.globalAlpha = 1 - p;
    c.font = `bold ${size}px "Malgun Gothic",sans-serif`; c.textAlign = 'center';
    c.lineWidth = 3; c.strokeStyle = 'rgba(0,0,0,.65)';
    c.strokeText(str, x * WORLD_SCALE, y - p * 26);
    c.fillStyle = color; c.fillText(str, x * WORLD_SCALE, y - p * 26);
    c.restore();
  }});
}

export function addSlash(x, y) {
  game.fx.push({ t: 0, life: .18, draw(c) {
    const p = this.t / this.life;
    c.save(); c.globalAlpha = 1 - p;
    c.strokeStyle = '#fff'; c.lineWidth = 3.5; c.lineCap = 'round';
    c.beginPath(); c.arc(x * WORLD_SCALE, y, 13 + p * 12, -.8, 1); c.stroke();
    c.restore();
  }});
}

export function addPoof(x, y, color) {
  for (let i = 0; i < 8; i++) {
    const a = Math.random() * Math.PI * 2, sp = 25 + Math.random() * 55;
    game.fx.push({ t: 0, life: .45 + Math.random() * .2,
      vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * .5 - 45,
      draw(c) {
        const p = this.t / this.life;
        c.globalAlpha = 1 - p; c.fillStyle = color;
        c.beginPath();
        c.arc(x * WORLD_SCALE + this.vx * this.t, y - 12 + this.vy * this.t + 90 * this.t * this.t, 4.5 * (1 - p * .6), 0, 7);
        c.fill(); c.globalAlpha = 1;
      }});
  }
}

export function addExplosion(x, y, r) {
  game.fx.push({ t: 0, life: .35, draw(c) {
    const p = this.t / this.life, sx = x * WORLD_SCALE;
    c.save(); c.globalAlpha = 1 - p;
    c.strokeStyle = '#ffd54a'; c.lineWidth = 5 * (1 - p) + 1;
    c.beginPath(); c.arc(sx, y - 12, r * WORLD_SCALE * (.35 + .65 * p), 0, 7); c.stroke();
    c.fillStyle = 'rgba(255,180,60,.35)'; c.fill();
    c.restore();
  }});
  for (let i = 0; i < 6; i++)
    addPoof(x + (Math.random() - .5) * r, y + (Math.random() - .5) * 20, i % 2 ? '#ffb84a' : '#ffe25b');
}

export function addLaser(x1, y1, x2, y2) {
  game.fx.push({ t: 0, life: .28, draw(c) {
    const p = this.t / this.life, fade = 1 - p;
    const ax = x1 * WORLD_SCALE, bx = x2 * WORLD_SCALE;
    const flick = .7 + Math.random() * .6; 
    c.save();
    c.globalCompositeOperation = 'lighter';
    for (const off of [-5, 5]) { 
      const ay = y1 + off;
      c.globalAlpha = fade * .25; c.strokeStyle = '#ff0000'; c.lineWidth = 20 * flick; 
      c.beginPath(); c.moveTo(ax, ay); c.lineTo(bx, y2); c.stroke();
      c.globalAlpha = fade * .8; c.strokeStyle = '#ff3b3b'; c.lineWidth = 9 * flick;   
      c.beginPath(); c.moveTo(ax, ay); c.lineTo(bx, y2); c.stroke();
      c.globalAlpha = fade; c.strokeStyle = '#ffffff'; c.lineWidth = 3.2 * flick;    
      c.beginPath(); c.moveTo(ax, ay); c.lineTo(bx, y2); c.stroke();
    }
    for (const off of [-5, 5]) {
      const g = c.createRadialGradient(ax, y1 + off, 0, ax, y1 + off, 18);
      g.addColorStop(0, 'rgba(255,255,255,.95)');
      g.addColorStop(.4, 'rgba(255,60,60,.85)');
      g.addColorStop(1, 'rgba(255,0,0,0)');
      c.globalAlpha = fade; c.fillStyle = g;
      c.beginPath(); c.arc(ax, y1 + off, 18, 0, 7); c.fill();
    }
    const g2 = c.createRadialGradient(bx, y2, 0, bx, y2, 26);
    g2.addColorStop(0, 'rgba(255,255,255,1)');
    g2.addColorStop(.45, 'rgba(255,80,60,.9)');
    g2.addColorStop(1, 'rgba(255,0,0,0)');
    c.globalAlpha = fade; c.fillStyle = g2;
    c.beginPath(); c.arc(bx, y2, 26, 0, 7); c.fill();
    c.restore();
  }});
  for (let i = 0; i < 5; i++)
    addPoof(x2 + (Math.random() - .5) * 10, y2 + 14, i % 2 ? '#ff5b5b' : '#ffffff');
       }
