function updateSkills(dt){const g=game,p=g.player,s=p.skills,cd=g.cds;Object.keys(cd).forEach(k=>cd[k]-=dt);
 if(s.fire&&cd.fire<=0){const t=nearestEnemy(p.x,p.y,620);if(t){const lv=s.fire,an=Math.atan2(t.y-p.y,t.x-p.x),n=1+(lv>=4?1:0);for(let i=0;i<n;i++){const a=an+(i-(n-1)/2)*.12;addProjectile({type:'fire',x:p.x,y:p.y,vx:Math.cos(a)*480,vy:Math.sin(a)*480,dmg:26+lv*13,r:10,life:2.1,homing:.9,explosion:28+lv*6});}cd.fire=Math.max(.36,1.05-lv*.11);}}
 if(s.ice&&cd.ice<=0){const lv=s.ice,n=6+lv*2;for(let i=0;i<n;i++){let a=i/n*TAU;addProjectile({type:'ice',x:p.x,y:p.y,vx:Math.cos(a)*350,vy:Math.sin(a)*350,dmg:18+lv*10,r:7,life:1.6,pierce:lv>=4?1:0,slow:.65});}cd.ice=Math.max(1.7,3.4-lv*.28);addEffect(p.x,p.y,'ring',.35,75,'#7feaff');}
 if(s.lightning&&cd.lightning<=0){let t=nearestEnemy(p.x,p.y,520);if(t){const lv=s.lightning,seen=new Set();let from={x:p.x,y:p.y};for(let i=0;i<2+lv;i++){if(!t)break;seen.add(t);hurtEnemy(t,22+lv*12,Math.random()<.12);addEffect(0,0,'line',.18,0,'#a96bff',{x1:from.x,y1:from.y,x2:t.x,y2:t.y});from=t;t=nearestEnemy(from.x,from.y,180,seen);}cd.lightning=Math.max(1.0,2.4-lv*.18);beep(460,.025,'square',.01);}}
 if(s.leaf&&cd.leaf<=0){const t=nearestEnemy(p.x,p.y,650);if(t){let a=Math.atan2(t.y-p.y,t.x-p.x),lv=s.leaf;addProjectile({type:'leaf',x:p.x,y:p.y,vx:Math.cos(a)*430,vy:Math.sin(a)*430,dmg:20+lv*10,r:15,life:2.2,pierce:2+lv,spin:8});cd.leaf=Math.max(.65,1.55-lv*.12);}}
 if(s.meteor&&cd.meteor<=0){const t=nearestEnemy(p.x,p.y,700);if(t){const lv=s.meteor;g.meteors.push({x:t.x+rand(-20,20),y:t.y+rand(-20,20),t:1.0,lv});cd.meteor=Math.max(3.2,6.4-lv*.45);}}
 if(s.heal&&cd.heal<=0){const lv=s.heal;p.hp=Math.min(p.maxHp,p.hp+4+lv*4);addText(p.x+20,p.y-35,`+${4+lv*4}`,'#8cff88',17);cd.heal=Math.max(1.8,3.6-lv*.28);}
 if(s.shield){p.maxShield=45+s.shield*25;if(p.shield<p.maxShield)p.shield=Math.min(p.maxShield,p.shield+dt*(4+s.shield*2.5));}
 if(s.laser&&cd.laser<=0){const t=nearestEnemy(p.x,p.y,780);if(t){const lv=s.laser,a=Math.atan2(t.y-p.y,t.x-p.x),len=820;addEffect(0,0,'beam',.28,0,'#ff69df',{x1:p.x,y1:p.y,x2:p.x+Math.cos(a)*len,y2:p.y+Math.sin(a)*len,width:10+lv*2});for(const e of g.enemies){if(e.dead)continue;const d=pointLineDist(e.x,e.y,p.x,p.y,p.x+Math.cos(a)*len,p.y+Math.sin(a)*len);if(d<e.r+14)hurtEnemy(e,34+lv*17);}cd.laser=Math.max(3.5,7-lv*.5);game.shake=4;}}
 if(s.poison&&cd.poison<=0){const t=nearestEnemy(p.x,p.y,550);if(t){const lv=s.poison;g.clouds.push({x:t.x,y:t.y,r:65+lv*9,life:4.2,dmg:8+lv*5,tick:0});cd.poison=Math.max(2.6,5.1-lv*.35);}}
 if(s.tornado&&cd.tornado<=0){const t=nearestEnemy(p.x,p.y,650);if(t){let a=Math.atan2(t.y-p.y,t.x-p.x),lv=s.tornado;addProjectile({type:'tornado',x:p.x,y:p.y,vx:Math.cos(a)*135,vy:Math.sin(a)*135,dmg:9+lv*5,r:42,life:4.0,pierce:999,tick:.2});cd.tornado=Math.max(3.1,6-lv*.4);}}
 if(s.spirit&&cd.spirit<=0){const t=nearestEnemy(p.x,p.y,620);if(t){const lv=s.spirit,a=Math.atan2(t.y-p.y,t.x-p.x);addProjectile({type:'spirit',x:p.x+Math.cos(g.time*3)*45,y:p.y+Math.sin(g.time*3)*45,vx:Math.cos(a)*520,vy:Math.sin(a)*520,dmg:16+lv*9,r:8,life:1.5,homing:1.2});cd.spirit=Math.max(.42,1.25-lv*.12);}}
 // Orbiting blades collisions
 if(s.blades){const lv=s.blades,n=1+Math.ceil(lv/2),rad=54+lv*6;for(let i=0;i<n;i++){const a=g.time*(2.4+lv*.18)+i/n*TAU,bx=p.x+Math.cos(a)*rad,by=p.y+Math.sin(a)*rad;for(const e of g.enemies){if(e.dead||e.hit>0)continue;if((e.x-bx)**2+(e.y-by)**2<(e.r+16)**2){hurtEnemy(e,7+lv*4);e.hit=.18;}}}}
}
function pointLineDist(px,py,x1,y1,x2,y2){const A=px-x1,B=py-y1,C=x2-x1,D=y2-y1;const dot=A*C+B*D,len=C*C+D*D;let t=len?clamp(dot/len,0,1):0;const x=x1+t*C,y=y1+t*D;return Math.hypot(px-x,py-y);}

