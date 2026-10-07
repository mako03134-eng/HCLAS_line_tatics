export const WALLET = { // 지갑 레벨: 최대치 / 초당 수입
  levels: [ {max:500,rate:8},{max:800,rate:12},{max:1200,rate:16},{max:1800,rate:22},{max:2600,rate:30},{max:4000,rate:40} ],
  costs: [60, 150, 300, 600, 1200], // 강화 비용
};
export const CANNON = { chargeTime: 45, atk: 300 };
export const TOWER = {
  range: 300, atk: 45, interval: 2.5,
  height: 143, eyeH: .72,
  img: 'player_tower.png', imgFire: 'player_tower_atk.png',
  pixel: false,
};
