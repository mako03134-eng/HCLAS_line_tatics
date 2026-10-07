#예준이대전쟁

캐릭터 추가/수정 — js/data/characters.js
{ id:'basic', img:'basic.png', pixel:true, icon:'🐱', name:'기본 고양이',  cost:50, cd:2, hp:120, atk:15, range:35, windup:.35, backswing:.65,  speed:60, kb:3, size:1.0, color:'#f5f2ea', desc:'설명' },
필드	바뀌는 것	단위/기준
id	내부 식별자·쿨다운 키	중복 불가
img	assets/cats/의 파일명	없으면 임시 드로잉으로 표시
pixel	true면 픽셀아트 크리스프 렌더링	정수배 스케일+보간 off
icon	이미지 없을 때 버튼 이모지	폴백용
name	버튼·툴팁 이름	
cost	출격 비용	원
cd	재출격 대기시간	초
hp	체력	
atk	공격력	타격당
range	사거리	월드좌표 (근접 25~35, 원거리 120+)
windup	공격 전딜(모션 준비)	초 — 작을수록 즉발
backswing	공격 후딜(경직)	초 — 공격 속도 = windup+backswing
speed	이동 속도	월드좌표/초 (기본 60, 닌자 110)
kb	넉백 횟수	HP÷kb 피해마다 뒤로 밀림 — 클수록 잘 밀림
size	화면 크기	1.0 = 키 48px
color	사망 파티클 색	hex
aoe	광역 공격 반경	없으면 단일 타격, 있으면 투사체+범위폭발
desc	버튼 툴팁 설명	
추가: 한 줄 추가 + (선택)assets/cats/에 이미지 → F5
제거: 한 줄 삭제 → 버튼·단축키 자동 재정렬
버튼 순서 = 배열 순서. 단축키 = 배열 순서대로 1~9
9마리 초과 시 input.js의 Digit 처리 확장 필요 (지금 1~9)
적 추가/수정 — js/data/enemies.js
snache: { id:'snache', img:'snache.png', pixel:true, name:'스네코',  hp:90, atk:12, range:25, windup:.35, backswing:.65, speed:45, kb:2,  reward:20, size:1.0, color:'#c9703f' },
고양이와 동일 필드 + reward (처치 시 얻는 자금, 원).키 이름(좌측)이 stage.js의 type:에서 쓰는 이름이므로 바꾸면 스테이지도 같이 수정.

스테이지 — js/data/stage.js
{ name:'제1관문 · 초원', baseHp:2500, playerBaseHp:2000, startMoney:60,  spawns:[ { t:3, type:'snache', n:1 }, ... ] }
필드	바뀌는 것
name	타이틀·결과 화면의 관문 이름
baseHp	적 성 체력
playerBaseHp	아군 기지(캐릭터) 체력
startMoney	시작 자금
spawns[].t	등장 시각(초, 배틀 시작부터)
spawns[].type	enemies.js의 키
spawns[].n	동시 등장 수
spawns[].gap	n마리 간격(초)
클리어 별표(★)는 localStorage 저장 — 스테이지 추가해도 자동 누적
tower:{...} 넣으면 그 스테이지만 타워 수치 덮어쓰기 가능
지갑·대포·타워 — js/data/economy.js
WALLET
levels: [ {max:500,rate:8}, ... ],   // 지갑 레벨별 최대치/초당 수입costs: [60, 150, 300, 600, 1200],    // 각 레벨→다음 레벨 강화 비용
레벨 추가: levels/costs에 항목 밀어넣기 (자동 6레벨→7레벨)
CANNON
CANNON = { chargeTime: 45, atk: 300 };
필드	바뀌는 것
chargeTime	대포 충전 시간(초)
atk	대포 데미지 (전 적 타격+강제 넉백)
TOWER (아군 기지 = 레이저 눈 캐릭터)
TOWER = {  range: 300, atk: 45, interval: 2.5,   // 사거리/데미지/발사 주기  height: 143, eyeH: .72,               // 화면 키/눈 높이 비율  img: 'player_tower.png', imgFire: 'player_tower_atk.png',  pixel: false,};
필드	바뀌는 것
range	레이저 사거리 (월드좌표)
atk	레이저 데미지
interval	발사 주기(초)
height	캐릭터 화면 크기(px). 110→143 = +30%
eyeH	레이저·대포 발사점 높이. 발바닥 기준 비율(0~1). 레이저가 눈보다 낮게 나오면 올리고, 높게 나오면 내림
img/imgFire	평시/발사 시 이미지 (assets/towers/)
pixel	픽셀아트 여부
레이저와 냥코 대포는 같은 눈 위치 공식(height × eyeH)을 쓰므로 height를 바꾸면 둘 다 자동 동기화.

이미지 규격 (전 캐릭터 공통)
규칙	설명
방향	모두 오른쪽을 보게 그릴 것 (아군은 코드가 자동 좌우반전)
앵커	발바닥 = 이미지 하단 중앙
포맷	투명 배경 PNG (배경 지운 그림)
크기	자유 — 화면 크기는 size(유닛)/height(타워)로 자동 정규화. 픽셀아트는 세로 16/24px 권장
캐시	이미지 교체했는데 안 바뀌면 → 주소에 ?v=숫자 붙여 접속
매핑: img: 'xxx.png' → assets/{cats|enemies|towers}/xxx.png

🔧 로직(연출·판정)을 바꾸고 싶을 때
바꾸고 싶은 것	파일
레이저 색·굵기·지속시간	effects.js의 addLaser (lineWidth 20/9/3.2, life .28)
대포 빔 굵기·연출	commands.js의 fireCannon (lineWidth 34/16/5.5, life .9)
걷기 바운스·넉백 회전 등 모션	sprites.js의 drawFighter 상단 변환들
넉백 거리·시간	entities.js의 update() 내 kb 분기 (150, .55)
배경(하늘·언덕·잔디)	render.js의 drawBackground
적 성 모양	render.js의 drawEnemyBase
HP바 스타일	canvas.js의 drawHpBar
단축키	input.js
버튼·게이지 스타일	css/style.css