function updateEnemies(dt){const g=game,p=g.player;
 for(const e of g.enemies){if(e.dead)continue;e.hit=Math.max(0,e.hit-dt);e.slow=Math.max(0,e.slow-dt);e.shoot-=dt;e.charge-=dt;const t=ENEMIES[e.type];let dx=p.x-e.x,dy=p.y-e.y,[nx,ny]=norm(dx,dy);let sp=e.speed*(e.slow>0?.58:1);
 if(e.type==='bat'||e.type==='bee'){const wob=Math.sin(g.time*4+e.phase)*.55;const tx=nx*Math.cos(wob)-ny*Math.sin(wob),ty=nx*Math.sin(wob)+ny*Math.cos(wob);nx=tx;ny=ty;}
 if(t.ranged&&Math.hypot(dx,dy)<330){sp*=-.18;if(e.shoot<=0){const a=Math.atan2(dy,dx);g.enemyShots.push({x:e.x,y:e.y,vx:Math.cos(a)*180,vy:Math.sin(a)*180,r:8,damage:e.damage*.7,life:4,type:'spore'});e.shoot=rand(1.5,2.5);}}
 if(t.charge&&e.charge<=0&&Math.hypot(dx,dy)<380){sp*=2.8;e.charge=rand(2.4,3.8);addEffect(e.x,e.y,'ring',.25,40,'#ffb268');}
 if(e.boss){sp*=.82;if(e.shoot<=0){bossAttack(e);e.shoot=e.type==='boss_tree'?2.3:1.8;}}
 e.x+=nx*sp*dt;e.y+=ny*sp*dt;
 if(circleHit(e,p))hurtPlayer(e.damage,e);
 }
 g.enemies=g.enemies.filter(e=>!e.dead);
 for(const s of g.enemyShots){s.x+=s.vx*dt;s.y+=s.vy*dt;s.life-=dt;if(circleHit(s,p)){hurtPlayer(s.damage,s);s.life=0;}}
 g.enemyShots=g.enemyShots.filter(s=>s.life>0&&Math.hypot(s.x-p.x,s.y-p.y)<1100);
 for(const c of g.clouds){c.life-=dt;c.tick-=dt;if(c.tick<=0){c.tick=.45;for(const e of g.enemies)if(!e.dead&&Math.hypot(e.x-c.x,e.y-c.y)<c.r+e.r)hurtEnemy(e,c.dmg);}}
 g.clouds=g.clouds.filter(c=>c.life>0);
 for(const m of g.meteors){m.t-=dt;if(m.t<=0&&!m.done){m.done=true;for(const e of g.enemies)if(!e.dead&&Math.hypot(e.x-m.x,e.y-m.y)<100+m.lv*12)hurtEnemy(e,70+m.lv*35,true);addEffect(m.x,m.y,'burst',.55,130+m.lv*10,'#ff7d38');g.shake=10;beep(80,.12,'sawtooth',.045);}}
 g.meteors=g.meteors.filter(m=>m.t>-.45);
}
function bossAttack(e){const g=game,p=g.player;if(e.type==='boss_mushroom'){const n=10;for(let i=0;i<n;i++){const a=i/n*TAU+g.time*.2;g.enemyShots.push({x:e.x,y:e.y,vx:Math.cos(a)*150,vy:Math.sin(a)*150,r:10,damage:e.damage*.55,life:5,type:'spore'});}addEffect(e.x,e.y,'ring',.35,105,'#ff8fb6');}else{for(let i=0;i<8;i++){const a=i/8*TAU+rand(-.12,.12);g.enemyShots.push({x:e.x,y:e.y,vx:Math.cos(a)*180,vy:Math.sin(a)*180,r:11,damage:e.damage*.62,life:5,type:'rock'});}for(let i=0;i<2;i++)spawnEnemy(pick(['slime','skeleton','bee']));addEffect(e.x,e.y,'ring',.35,115,'#9aff71');}game.shake=5;}

