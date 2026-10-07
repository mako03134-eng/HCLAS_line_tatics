// 캐릭터 렌더링 — def.img가 있고 로드됐으면 스프라이트, 아니면 캔버스 폴백
// 외부 인터페이스는 drawFighter(f) 하나 (아트 교체 시 이 파일만 손대면 됨)

import { ctx, rr, drawHpBar } from './canvas.js';
import { WORLD_SCALE } from './config.js';
import { game } from './state.js';
import { getImage, getWhiteImage } from './assets.js';

const IMG_H = 48; // 스프라이트 기준 키(px) — 실제 화면 키 = IMG_H × def.size

export function drawFighter(f) {
    const size = f.def.size || 1;
    const sx = f.x * WORLD_SCALE;
    const sy = f.y;
    const key = (f.side === 'player' ? 'cat/' : 'enemy/') + f.def.id;

    let sprite = f.def.img ? getImage(key) : null;

    if (sprite && f.hitT > 0) {
        sprite = getWhiteImage(key) || sprite; // 피격 → 흰 실루엣
    }

    ctx.save();
    ctx.translate(sx, sy);

    ctx.fillStyle = 'rgba(0,0,0,.12)'; // 그림자(아트와 무관, 항상 그림)
    ctx.beginPath();
    ctx.ellipse(0, 3, 13 * size, 4, 0, 0, 7);
    ctx.fill();

    if (f.spawnT > 0) {
        const p = 1 - f.spawnT / 0.35;
        ctx.scale(0.35 + 0.65 * p, 0.35 + 0.65 * p);
    } // 등장 팝

    if (f.moving) {
        ctx.translate(
            0,
            -Math.abs(Math.sin(f.walkPhase)) * 2.5 * size
        );
    } // 걷기 바운스

    if (f.state === 'windup') {
        ctx.translate(-3 * size * f.dir, 0);
    } // 움찔(전딜)

    if (f.attackT > 0) {
        ctx.translate(6 * size * f.dir, 0);
    } // 런지(타격)

    if (f.state === 'kb') {
        ctx.rotate(-f.dir * (0.55 - f.kbT) * 10);
    } // 넉백 구르기

    if (sprite) {
        const sh = sprite.naturalHeight || sprite.height;
        const sw = sprite.naturalWidth || sprite.width;

        let s = (IMG_H * size) / sh;

        if (f.def.pixel) {
            // 픽셀아트 플래그
            s = Math.max(1, Math.round(s)); // 정수배 스냅 (3.4배 → 3배) : 픽셀 뭉개짐 방지
            ctx.imageSmoothingEnabled = false; // 보간 끄기 = 칼같은 픽셀
        }

        ctx.scale(
            (f.side === 'player' ? -1 : 1) * s,
            s
        );

        ctx.drawImage(
            sprite,
            -sw / 2,
            -sh
        ); // 발 = 이미지 하단 중앙
    } else {
        const C = c => (f.hitT > 0 ? '#ffffff' : c);

        ctx.scale(
            WORLD_SCALE * size * (f.side === 'player' ? -1 : 1),
            WORLD_SCALE * size
        );

        if (f.side === 'player') {
            drawCat(f, C);
        } else {
            drawEnemy(f, C);
        }
    }

    ctx.restore();

    if (f.hp < f.maxHp) {
        drawHpBar(
            sx,
            sy - (sprite ? (IMG_H + 8) : 46) * size,
            f.hp / f.maxHp,
            30 * size,
            f.side
        );
    }
}

// ---------- 이하: 이미지 없는 캐릭터용 임시 드로잉 (폴백) ----------

