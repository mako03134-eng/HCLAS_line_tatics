// 화면·월드 상수 + 공용 유틸
export const W = 960, H = 400;             // 캔버스 해상도
export const FIELD_W = 1000;               // 월드 좌표 폭
export const WORLD_SCALE = W / FIELD_W;    // 월드→화면 배율
export const HORIZON = 235;                // 수평선 y
export const ROW_TOP = 268, ROW_BOT = 372; // 유닛이 서는 행(y) 범위
export const PLAYER_BASE_X = 940, ENEMY_BASE_X = 60;

export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));