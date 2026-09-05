'use strict';
const canvas=document.getElementById('game'), ctx=canvas.getContext('2d');
const W=1280,H=720,TAU=Math.PI*2;
ctx.imageSmoothingEnabled=true;

const ASSET_NAMES=[
'hero_idle','hero_run','hero_attack','hero_cast','hero_hurt','hero_win',
'slime','bat','skeleton','skeleton_shield','mushroom','ghost','bee','boar','boss_mushroom','boss_tree',
'fireball_fx','ice_fx','lightning_fx','leaf_fx','blade_fx',
'skill_fire','skill_meteor','skill_ice','skill_lightning','skill_heal','skill_shield','skill_leaf','skill_blades','skill_laser','skill_poison','skill_tornado','skill_spirit',
'item_coin','item_gem','item_chest','item_potion','item_magnet','item_boots','item_crown','item_armor','item_revive','item_wand'
];
const A={};
const ATLAS_RECTS={"bat":[3,3,145,94],"bee":[151,3,139,122],"blade_fx":[293,3,170,136],"boar":[466,3,225,173],"boss_mushroom":[694,3,389,297],"boss_tree":[1086,3,309,277],"fireball_fx":[3,303,169,147],"ghost":[175,303,127,120],"hero_attack":[305,303,166,162],"hero_cast":[474,303,184,183],"hero_hurt":[661,303,166,162],"hero_idle":[830,303,127,183],"hero_run":[960,303,150,169],"hero_win":[1113,303,148,176],"ice_fx":[1264,303,192,157],"item_armor":[3,489,181,166],"item_bomb":[187,489,168,181],"item_boots":[358,489,171,142],"item_chest":[532,489,177,181],"item_coin":[712,489,169,181],"item_crown":[884,489,177,153],"item_gem":[1064,489,158,181],"item_key":[1225,489,151,181],"item_magnet":[3,673,173,181],"item_potion":[179,673,154,153],"item_revive":[336,673,181,164],"item_wand":[520,673,181,154],"leaf_fx":[704,673,179,149],"lightning_fx":[886,673,186,174],"mushroom":[1075,673,138,117],"skeleton":[1216,673,125,134],"skeleton_shield":[1344,673,150,156],"skill_blades":[3,857,174,181],"skill_fire":[180,857,165,159],"skill_heal":[348,857,179,143],"skill_ice":[530,857,159,151],"skill_laser":[692,857,181,150],"skill_leaf":[876,857,165,181],"skill_lightning":[1044,857,173,161],"skill_meteor":[1220,857,176,180],"skill_poison":[3,1041,174,150],"skill_shield":[180,1041,178,154],"skill_spirit":[361,1041,169,149],"skill_tornado":[533,1041,174,181],"slime":[710,1041,129,94]};
let loaded=0;
const atlasImage=new Image();atlasImage.src='assets/atlas.webp';atlasImage.onload=()=>{for(const n of ASSET_NAMES){const r=ATLAS_RECTS[n];if(r)A[n]={atlas:atlasImage,rect:r,complete:true,naturalWidth:r[2],naturalHeight:r[3]};}loaded=ASSET_NAMES.length;};atlasImage.onerror=()=>{loaded=ASSET_NAMES.length;};

const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const rand=(a,b)=>a+Math.random()*(b-a);
const pick=a=>a[(Math.random()*a.length)|0];
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const norm=(x,y)=>{let d=Math.hypot(x,y)||1;return [x/d,y/d]};
const lerp=(a,b,t)=>a+(b-a)*t;
const circleHit=(a,b)=>{const r=(a.r||0)+(b.r||0);return (a.x-b.x)**2+(a.y-b.y)**2<=r*r};
const fmt=n=>Math.floor(n).toLocaleString('zh-CN');

