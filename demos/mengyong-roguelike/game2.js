function spawnEnemy(forced){
 const g=game,p=g.player,w=g.wave;
 let type=forced;
 if(!type){
   const pool=['slime'];if(w>=2)pool.push('bat','mushroom');if(w>=3)pool.push('skeleton','ghost');if(w>=4)pool.push('bee');if(w>=6)pool.push('skeleton_shield');if(w>=7)pool.push('boar');type=pick(pool);
 }
 const t=ENEMIES[type],ang=rand(0,TAU),rad=rand(560,760),scale=1+(w-1)*.075;
 const e={type,x:p.x+Math.cos(ang)*rad,y:p.y+Math.sin(ang)*rad,r:t.r,hp:t.hp*scale,maxHp:t.hp*scale,speed:t.speed*(1+Math.min(.22,w*.015)),damage:t.damage*scale,xp:t.xp,armor:t.armor||0,dead:false,hit:0,phase:rand(0,TAU),shoot:rand(.4,2),charge:rand(1.2,3),boss:!!t.boss,slow:0};
 g.enemies.push(e);return e;
}
function spawnBoss(type){const e=spawnEnemy(type);e.x=game.player.x+480;e.y=game.player.y-100;game.bossSpawned=true;game.bossAlive=true;addText(e.x,e.y-90,'BOSS 来袭！','#ffdb6d',34);game.shake=10;beep(110,.4,'sawtooth',.05);}

function nearestEnemy(x,y,max=Infinity,exclude=new Set()){
 let best=null,bd=max*max;for(const e of game.enemies){if(e.dead||exclude.has(e))continue;let d=(e.x-x)**2+(e.y-y)**2;if(d<bd){bd=d;best=e;}}return best;
}
function addProjectile(o){game.projectiles.push({r:8,life:3,pierce:0,rot:0,...o});}
function addEffect(x,y,type,life=.3,size=30,color='#fff',extra={}){game.effects.push({x,y,type,life,max:life,size,color,...extra});}
function addText(x,y,text,color='#fff',size=18){game.texts.push({x,y,text,color,size,life:.8,max:.8});}
function hurtEnemy(e,dmg,crit=false){if(!e||e.dead)return;dmg*=1-e.armor;e.hp-=dmg;e.hit=.10;game.stats.damage+=dmg;addText(e.x+rand(-8,8),e.y-e.r-6,`${crit?'暴击 ':''}-${Math.round(dmg)}`,crit?'#ffe15b':'#fff0e8',crit?24:17);if(e.hp<=0)killEnemy(e);}
function killEnemy(e){if(e.dead)return;e.dead=true;game.player.kills++;game.player.xp+=e.xp*(e.boss?2:1);game.pickups.push({x:e.x,y:e.y,type:'xp',r:8,val:e.xp,life:18,vx:rand(-40,40),vy:rand(-40,40)});if(Math.random()<.22||e.boss)game.pickups.push({x:e.x+rand(-18,18),y:e.y+rand(-18,18),type:'coin',r:9,val:e.boss?60:rand(2,8),life:18,vx:rand(-35,35),vy:rand(-35,35)});if(Math.random()<.035&&!e.boss)game.pickups.push({x:e.x,y:e.y,type:'heal',r:10,val:28,life:18,vx:0,vy:0});if(e.boss){game.bossAlive=false;game.shake=14;game.flash=.3;for(let i=0;i<12;i++)game.pickups.push({x:e.x+rand(-70,70),y:e.y+rand(-60,60),type:'coin',r:9,val:12,life:18,vx:rand(-80,80),vy:rand(-80,80)});}
 addEffect(e.x,e.y,'burst',.45,e.r*1.4,e.boss?'#ffd45b':'#fff');beep(e.boss?160:320,.04,'square',e.boss?.035:.012);
}
function hurtPlayer(dmg,source){const p=game.player;if(p.invuln>0)return;if(p.shield>0){const s=Math.min(p.shield,dmg);p.shield-=s;dmg-=s;addEffect(p.x,p.y,'ring',.22,42,'#75d9ff');}if(dmg>0)p.hp-=dmg;p.invuln=.58;game.shake=7;addText(p.x,p.y-42,`-${Math.round(dmg)}`,'#ff6b6b',24);beep(125,.09,'square',.035);if(p.hp<=0)endGame(false);}