function updateProjectiles(dt){const g=game,p=g.player;
 for(const q of g.projectiles){q.life-=dt;q.rot=(q.rot||0)+(q.spin||4)*dt;if(q.homing){const t=nearestEnemy(q.x,q.y,320);if(t){const sp=Math.hypot(q.vx,q.vy),a=Math.atan2(t.y-q.y,t.x-q.x),desx=Math.cos(a)*sp,desy=Math.sin(a)*sp;q.vx=lerp(q.vx,desx,dt*q.homing*3);q.vy=lerp(q.vy,desy,dt*q.homing*3);}}
 q.x+=q.vx*dt;q.y+=q.vy*dt;if(q.type==='tornado'){q.tick-=dt;if(q.tick<=0){q.tick=.24;for(const e of g.enemies)if(!e.dead&&Math.hypot(e.x-q.x,e.y-q.y)<q.r+e.r){hurtEnemy(e,q.dmg);const [nx,ny]=norm(q.x-e.x,q.y-e.y);e.x+=nx*12;e.y+=ny*12;}}continue;}
 for(const e of g.enemies){if(e.dead)continue;if(circleHit(q,e)){hurtEnemy(e,q.dmg);if(q.slow)e.slow=Math.max(e.slow,1.25);if(q.type==='fire'){for(const o of g.enemies)if(!o.dead&&o!==e&&Math.hypot(o.x-e.x,o.y-e.y)<q.explosion+o.r)hurtEnemy(o,q.dmg*.45);addEffect(e.x,e.y,'burst',.24,q.explosion,'#ff8a37');}if(q.pierce>0)q.pierce--;else{q.life=0;break;}}}
 }
 g.projectiles=g.projectiles.filter(q=>q.life>0&&Math.hypot(q.x-p.x,q.y-p.y)<1200);
}
function updatePickups(dt){const p=game.player;for(const o of game.pickups){o.life-=dt;o.x+=o.vx*dt;o.y+=o.vy*dt;o.vx*=Math.pow(.05,dt);o.vy*=Math.pow(.05,dt);const d=Math.hypot(o.x-p.x,o.y-p.y);const magnet=100+(p.skills.magnet||0)*30;if(d<magnet){const [nx,ny]=norm(p.x-o.x,p.y-o.y);o.x+=nx*(320+250*(1-d/magnet))*dt;o.y+=ny*(320+250*(1-d/magnet))*dt;}if(d<p.r+18){if(o.type==='xp')p.xp+=o.val*.45;else if(o.type==='coin'){p.gold+=Math.round(o.val);beep(850,.025,'sine',.007);}else if(o.type==='heal')p.hp=Math.min(p.maxHp,p.hp+o.val);o.life=0;}}game.pickups=game.pickups.filter(o=>o.life>0);}
function updateFx(dt){for(const e of game.effects)e.life-=dt;game.effects=game.effects.filter(e=>e.life>0);for(const t of game.texts){t.life-=dt;t.y-=24*dt;}game.texts=game.texts.filter(t=>t.life>0);}

function worldToScreen(x,y){return [x-game.camera.x+W/2,y-game.camera.y+H/2];}
function drawImageCentered(img,x,y,w,h,flip=false,alpha=1){if(!img||!img.complete||!img.naturalWidth)return;ctx.save();ctx.globalAlpha=alpha;ctx.translate(x,y);if(flip)ctx.scale(-1,1);const ar=img.naturalWidth/img.naturalHeight;if(!h)h=w/ar;if(!w)w=h*ar;if(img.atlas){const [sx,sy,sw,sh]=img.rect;ctx.drawImage(img.atlas,sx,sy,sw,sh,-w/2,-h/2,w,h);}else ctx.drawImage(img,-w/2,-h/2,w,h);ctx.restore();}
function draw(){ctx.clearRect(0,0,W,H);if(state==='loading'){drawLoading();return;}if(state==='menu'){drawMenu();return;}drawWorld();drawHud();if(state==='paused')drawPause();if(state==='choosing')drawChoices();if(state==='gameover'||state==='victory')drawEnd();}
function drawLoading(){ctx.fillStyle='#173a25';ctx.fillRect(0,0,W,H);ctx.fillStyle='white';ctx.font='700 36px sans-serif';ctx.textAlign='center';ctx.fillText('正在准备可爱怪物…',W/2,H/2-10);ctx.fillStyle='#ffffff33';roundRect(390,390,500,20,10,true,false);ctx.fillStyle='#9cf57a';roundRect(390,390,500*loaded/ASSET_NAMES.length,20,10,true,false);}