const SKILLS={
 fire:{name:'烈焰火球',icon:'skill_fire',desc:'追踪敌人并爆炸',max:5},
 ice:{name:'冰霜尖刺',icon:'skill_ice',desc:'环形冰刺，附带减速',max:5},
 lightning:{name:'连锁闪电',icon:'skill_lightning',desc:'在敌群中连续跃迁',max:5},
 leaf:{name:'回旋树叶',icon:'skill_leaf',desc:'高速穿透敌人',max:5},
 blades:{name:'回旋利刃',icon:'skill_blades',desc:'环绕自身持续切割',max:5},
 meteor:{name:'天降陨石',icon:'skill_meteor',desc:'锁定敌群造成大范围伤害',max:5},
 heal:{name:'治愈精灵',icon:'skill_heal',desc:'周期恢复生命',max:5},
 shield:{name:'守护泡泡',icon:'skill_shield',desc:'获得可再生护盾',max:5},
 laser:{name:'星辉激光',icon:'skill_laser',desc:'贯穿一条直线的敌人',max:5},
 poison:{name:'毒雾沼泽',icon:'skill_poison',desc:'持续腐蚀范围敌人',max:5},
 tornado:{name:'旋风术',icon:'skill_tornado',desc:'移动风暴持续打击',max:5},
 spirit:{name:'幽灵伙伴',icon:'skill_spirit',desc:'召唤伙伴自动射击',max:5}
};

const ENEMIES={
 slime:{img:'slime',hp:34,speed:52,damage:8,r:22,xp:8,scale:0.64},
 bat:{img:'bat',hp:28,speed:95,damage:7,r:20,xp:9,scale:0.58},
 skeleton:{img:'skeleton',hp:62,speed:47,damage:11,r:23,xp:12,scale:0.56},
 skeleton_shield:{img:'skeleton_shield',hp:105,speed:38,damage:13,r:26,xp:16,scale:0.58,armor:.28},
 mushroom:{img:'mushroom',hp:52,speed:34,damage:10,r:24,xp:13,scale:0.63,ranged:true},
 ghost:{img:'ghost',hp:42,speed:72,damage:9,r:23,xp:12,scale:0.60},
 bee:{img:'bee',hp:32,speed:115,damage:8,r:19,xp:10,scale:0.60},
 boar:{img:'boar',hp:128,speed:68,damage:17,r:32,xp:24,scale:0.47,charge:true},
 boss_mushroom:{img:'boss_mushroom',hp:1900,speed:31,damage:24,r:78,xp:280,scale:0.38,boss:true},
 boss_tree:{img:'boss_tree',hp:3000,speed:27,damage:28,r:82,xp:380,scale:0.42,boss:true}
};

const input={keys:new Set(),joy:{active:false,id:null,cx:150,cy:590,x:150,y:590},pointer:{x:0,y:0,down:false}};
addEventListener('keydown',e=>{input.keys.add(e.key.toLowerCase()); if([' ','arrowup','arrowdown','arrowleft','arrowright'].includes(e.key.toLowerCase()))e.preventDefault(); if(e.key==='Escape'||e.key.toLowerCase()==='p') togglePause();});
addEventListener('keyup',e=>input.keys.delete(e.key.toLowerCase()));
function pointerPos(e){const r=canvas.getBoundingClientRect();return {x:(e.clientX-r.left)*W/r.width,y:(e.clientY-r.top)*H/r.height};}
canvas.addEventListener('pointerdown',e=>{canvas.setPointerCapture(e.pointerId);const p=pointerPos(e);input.pointer={...p,down:true};onPointerDown(p,e.pointerId);});
canvas.addEventListener('pointermove',e=>{const p=pointerPos(e);input.pointer.x=p.x;input.pointer.y=p.y;if(input.joy.active&&e.pointerId===input.joy.id){input.joy.x=p.x;input.joy.y=p.y;}});
canvas.addEventListener('pointerup',e=>{const p=pointerPos(e);input.pointer.down=false;if(input.joy.active&&e.pointerId===input.joy.id){input.joy.active=false;input.joy.id=null;input.joy.x=input.joy.cx;input.joy.y=input.joy.cy;}onPointerUp(p);});

