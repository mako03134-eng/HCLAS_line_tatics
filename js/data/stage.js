export const STAGES = [
    { name:'1레벨', baseHp:2500, playerBaseHp:2000, startMoney:60, spawns:[
        { t:3, type:'snache', n:1 }, { t:14, type:'snache', n:1 },
        { t:26, type:'snache', n:2, gap:2 }, { t:40, type:'snache', n:3, gap:1.5 },
        { t:60, type:'pigge', n:1 }, { t:75, type:'snache', n:3, gap:1.5 },
        { t:95, type:'pigge', n:1 }, { t:120, type:'pigge', n:2, gap:4 },
        { t:150, type:'hippo', n:1 }, { t:165, type:'snache', n:3, gap:2 },
        { t:190, type:'pigge', n:2, gap:3 },
    ]},
    { name:'2레벨', baseHp:4000, playerBaseHp:2500, startMoney:100, spawns:[
        { t:2, type:'snache', n:2, gap:1 }, { t:15, type:'pigge', n:1 },
        { t:30, type:'snache', n:4, gap:1.2 }, { t:45, type:'hippo', n:1 },
        { t:70, type:'pigge', n:2, gap:3 }, { t:90, type:'snache', n:5, gap:1 },
        { t:110, type:'hippo', n:1 }, { t:118, type:'pigge', n:2, gap:2 },
        { t:150, type:'hippo', n:2, gap:8 }, { t:160, type:'snache', n:6, gap:1 },
    ]},
];