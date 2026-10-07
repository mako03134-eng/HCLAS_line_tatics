// 게임 상태 — 모든 가변 데이터의 단일 저장소
// 규칙: game을 통째로 재할당하지 말 것(모듈 간 참조가 끊김). 필드 수정만.
export const game = {
  scene: 'title', paused: false, stageIdx: 0,
  t: 0, speed: 1,
  money: 0, walletLv: 0,
  units: [], enemies: [], projectiles: [], fx: [], spawnQueue: [],
  playerBase: null, enemyBase: null,
  raged: false, hippoWarned: false, resultPending: null,
  cannonCharge: 0, cd: {}, kills: 0, spawnedCount: 0, shake: 0,
};
