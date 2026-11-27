/* EMBERBOUND — original canvas platformer. No external game engine. */
(() => {
'use strict';
const canvas=document.getElementById('game'),ctx=canvas.getContext('2d');
const $=id=>document.getElementById(id),W=canvas.width,H=canvas.height,TILE=48;
const SAVE_KEY='emberbound-save-v1',BEST_KEY='emberbound-best-v1';
const LEVELS=[
 {name:'THE MOSSY OUTSKIRTS',width:3000,spawn:90,goal:2860,platforms:[[0,470,520,70],[610,420,230,120],[920,470,380,70],[1390,410,220,130],[1690,460,370,80],[2130,400,250,140],[2450,470,550,70]],gems:[[250,420],[340,370],[690,370],[770,370],[1040,420],[1150,420],[1470,360],[1550,360],[1810,410],[1940,410],[2200,350],[2300,350],[2600,420],[2700,420]],enemies:[[460,438],[1080,438],[1780,428],[2240,368]],checkpoint:1650},
 {name:'THE SUNKEN GARDEN',width:3400,spawn:80,goal:3270,platforms:[[0,470,400,70],[480,420,250,120],[800,360,180,180],[1050,450,430,90],[1550,400,250,140],[1870,340,210,200],[2140,450,400,90],[2610,390,220,150],[2890,460,510,80]],gems:[[170,420],[550,370],[640,370],[850,310],[920,310],[1150,400],[1300,400],[1630,350],[1740,350],[1930,290],[2010,290],[2250,400],[2390,400],[2680,340],[2980,410],[3090,410]],enemies:[[350,438],[1180,418],[1700,368],[2320,418],[2990,428]],checkpoint:2140},
 {name:'THE ASHEN RIDGE',width:3800,spawn:70,goal:3660,platforms:[[0,470,420,70],[500,410,200,130],[770,350,220,190],[1070,440,280,100],[1430,380,230,160],[1730,320,210,220],[2020,430,370,110],[2460,360,250,180],[2760,420,260,120],[3090,350,220,190],[3370,460,430,80]],gems:[[160,420],[570,360],[650,360],[830,300],[930,300],[1150,390],[1260,390],[1500,330],[1600,330],[1800,270],[1900,270],[2150,380],[2270,380],[2540,310],[2660,310],[2850,370],[2960,370],[3160,300],[3450,410],[3550,410]],enemies:[[330,438],[1200,418],[1610,358],[2200,408],[2840,398],[3490,428]],checkpoint:2760}
];
let levelIndex=0,level,player,camera=0,embers=[],enemies=[],particles=[],decor=[],keys={},touch={left:false,right:false},running=false,paused=false,deadTimer=0,elapsed=0,toastTimer=0,soundOn=true,audioCtx=null,muted=false;
let totalEmbers=0,lives=3,checkpointX=0,levelStart=0,highScore=Number(localStorage.getItem(BEST_KEY)||0),frame=0,last=0;
function loadLevel(idx,keep=true){
 level=LEVELS[idx];levelIndex=idx;player={x:level.spawn,y:390,vx:0,vy:0,w:30,h:42,ground:false,face:1,invuln:1,anim:0,dead:false};
 camera=0;checkpointX=level.spawn;embers=level.gems.map(([x,y])=>({x,y,taken:false,phase:Math.random()*6}));enemies=level.enemies.map(([x,y],i)=>({x,y,w:34,h:30,vx:i%2?65:-65,min:x-95,max:x+95,alive:true,phase:Math.random()*5}));particles=[];levelStart=elapsed;
 $('levelLabel').textContent=`STAGE 0${idx+1}`;$('saveStatus').textContent=`Stage ${idx+1} · ${totalEmbers} ember terkumpul`;
 updateHud();makeDecor();
}
function makeDecor(){decor=[];for(let x=0;x<level.width+500;x+=80+Math.random()*80)decor.push({x,y:300+Math.random()*135,type:Math.floor(Math.random()*4),s:.7+Math.random()*.7});}
function updateHud(){$('emberCount').textContent=String(totalEmbers).padStart(2,'0');$('lifeCount').textContent=String(lives).padStart(2,'0');$('timeCount').textContent=fmt(elapsed);$('progressBar').style.width=`${Math.min(100,player?player.x/level.goal*100:0)}%`;}
function fmt(t){let n=Math.floor(t);return `${String(Math.floor(n/60)).padStart(2,'0')}:${String(n%60).padStart(2,'0')}`;}
function showToast(s){const el=$('toast');el.textContent=s;el.classList.add('show');toastTimer=1.5;}
function beep(freq=440,dur=.08,type='square',vol=.035){if(!soundOn||muted)return;try{audioCtx??=new(window.AudioContext||window.webkitAudioContext)();const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type=type;o.frequency.value=freq;g.gain.value=vol;o.connect(g);g.connect(audioCtx.destination);o.start();g.gain.exponentialRampToValueAtTime(.001,audioCtx.currentTime+dur);o.stop(audioCtx.currentTime+dur);}catch(e){}}
function start(){if(running)return;running=true;paused=false;$('screen').classList.add('hidden');$('pauseChip').classList.remove('show');last=0;requestAnimationFrame(loop);beep(520,.12);}
function pause(){if(!running)return;paused=!paused;$('pauseChip').classList.toggle('show',paused);if(!paused){last=0;requestAnimationFrame(loop);}else beep(260,.08);}
function resetGame(){totalEmbers=0;lives=3;elapsed=0;loadLevel(0);start();showToast('THE ADVENTURE BEGINS!');}
function save(){const data={levelIndex,totalEmbers,lives,elapsed,checkpointX,playerX:player.x};localStorage.setItem(SAVE_KEY,JSON.stringify(data));$('saveStatus').textContent=`Auto-saved · Stage ${levelIndex+1} · ${totalEmbers} ember`; }
function continueGame(){let d;try{d=JSON.parse(localStorage.getItem(SAVE_KEY)||'null');}catch(e){}if(!d){resetGame();return;}levelIndex=Math.min(LEVELS.length-1,Math.max(0,d.levelIndex||0));totalEmbers=d.totalEmbers||0;lives=d.lives||3;elapsed=d.elapsed||0;loadLevel(levelIndex);checkpointX=d.checkpointX||level.spawn;player.x=Math.max(checkpointX,d.playerX||checkpointX);start();}
function gameOver(won=false){running=false;save();$('screen').classList.remove('hidden');$('screenEyebrow').textContent=won?'A LIGHT RETURNS':'THE SPARK FADES';$('screenTitle').innerHTML=won?'YOU DID IT<span>!</span>':'TRY AGAIN<span>?</span>';$('screenText').textContent=won?`Adventure complete! You gathered ${totalEmbers} embers in ${fmt(elapsed)}. Thank you for bringing the light home.`:`Pip needs a little rest. You collected ${totalEmbers} embers. Your progress has been saved.`;$('mainAction').textContent=won?'PLAY AGAIN':'CONTINUE';$('mainAction').onclick=won?resetGame:continueGame;beep(won?660:150,.35,'triangle');}
function respawn(){lives--;if(lives<=0){gameOver();return;}player.x=checkpointX;player.y=300;player.vx=player.vy=0;player.invuln=2;player.dead=false;showToast('CHECKPOINT RESTORED');beep(190,.2);updateHud();}
function jump(){if(!running||paused)return;if(player.ground){player.vy=-650;player.ground=false;player.anim=0;beep(310,.09,'square');}}
function rects(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;}
function burst(x,y,color,n=10){for(let i=0;i<n;i++){let a=Math.random()*Math.PI*2,v=40+Math.random()*180;particles.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:.35+Math.random()*.45,color,size:2+Math.random()*3});}}
function update(dt){
 frame++;elapsed+=dt;if(toastTimer>0){toastTimer-=dt;if(toastTimer<=0)$('toast').classList.remove('show');}
 const dir=(keys.ArrowLeft||keys.a||touch.left?-1:0)+(keys.ArrowRight||keys.d||touch.right?1:0);
 player.vx=dir*245;if(dir){player.face=dir;player.anim+=dt*12;}else player.anim*=.8;
 player.x+=player.vx*dt;player.x=Math.max(0,Math.min(level.width-player.w,player.x));
 player.vy+=1500*dt;player.vy=Math.min(player.vy,900);let oldY=player.y;player.y+=player.vy*dt;player.ground=false;
 const p={x:player.x,y:player.y,w:player.w,h:player.h};
 for(const plat of level.platforms){let r={x:plat[0],y:plat[1],w:plat[2],h:plat[3]};if(rects(p,r)&&oldY+player.h<=r.y+15&&player.vy>=0){player.y=r.y-player.h;player.vy=0;player.ground=true;p.y=player.y;}}
 if(player.y>H+100){respawn();}
 if(player.invuln>0)player.invuln-=dt;
 for(const e of enemies){if(!e.alive)continue;e.x+=e.vx*dt;if(e.x<e.min||e.x+e.w>e.max)e.vx*=-1;
  if(rects({x:player.x+4,y:player.y+4,w:player.w-8,h:player.h-4},e)){
   if(player.vy>120&&oldY+player.h<=e.y+16){e.alive=false;player.vy=-420;burst(e.x+e.w/2,e.y,'#f18e83',12);beep(190,.12); }
   else if(player.invuln<=0){player.invuln=1.3;respawn();}
  }
 }
 for(const g of embers){if(g.taken)continue;g.phase+=dt*3;if(Math.hypot((player.x+15)-g.x,(player.y+20)-g.y)<29){g.taken=true;totalEmbers++;burst(g.x,g.y,'#ffd27a',9);beep(720,.07,'triangle');if(totalEmbers%5===0)showToast('FIVE EMBERS! NICE WORK');}}
 if(player.x>level.checkpoint&&checkpointX<level.checkpoint){checkpointX=level.checkpoint;save();showToast('CHECKPOINT UNLOCKED');beep(560,.18,'triangle');}
 if(player.x>level.goal){if(levelIndex<LEVELS.length-1){levelIndex++;loadLevel(levelIndex);save();showToast('NEW AREA DISCOVERED!');}else{gameOver(true);}}
 camera=Math.max(0,Math.min(level.width-W,player.x-W*.38));
 particles.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=300*dt;p.life-=dt;});particles=particles.filter(p=>p.life>0);
 updateHud();
}
function pixelRect(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),w,h);}
function drawBackground(){
 const grad=ctx.createLinearGradient(0,0,0,H);grad.addColorStop(0,'#243c4a');grad.addColorStop(.58,'#45675c');grad.addColorStop(1,'#263e3d');ctx.fillStyle=grad;ctx.fillRect(0,0,W,H);
 // distant moon and stars
 ctx.fillStyle='#f4dba0';ctx.globalAlpha=.75;ctx.beginPath();ctx.arc(760-camera*.08,100,31,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
 for(let i=0;i<45;i++){let x=((i*173-camera*.16)%(W+40)+W+40)%(W+40),y=25+(i*71)%210;pixelRect(x,y,2,2,'#d8e6c2');}
 // layered hills
 for(let layer=0;layer<3;layer++){ctx.fillStyle=['#304e4d','#2a4644','#223b3b'][layer];ctx.beginPath();ctx.moveTo(0,H);for(let x=-100;x<W+150;x+=100){let y=300+layer*65+Math.sin((x+camera*(.12+layer*.1))/125)*38;ctx.lineTo(x,y);}ctx.lineTo(W,H);ctx.fill();}
 decor.forEach(d=>{let x=d.x-camera*.72;if(x<-70||x>W+70)return;let y=d.y;if(d.type===0){pixelRect(x,y,9,70*d.s,'#1c3837');pixelRect(x-17,y-25,43,40,'#31574b');pixelRect(x-10,y-40,30,25,'#3f6a56');}else if(d.type===1){pixelRect(x,y+20,7,38,'#314b3f');pixelRect(x-13,y,34,30,'#53765a');pixelRect(x-8,y-9,24,18,'#6b8c62');}else if(d.type===2){pixelRect(x,y,7,40,'#3b5546');pixelRect(x-20,y-8,42,15,'#66835c');pixelRect(x-10,y-22,22,17,'#76966a');}else{pixelRect(x,y+20,6,28,'#5d604a');pixelRect(x-10,y+8,27,16,'#d08c72');}});
}
function drawWorld(){
 // platforms
 for(const [x,y,w,h] of level.platforms){let sx=x-camera;if(sx+w<0||sx>W)continue;pixelRect(sx,y,w,h,'#795b49');pixelRect(sx,y,w,12,'#8eb477');pixelRect(sx,y+12,w,4,'#527d5a');for(let bx=sx+10;bx<sx+w-8;bx+=32){pixelRect(bx,y+25,5,5,'#5c493f');pixelRect(bx+12,y+48,7,5,'#96705a');}for(let bx=sx+14;bx<sx+w-8;bx+=50)pixelRect(bx,y-5,5,7,'#c2d58a');}
 // embers
 for(const g of embers){if(g.taken)continue;let x=g.x-camera,y=g.y+Math.sin(g.phase)*5;if(x<-20||x>W+20)continue;ctx.save();ctx.translate(x,y);ctx.rotate(Math.PI/4);ctx.shadowBlur=13;ctx.shadowColor='#ffd27a';pixelRect(-5,-5,10,10,'#ffe8a8');pixelRect(-3,-3,6,6,'#fff8d6');ctx.restore();}
 // portal
 let gx=level.goal-camera;ctx.save();ctx.shadowBlur=25;ctx.shadowColor='#a7e6b4';ctx.strokeStyle='#b7f0c3';ctx.lineWidth=5;ctx.beginPath();ctx.ellipse(gx,420,25,47,0,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#a7e6b422';ctx.fill();ctx.restore();pixelRect(gx-3,465,6,5,'#d4f6d6');
 // enemies thornbugs
 for(const e of enemies){if(!e.alive)continue;let x=e.x-camera;if(x<-50||x>W+50)continue;let bob=Math.sin(frame*.12+e.phase)*2;pixelRect(x+5,e.y+8+bob,25,17,'#b85e60');pixelRect(x+1,e.y+14+bob,32,12,'#e28a78');pixelRect(x+8,e.y+3+bob,5,9,'#593f4c');pixelRect(x+22,e.y+3+bob,5,9,'#593f4c');pixelRect(x+9,e.y+14+bob,4,5,'#252d38');pixelRect(x+22,e.y+14+bob,4,5,'#252d38');pixelRect(x+2,e.y+24+bob,6,5,'#704a50');pixelRect(x+27,e.y+24+bob,6,5,'#704a50');}
}
function drawPlayer(){
 if(player.invuln>0&&Math.floor(frame/5)%2===0)return;
 let x=player.x-camera,y=player.y,bob=player.ground?Math.sin(player.anim)*2:0;
 ctx.save();ctx.translate(Math.round(x+15),Math.round(y+bob));if(player.face<0)ctx.scale(-1,1);
 // little forest sprite Pip, custom silhouette
 pixelRect(-10,-18,20,21,'#d9a77a');pixelRect(-8,-23,16,8,'#e9c99a');pixelRect(-12,-16,4,12,'#e9c99a');pixelRect(8,-16,4,12,'#e9c99a');
 pixelRect(-8,-12,4,4,'#25343b');pixelRect(4,-12,4,4,'#25343b');pixelRect(1,-5,5,2,'#9e5c56');
 pixelRect(-11,2,22,14,'#6e9f83');pixelRect(-14,5,4,9,'#a7d4a8');pixelRect(10,5,4,9,'#a7d4a8');
 pixelRect(-9,15,7,7,'#514b57');pixelRect(3,15,7,7,'#514b57');pixelRect(-11,20,9,4,'#d7b17d');pixelRect(3,20,9,4,'#d7b17d');
 // glowing scarf
 pixelRect(-12,1,24,4,'#f0c36f');pixelRect(-14,4,7,8,'#f0c36f');
 // sprout
 pixelRect(-2,-29,3,8,'#7bb98a');pixelRect(-7,-30,6,4,'#a7e6b4');pixelRect(1,-33,7,5,'#a7e6b4');
 ctx.restore();
}
function draw(){
 drawBackground();ctx.save();drawWorld();drawPlayer();
 for(const p of particles){ctx.globalAlpha=Math.max(0,p.life*2);pixelRect(p.x-camera,p.y,p.size,p.size,p.color);}ctx.globalAlpha=1;ctx.restore();
 // vignette and small biome label
 const v=ctx.createRadialGradient(W/2,H/2,100,W/2,H/2,570);v.addColorStop(.65,'#0000');v.addColorStop(1,'#0b172244');ctx.fillStyle=v;ctx.fillRect(0,0,W,H);
}
function loop(t){if(!running||paused)return;let dt=Math.min((t-last)/1000||0,.033);last=t;update(dt);draw();if(running&&!paused)requestAnimationFrame(loop);}
function showHelp(){paused=running&&!paused;if(paused){$('pauseChip').classList.add('show');}else if(running){$('pauseChip').classList.remove('show');last=0;requestAnimationFrame(loop);} $('screen').classList.remove('hidden');$('screenEyebrow').textContent='FIELD NOTES';$('screenTitle').innerHTML='HOW TO <span>PLAY</span>';$('screenText').innerHTML='Move: A/D atau tombol panah. Jump: SPACE atau W. Hindari Thornbug dengan melompat di atasnya. Kumpulkan ember ✦, aktifkan checkpoint, lalu sentuh portal. Tekan ESC untuk pause.';$('mainAction').textContent='BACK TO GAME';$('mainAction').onclick=()=>{$('screen').classList.add('hidden');if(running){paused=false;$('pauseChip').classList.remove('show');last=0;requestAnimationFrame(loop);}};}
document.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp',' '].includes(e.key))e.preventDefault();keys[e.key]=true;if((e.key===' '||e.key==='w'||e.key==='ArrowUp')&&!e.repeat)jump();if(e.key==='Escape')pause();if(e.key==='Enter'&&!running)start();});
document.addEventListener('keyup',e=>keys[e.key]=false);
function hold(id,key){let el=$(id);el.addEventListener('pointerdown',e=>{e.preventDefault();touch[key]=true;el.setPointerCapture(e.pointerId);});['pointerup','pointercancel','lostpointercapture'].forEach(ev=>el.addEventListener(ev,()=>touch[key]=false));}
hold('touchLeft','left');hold('touchRight','right');$('touchJump').addEventListener('pointerdown',e=>{e.preventDefault();jump();});
$('mainAction').onclick=()=>{let d=localStorage.getItem(SAVE_KEY);d?continueGame():resetGame();};
$('restartBtn').onclick=()=>{if(confirm('Restart this adventure from Stage 1?')){localStorage.removeItem(SAVE_KEY);resetGame();}};
$('helpBtn').onclick=showHelp;
$('soundToggle').onclick=()=>{soundOn=!soundOn;$('soundToggle').textContent=soundOn?'♫':'♪';$('soundToggle').style.opacity=soundOn?'1':'.45';beep(500,.07);};
window.addEventListener('blur',()=>{if(running&&!paused)pause();});
loadLevel(0);draw();
if(localStorage.getItem(SAVE_KEY)){$('saveStatus').textContent='Save ditemukan · perjalanan bisa dilanjutkan';$('progressBar').style.width='8%';}
})();