let audioCtx=null,soundOn=true;
function beep(freq=440,dur=.05,type='sine',vol=.025){if(!soundOn)return;try{audioCtx=audioCtx||new (window.AudioContext||window.webkitAudioContext)();const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type=type;o.frequency.value=freq;g.gain.value=vol;o.connect(g);g.connect(audioCtx.destination);o.start();g.gain.exponentialRampToValueAtTime(.0001,audioCtx.currentTime+dur);o.stop(audioCtx.currentTime+dur);}catch{}}

let state='loading', last=0, game=null,menuT=0;
function newGame(){
 game={time:0,wave:1,waveTime:0,waveLength:23,spawnT:0,bossSpawned:false,bossAlive:false,camera:{x:0,y:0},shake:0,flash:0,
 player:{x:0,y:0,r:24,hp:360,maxHp:360,shield:0,maxShield:0,speed:205,level:1,xp:0,xpNeed:65,gold:0,kills:0,invuln:0,dash:0,face:1,anim:0,skills:{fire:1}},
 enemies:[],projectiles:[],enemyShots:[],pickups:[],effects:[],texts:[],clouds:[],meteors:[],choices:[],choiceRects:[],stats:{damage:0,high:+localStorage.getItem('mengyong_high')||0},
 cds:{fire:.15,ice:0,lightning:0,leaf:0,meteor:0,heal:0,laser:0,poison:0,tornado:0,spirit:0},hitSound:0};
 state='playing';
 beep(660,.08,'triangle');beep(880,.10,'triangle');
 for(let i=0;i<9;i++) spawnEnemy('slime');
}
function togglePause(){if(state==='playing')state='paused';else if(state==='paused')state='playing';}

function onPointerDown(p,id){
 if(state==='loading')return;
 if(state==='menu'){ if(inRect(p,{x:455,y:545,w:370,h:82}))newGame(); return; }
 if(state==='playing'){
   if(p.x<360&&p.y>390){input.joy.active=true;input.joy.id=id;input.joy.cx=p.x;input.joy.cy=p.y;input.joy.x=p.x;input.joy.y=p.y;return;}
   if(inRect(p,{x:1180,y:18,w:76,h:76})){togglePause();return;}
   if(inRect(p,{x:1100,y:560,w:130,h:130})){dash();return;}
 }
 if(state==='paused'){
   if(inRect(p,{x:480,y:430,w:320,h:70})){state='playing';return;}
   if(inRect(p,{x:480,y:515,w:320,h:60})){state='menu';return;}
 }
 if(state==='choosing'){
   game.choiceRects.forEach((r,i)=>{if(inRect(p,r)) chooseSkill(i);});
 }
 if(state==='gameover'||state==='victory'){
   if(inRect(p,{x:470,y:510,w:340,h:74}))newGame();
   if(inRect(p,{x:500,y:600,w:280,h:52}))state='menu';
 }
}
function onPointerUp(){ }
function inRect(p,r){return p.x>=r.x&&p.x<=r.x+r.w&&p.y>=r.y&&p.y<=r.y+r.h;}

function dash(){const p=game?.player;if(!p||p.dash>0)return;p.dash=2.8;p.invuln=.35;const [dx,dy]=moveVector();p.x+=dx*95;p.y+=dy*95;addEffect(p.x,p.y,'ring',.35,80,'#9ce6ff');beep(780,.06,'sawtooth',.02);}
function moveVector(){let x=0,y=0;if(input.keys.has('a')||input.keys.has('arrowleft'))x--;if(input.keys.has('d')||input.keys.has('arrowright'))x++;if(input.keys.has('w')||input.keys.has('arrowup'))y--;if(input.keys.has('s')||input.keys.has('arrowdown'))y++;if(input.joy.active){let dx=input.joy.x-input.joy.cx,dy=input.joy.y-input.joy.cy,d=Math.hypot(dx,dy);if(d>12){x+=dx/Math.max(45,d);y+=dy/Math.max(45,d);}}return normOrZero(x,y);}
function normOrZero(x,y){const d=Math.hypot(x,y);return d?[x/d,y/d]:[0,0];}