function drawCat(f, C) {
    const d = f.def;

    ctx.strokeStyle = C(d.color || '#f5f2ea');
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(-7, -11);
    ctx.quadraticCurveTo(-14, -14, -12, -22);
    ctx.stroke();

    ctx.fillStyle = C(d.color || '#f5f2ea');

    ctx.beginPath();
    ctx.ellipse(0, -11, 9.5, 8, 0, 0, 7);
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(6, -24, 8.5, 7.5, 0, 0, 7);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(1.5, -28);
    ctx.lineTo(4, -37);
    ctx.lineTo(8, -29);

    ctx.moveTo(8, -29);
    ctx.lineTo(12, -37);
    ctx.lineTo(14.5, -27.5);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#2a2a33';

    ctx.beginPath();
    ctx.arc(8.5, -25, 1.4, 0, 7);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(12.5, -25, 1.4, 0, 7);
    ctx.fill();

    ctx.fillStyle = C('#e8909c');
    ctx.fillRect(12, -22.6, 2.2, 1.6);

    switch (d.id) {
        case 'tank':
            ctx.fillStyle = C('#5d7285');
            rr(11, -22, 8, 17, 3);
            ctx.fill();

            ctx.fillStyle = C('#8ea2b5');
            rr(10.5, -31, 12, 6, 3);
            ctx.fill();
            break;

        case 'axe': {
            ctx.save();
            ctx.translate(11, -16);

            if (f.attackT > 0) {
                ctx.rotate(-1.4 + (0.18 - f.attackT) * 9);
            }

            ctx.rotate(0.5);

            ctx.strokeStyle = C('#8a5a33');
            ctx.lineWidth = 2.5;

            ctx.beginPath();
            ctx.moveTo(0, 3);
            ctx.lineTo(0, -13);
            ctx.stroke();

            ctx.fillStyle = C('#d9dfe6');

            ctx.beginPath();
            ctx.moveTo(0, -13);
            ctx.lineTo(8, -15);
            ctx.lineTo(8, -6);
            ctx.lineTo(0, -7);
            ctx.closePath();
            ctx.fill();

            ctx.restore();
            break;
        }

        case 'ninja': {
            ctx.fillStyle = C('#d84343');
            ctx.fillRect(0, -29, 11.5, 3.5);

            const wv = Math.sin(game.t * 10) * 2;

            ctx.strokeStyle = C('#d84343');
            ctx.lineWidth = 2;

            ctx.beginPath();
            ctx.moveTo(0, -27.5);
            ctx.quadraticCurveTo(-5, -26 + wv, -9, -31 + wv);
            ctx.stroke();

            break;
        }

        case 'wizard': {
            ctx.fillStyle = C('#7c5fb0');

            ctx.beginPath();
            ctx.moveTo(1, -29);
            ctx.lineTo(10, -45);
            ctx.lineTo(17, -29);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = C('#9d7fd4');
            rr(0, -33.5, 17.5, 4, 2);
            ctx.fill();

            ctx.strokeStyle = C('#8a5a33');
            ctx.lineWidth = 2;

            ctx.beginPath();
            ctx.moveTo(12, -5);
            ctx.lineTo(16, -22);
            ctx.stroke();

            ctx.fillStyle = C('#d4b8ff');

            ctx.beginPath();
            ctx.arc(16.8, -25, 3.6, 0, 7);
            ctx.fill();

            break;
        }

        // default: 장식 없는 기본 고양이 — 새 캐릭터 임시 모습
    }
}

