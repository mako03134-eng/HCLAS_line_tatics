// 하단바: 유닛 버튼(명단 기반 자동 생성), 자금/대포 게이지
import { clamp } from './config.js';
import { game } from './state.js';
import { CATS, WALLET, CANNON } from './data/index.js';
import { deployCat, upgradeWallet, fireCannon } from './commands.js';
import { getImage } from './assets.js';

const $ = (id) => document.getElementById(id);
const els = {
    moneyVal: $('moneyVal'),
    moneyMax: $('moneyMax'),
    moneyRate: $('moneyRate'),
    moneyBar: $('moneyBar'),
    walletBtn: $('walletBtn'),
    cannonBtn: $('cannonBtn'),
    cannonBar: $('cannonBar'),
    stageName: $('stageName'),
    speedBtn: $('speedBtn'),
    unitRow: $('unitRow'),
};

const unitBtns = [];

export function initHud() {
    CATS.forEach((cat, i) => {
        const b = document.createElement('button');
        b.className = 'unitBtn';
        b.title = `${cat.name} · ${cat.desc || ''}`;

        const thumb = cat.img && getImage('cat/' + cat.id); // 선로딩 돼 있으면 썸네일
        b.innerHTML = `
      ${thumb ? `<img class="thumb" src="${thumb.src}" alt="">` : `<span class="icon">${cat.icon || '🐱'}</span>`}
      <span class="uname">${cat.name}</span>
      <span class="cost">${cat.cost}</span>
      <div class="cd"></div>
    `;

        b.addEventListener('click', () => deployCat(i));
        els.unitRow.appendChild(b);
        unitBtns.push(b);
    });

    els.walletBtn.addEventListener('click', upgradeWallet);
    els.cannonBtn.addEventListener('click', fireCannon);
}

export function updateHud() {
    const inBattle = game.scene === 'battle' && !game.paused;
    const wl = WALLET.levels[game.walletLv];

    els.moneyVal.textContent = Math.floor(game.money);
    els.moneyMax.textContent = wl.max;
    els.moneyRate.textContent = `+${wl.rate}/초`;
    els.moneyBar.style.width = clamp((game.money / wl.max) * 100, 0, 100) + '%';

    if (game.walletLv >= WALLET.costs.length) {
        els.walletBtn.textContent = `지갑 Lv.${game.walletLv + 1} (최대)`;
        els.walletBtn.disabled = true;
    } else {
        const cost = WALLET.costs[game.walletLv];
        els.walletBtn.textContent = `지갑 강화 → Lv.${game.walletLv + 2} · ${cost}원`;
        els.walletBtn.disabled = !inBattle || game.money < cost;
    }

    unitBtns.forEach((b, i) => {
        const cat = CATS[i];
        const remain = Math.max(0, (game.cd[cat.id] || 0) - game.t);

        b.querySelector('.cd').style.height =
            remain > 0 ? (remain / cat.cd) * 100 + '%' : '0%';
        b.classList.toggle(
            'disabled',
            !inBattle ||
                game.money < cat.cost ||
                remain > 0 ||
                !!game.resultPending
        );
    });

    const ratio = game.cannonCharge / CANNON.chargeTime;
    els.cannonBar.style.width = ratio * 100 + '%';
    els.cannonBtn.classList.toggle('ready', inBattle && ratio >= 1);
}

export function setStageName(text) {
    els.stageName.textContent = text;
}

export function updateSpeedBtn() {
    els.speedBtn.textContent = 'x' + game.speed;
}
