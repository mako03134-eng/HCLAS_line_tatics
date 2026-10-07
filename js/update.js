// 프레임 시뮬레이션: 경제 → 스폰 → 엔티티 → 정리 → 승패 연출
import { game } from './state.js';
import { WALLET, CANNON } from './data/index.js';
import { spawnEnemy, rageSpawn } from './commands.js';
import { showResult } from './scenes.js';

export function updateBattle(dt) {
    game.t += dt;

    if (game.resultPending) { // 승패 확정 → 연출만 흐름
        game.resultPending.t -= dt;

        for (const f of game.fx) {
            f.t += dt;
        }

        game.fx = game.fx.filter(f => f.t < f.life);
        game.shake = Math.max(0, game.shake - dt * 2.5);

        if (game.resultPending.t <= 0) {
            showResult(game.resultPending.win);
        }

        return;
    }

    // 경제
    const wl = WALLET.levels[game.walletLv];
    game.money = Math.min(wl.max, game.money + wl.rate * dt);
    game.cannonCharge = Math.min(
        CANNON.chargeTime,
        game.cannonCharge + dt
    );

    // 스폰
    while (
        game.spawnQueue.length &&
        game.spawnQueue[0].t <= game.t
    ) {
        spawnEnemy(game.spawnQueue.shift().type);
    }

    if (!game.raged && game.enemyBase.hp < game.enemyBase.maxHp * 0.5) {
        game.raged = true;
        rageSpawn();
    }

    // 엔티티
    game.playerBase.update(dt);
    game.enemyBase.update(dt);

    for (const u of game.units) {
        if (u.alive) {
            u.update(dt);
        }
    }

    for (const e of game.enemies) {
        if (e.alive) {
            e.update(dt);
        }
    }

    for (const p of game.projectiles) {
        if (!p.dead) {
            p.update(dt);
        }
    }

    for (const f of game.fx) {
        f.t += dt;
    }

    // 정리
    game.units = game.units.filter(u => u.alive);
    game.enemies = game.enemies.filter(e => e.alive);
    game.projectiles = game.projectiles.filter(p => !p.dead);
    game.fx = game.fx.filter(f => f.t < f.life);
    game.shake = Math.max(0, game.shake - dt * 2.5);
}
