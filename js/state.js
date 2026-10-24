export const game = {
  scene: 'title', paused: false, stageIdx: 0,
  t: 0, speed: 1,
  money: 0, walletLv: 0,
  units: [], enemies: [], projectiles: [], fx: [], spawnQueue: [],
  playerBase: null, enemyBase: null,
  raged: false, hippoWarned: false, resultPending: null,
  cannonCharge: 0, cd: {}, kills: 0, spawnedCount: 0, shake: 0,
};