function drawEnemy(f, C) {
    const d = f.def;

    if (d.id === 'snache') {
        ctx.fillStyle = C(d.color || '#c9703f');

        ctx.beginPath();
        ctx.ellipse(0, -10, 10, 9, 0, 0, 7);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(-6, -16);
        ctx.lineTo(-4, -24);
        ctx.lineTo(-1, -17);

        ctx.moveTo(1, -17);
        ctx.lineTo(4, -25);
        ctx.lineTo(7, -16);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#fff';

        ctx.beginPath();
        ctx.arc(4, -12, 3, 0, 7);
        ctx.fill();

        ctx.fillStyle = '#2a2a33';

        ctx.beginPath();
        ctx.arc(5, -12, 1.5, 0, 7);
        ctx.fill();

        ctx.strokeStyle = '#2a2a33';
        ctx.lineWidth = 1.8;

        ctx.beginPath();
        ctx.moveTo(1, -16.5);
        ctx.lineTo(6, -14.5);
        ctx.stroke();

        ctx.fillStyle = '#fff';

        ctx.beginPath();
        ctx.moveTo(7, -8);
        ctx.lineTo(9, -8);
        ctx.lineTo(8, -5);
        ctx.closePath();
        ctx.fill();

    } else if (d.id === 'pigge') {
        ctx.fillStyle = C(d.color || '#f2a7bd');

        ctx.beginPath();
        ctx.ellipse(0, -14, 13, 11, 0, 0, 7);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(-7, -21);
        ctx.lineTo(-5, -28);
        ctx.lineTo(-1, -23);

        ctx.moveTo(2, -23);
        ctx.lineTo(6, -28);
        ctx.lineTo(9, -21);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = C(d.color || '#f2a7bd');
        ctx.lineWidth = 2.5;

        ctx.beginPath();
        ctx.arc(-15, -18, 3.5, -1, 3);
        ctx.stroke();

        ctx.fillStyle = C('#e58aa5');

        ctx.beginPath();
        ctx.ellipse(8, -15, 5.5, 4.5, 0, 0, 7);
        ctx.fill();

        ctx.fillStyle = '#b55f7d';

        ctx.beginPath();
        ctx.arc(6.5, -15, 1, 0, 7);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(9.5, -15, 1, 0, 7);
        ctx.fill();

        ctx.fillStyle = '#2a2a33';

        ctx.beginPath();
        ctx.arc(1, -19, 1.6, 0, 7);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(5.5, -20, 1.6, 0, 7);
        ctx.fill();

        ctx.fillStyle = C('#e58aa5');

        ctx.beginPath();
        ctx.ellipse(-6, -2, 3, 3.5, 0, 0, 7);
        ctx.fill();

        ctx.beginPath();
        ctx.ellipse(6, -2, 3, 3.5, 0, 0, 7);
        ctx.fill();

    } else if (d.id === 'hippo') {
        ctx.fillStyle = C(d.color || '#8fb3cf');

        ctx.beginPath();
        ctx.ellipse(0, -18, 21, 17, 0, 0, 7);
        ctx.fill();

        ctx.fillStyle = C('#a9c7dc');

        ctx.beginPath();
        ctx.ellipse(10, -12, 13, 9, 0, 0, 7);
        ctx.fill();

        ctx.fillStyle = '#5b7e99';

        ctx.beginPath();
        ctx.ellipse(6, -14, 2, 3, 0, 0, 7);
        ctx.fill();

        ctx.beginPath();
        ctx.ellipse(13, -14, 2, 3, 0, 0, 7);
        ctx.fill();

        ctx.fillStyle = '#fff';

        ctx.beginPath();
        ctx.arc(-4, -30, 3.5, 0, 7);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(4, -31, 3.5, 0, 7);
        ctx.fill();

        ctx.fillStyle = '#2a2a33';

        ctx.beginPath();
        ctx.arc(-3, -30, 1.7, 0, 7);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(5, -31, 1.7, 0, 7);
        ctx.fill();

        ctx.strokeStyle = '#2a2a33';
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(-8, -35);
        ctx.lineTo(-1, -33);
        ctx.moveTo(1, -34);
        ctx.lineTo(8, -35);
        ctx.stroke();

        ctx.fillStyle = '#fff';
        ctx.fillRect(5, -5, 3, 5);
        ctx.fillRect(10, -4, 3, 4);

        ctx.fillStyle = C(d.color || '#8fb3cf');

        ctx.beginPath();
        ctx.arc(-14, -32, 3, 0, 7);
        ctx.fill();

    } else {
        // 등록만 하고 이미지·전용 드로잉이 없는 적 → 화난 눈 기본 몸통
        ctx.fillStyle = C(d.color || '#b0855f');

        ctx.beginPath();
        ctx.ellipse(0, -11, 11, 9, 0, 0, 7);
        ctx.fill();

        ctx.fillStyle = '#fff';

        ctx.beginPath();
        ctx.arc(3, -13, 3, 0, 7);
        ctx.fill();

        ctx.fillStyle = '#2a2a33';

        ctx.beginPath();
        ctx.arc(4, -13, 1.5, 0, 7);
        ctx.fill();

        ctx.strokeStyle = '#2a2a33';
        ctx.lineWidth = 1.8;

        ctx.beginPath();
        ctx.moveTo(0, -17);
        ctx.lineTo(5, -15);
        ctx.stroke();
    }
}