function levelCheck(){const p=game.player;if(p.xp>=p.xpNeed&&state==='playing'){p.xp-=p.xpNeed;p.level++;p.xpNeed=Math.round(p.xpNeed*1.23+18);p.maxHp+=16;p.hp=Math.min(p.maxHp,p.hp+40);prepareChoices();state='choosing';beep(880,.08,'triangle');setTimeout(()=>beep(1175,.10,'triangle'),60);}}
function prepareChoices(){
 const p=game.player, keys=Object.keys(SKILLS).filter(k=>(p.skills[k]||0)<SKILLS[k].max);let pool=[...keys],chs=[];
 while(chs.length<3&&pool.length){const i=(Math.random()*pool.length)|0;chs.push(pool.splice(i,1)[0]);}
 game.choices=chs;game.choiceRects=[];
}
function chooseSkill(i){const k=game.choices[i];if(!k)return;game.player.skills[k]=(game.player.skills[k]||0)+1;if(k==='shield'){game.player.maxShield=45+game.player.skills[k]*25;game.player.shield=Math.max(game.player.shield,game.player.maxShield);}if(k==='heal')game.player.hp=Math.min(game.player.maxHp,game.player.hp+45);state='playing';addText(game.player.x,game.player.y-55,`${SKILLS[k].name} Lv.${game.player.skills[k]}`,'#fff7a6',23);beep(960,.08,'triangle');}

function update(dt){
 menuT+=dt;if(state==='loading'){if(loaded>=ASSET_NAMES.length)state='menu';return;}if(state!=='playing')return;
 const g=game,p=g.player;g.time+=dt;g.waveTime+=dt;g.spawnT-=dt;g.shake=Math.max(0,g.shake-dt*28);g.flash=Math.max(0,g.flash-dt);p.invuln=Math.max(0,p.invuln-dt);p.dash=Math.max(0,p.dash-dt);p.anim+=dt;
 const [mx,my]=moveVector();p.x+=mx*p.speed*dt*(p.dash>2.45?2.5:1);p.y+=my*p.speed*dt*(p.dash>2.45?2.5:1);p.face=mx!==0?Math.sign(mx):p.face;
 g.camera.x=lerp(g.camera.x,p.x,1-Math.pow(.001,dt));g.camera.y=lerp(g.camera.y,p.y,1-Math.pow(.001,dt));
 const bossWave=g.wave===5||g.wave===10;
 if(bossWave&&!g.bossSpawned&&g.waveTime>4)spawnBoss(g.wave===5?'boss_mushroom':'boss_tree');
 if(g.spawnT<=0){const base=Math.max(.16,.78-g.wave*.055);g.spawnT=base*rand(.72,1.18);if(!bossWave||g.enemies.length<45){let count=1+(g.wave>=8&&Math.random()<.25?1:0);while(count--)spawnEnemy();}}
 if(!bossWave&&g.waveTime>=g.waveLength)nextWave();
 if(bossWave&&g.bossSpawned&&!g.bossAlive&&g.waveTime>7)nextWave();
 updateSkills(dt);updateEnemies(dt);updateProjectiles(dt);updatePickups(dt);updateFx(dt);levelCheck();
}
function nextWave(){if(game.wave>=10){endGame(true);return;}game.wave++;game.waveTime=0;game.bossSpawned=false;game.bossAlive=false;game.player.hp=Math.min(game.player.maxHp,game.player.hp+30);game.player.gold+=20;addText(game.player.x,game.player.y-80,`第 ${game.wave} 波`,'#fff5a0',38);beep(620,.06,'triangle');}
function endGame(win){if(!game)return;const score=game.player.kills*10+game.player.gold*3+game.wave*120;game.stats.score=score;game.stats.high=Math.max(game.stats.high,score);localStorage.setItem('mengyong_high',game.stats.high);state=win?'victory':'gameover';beep(win?880:100,.35,win?'triangle':'sawtooth',.045);}

