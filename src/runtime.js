// Phaser owns the only frame loop, display list and Arcade integration.
// Storybook visuals use separate native images; invisible Arcade proxies keep rules exact.
let playerSprite,backdrop,effects,reinaView,playerShadow,weaponView,attackArm;
const entityViews=new Map(),hitTimes=new WeakMap();
const artState={clock:0,walk:0,direction:'down',frame:0,attackAt:-10,hitEffects:[]};
const artRows={down:0,left:1,right:2,up:3};
let stageHeight=600,cameraY=0,currentPose=null;
const poseVariantCache=new Set();
function configureWorld(height=1800){stageHeight=height;combat.setWorldBounds({width:W,height,top:height>H?136:55});if(scene){scene.cameras.main.setBounds(0,0,W,height);scene.physics.world.setBounds(0,0,W,height);}snapCamera();}
function inspectWorld(){return {width:W,height:stageHeight,viewportWidth:W,viewportHeight:H,cameraY,playerScreenY:state.player.y-cameraY};}
function snapCamera(){cameraY=stageHeight>H?Math.max(0,Math.min(stageHeight-H,state.player.y-H/2)):0;if(scene)scene.cameras.main.setScroll(0,cameraY);return inspectWorld();}
function followCamera(dt){if(state.mode!=='playing')return;const screenY=state.player.y-cameraY,target=screenY<230?state.player.y-230:screenY>370?state.player.y-370:cameraY;cameraY=Phaser.Math.Clamp(cameraY+(target-cameraY)*(1-Math.exp(-10*dt)),0,stageHeight-H);scene.cameras.main.setScroll(0,cameraY);}

function preloadArt(){
 for(const [name,url] of Object.entries(window.DREAM_ART||{})){
  if(/^(equipped|attack)-/.test(name))this.load.spritesheet('art-'+name,url,{frameWidth:256,frameHeight:256});
  else if(name.startsWith('reinaAtlas'))this.load.spritesheet(name==='reinaAtlas'?'art-reina':name==='reinaAtlasBlue'?'art-reina-dress-blue':'art-reina-dress-red',url,{frameWidth:112,frameHeight:144});
  else this.load.image('art-'+name,url);
 }
}
function createArt(){
 // Temporary preview fallback only; release build embeds parent expeditionWorld.
 if(!scene.textures.exists('art-expeditionWorld')){const bg=scene.textures.createCanvas('art-expeditionFallback',W,1800),image=scene.textures.get('art-expedition').getSourceImage();for(let y=0;y<1800;y+=H)bg.context.drawImage(image,0,y,W,H);bg.refresh();}
 // Outfit atlases are supplied precolored: blonde hair and skin remain untouched.
 const shadow=scene.textures.createCanvas('art-shadow',100,40),c=shadow.context;
 const gradient=c.createRadialGradient(50,20,0,50,20,49);gradient.addColorStop(0,'rgba(51,39,37,.3)');gradient.addColorStop(1,'rgba(51,39,37,0)');c.fillStyle=gradient;c.fillRect(0,0,100,40);shadow.refresh();
}
function poseOutfitTexture(base){
 for(const cached of poseVariantCache)if(home.outfit==='armor'||!cached.endsWith('-'+home.outfit)){scene.textures.remove(cached);poseVariantCache.delete(cached);}
 if(home.outfit==='armor')return base;
 const key=base+'-'+home.outfit;if(scene.textures.exists(key))return key;
 // Lazy torso-only gold mask; hair, flesh, weapon pixels outside torso remain exact.
 const source=scene.textures.get(base).getSourceImage(),t=scene.textures.createCanvas(key,source.width,source.height),c=t.context;c.drawImage(source,0,0);
 const image=c.getImageData(0,0,source.width,source.height),data=image.data,blue=home.outfit==='dress-blue';
 for(let row=0;row<4;row++)for(let col=0;col<4;col++)for(let y=140;y<171;y++)for(let x=110;x<147;x++){
  if(Math.abs(x-128)>18-(y-140)*.12)continue;
  const i=((row*256+y)*source.width+col*256+x)*4,r=data[i],g=data[i+1],b=data[i+2];
  if(data[i+3]<100||r-g<24||g-b<22)continue;
  const light=(r+g+b)/3/180;data[i]=Math.min(255,(blue?77:184)*light);data[i+1]=Math.min(255,(blue?132:78)*light);data[i+2]=Math.min(255,(blue?184:99)*light);
 }
 c.putImageData(image,0,0);t.refresh();for(let i=0;i<16;i++)t.add(i,0,i%4*256,Math.floor(i/4)*256,256,256);
 poseVariantCache.add(key);return key;
}
function createBody(sprite,r,cx,cy){
 scene.physics.add.existing(sprite);sprite.body.setCircle(r,cx-r,cy-r);sprite.body.setAllowGravity(false);return sprite.body;
}
function onArtAttack(){
 if(artState.attackAt===artState.clock)return;
 artState.attackAt=artState.clock;
}
function onArtHit(target){
 if(hitTimes.get(target)===artState.clock)return;
 hitTimes.set(target,artState.clock);artState.hitEffects.push({x:target.x,y:target.y-8,at:artState.clock,direction:target.reaction?.direction||combat.getFacing(),kind:target.reaction?.kind||state.weapon});if(artState.hitEffects.length>24)artState.hitEffects.shift();
}
function advanceArt(dt){
 const dx=Number(state.keys.right)-Number(state.keys.left)+state.joy.x,dy=Number(state.keys.down)-Number(state.keys.up)+state.joy.y;
 artState.clock+=dt;
 if(dx||dy){artState.direction=Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up');artState.walk+=dt;}else artState.walk=0;
 artState.frame=artRows[artState.direction]*4+(dx||dy?Math.floor(artState.walk*9)%4:0);
 artState.hitEffects=artState.hitEffects.filter(hit=>artState.clock-hit.at<.32);
}
function syncViews(){
 if(!scene)return;
 const active=new Set([...state.monsters,...state.bubbles]);
 for(const [entity,view] of entityViews)if(!active.has(entity)){
  for(const key of ['sprite','art','hp','shadow'])view[key]?.destroy();entityViews.delete(entity);
 }
 for(const [list,kind] of [[state.monsters,'monster'],[state.bubbles,'bubble']])for(const entity of list){
  let view=entityViews.get(entity);
  if(!view){
   // Unscaled proxies preserve the original (r-3)/18 collision circles exactly.
   const radius=kind==='monster'?entity.r-3:entity.r;
   const sprite=scene.add.zone(entity.x,entity.y,radius*2,radius*2);createBody(sprite,radius,radius,radius);
   const size=kind==='bubble'?32:entity.type==='bear'?80:entity.type==='wolf'?65:55;
   const art=scene.add.image(entity.x,entity.y,'art-'+entity.type).setDisplaySize(size,size);
   const shadow=scene.add.image(entity.x,entity.y,'art-shadow').setDisplaySize(size,20);
   const hp=kind==='monster'?scene.add.rectangle(0,0,1,3,0x9c5b52).setOrigin(0,0):null;
   view={sprite,art,shadow,hp,kind,size};entityViews.set(entity,view);
  }
  view.sprite.setPosition(entity.x,entity.y);view.sprite.body.reset(entity.x,entity.y);
  view.art.setPosition(entity.x,entity.y).setDepth(entity.y);
  view.shadow.setPosition(entity.x,entity.y+view.size*.36).setDepth(entity.y-1);
  const reaction=entity.reaction,dying=entity.status==='dying',death=dying?Math.min(1,entity.deathElapsed/.4):0;
  const pulse=reaction?Math.sin(Math.PI*Math.min(1,reaction.elapsed/.2)):0;
  const species=entity.type==='bear'?.6:entity.type==='wolf'?.85:1.15;
  const strength=(reaction?.kind==='hammer'?.28:reaction?.kind==='spear'?.15:.08)*species;
  view.art.setDisplaySize(view.size*(1+pulse*strength)*(1-death*.7),view.size*(1-pulse*strength)*(1-death*.7)).setAngle(dying?death*35:reaction?(reaction.direction.x>=0?1:-1)*pulse*(reaction.kind==='hammer'?18:9):0).setAlpha(dying?1-death:1);
  const flash=kind==='monster'&&artState.clock-(hitTimes.get(entity)??-10)<.08;
  view.art.setBlendMode(flash?Phaser.BlendModes.ADD:Phaser.BlendModes.NORMAL);
  if(flash)view.art.setTintFill(0xfff3cf);else view.art.clearTint();
  view.shadow.setAlpha(1-death);view.hp?.setAlpha(dying?0:1);
  view.hp?.setPosition(entity.x-16,entity.y-view.size/2-8).setSize(Math.max(3,entity.hp*10),3).setDepth(entity.y+1);
 }
 playerSprite.setPosition(state.player.x,state.player.y);playerSprite.body.reset(state.player.x,state.player.y);
}
function draw(){
 if(!scene)return;syncViews();
 const mode=state.mode==='team'?priorMode:state.mode,town=mode==='village'||mode==='shop',p=state.player;
 backdrop.setTexture('art-'+(town?mode:scene.textures.exists('art-expeditionWorld')?'expeditionWorld':'expeditionFallback'));effects.clear();
 for(const {art,hp,shadow} of entityViews.values()){const visible=!town&&art.y>cameraY-100&&art.y<cameraY+H+100;art.setVisible(visible);shadow.setVisible(visible);hp?.setVisible(visible);}
 const a=combat.getAttack(),q=combat.getCharging(),attacking=!!a;
 const phase=a?Math.min(1,a.elapsed/(a.definition.windup+a.definition.active)):0;
 const dir=a?.direction||q?.direction||combat.getFacing(),side=dir.x<0?-1:1,baseAngle=Math.atan2(dir.y,dir.x)*180/Math.PI;
 const activeProgress=a?Phaser.Math.Clamp((a.elapsed-a.definition.windup)/a.definition.active,0,1):0;
 const angle=attacking?baseAngle+(a.kind==='spin'?activeProgress*360:(-50+activeProgress*100)*a.alternate):baseAngle;
 const outfit=home.outfit==='armor'?'art-reina':'art-reina-'+home.outfit;
 const visualDirection=town?artState.direction:Math.abs(dir.x)>Math.abs(dir.y)?(dir.x<0?'left':'right'):(dir.y<0?'up':'down');
 const visualFrame=artRows[visualDirection]*4+(attacking?0:artState.frame%4);
 const selected=selectWeaponPose({weapon:state.weapon,direction:dir,attack:a,charging:q,walkFrame:artState.frame%4});
 const whole=!town&&!!window.DREAM_POSES&&scene.textures.exists('art-'+selected.texture);
 currentPose=whole?selected:null;
 if(whole){const texture=poseOutfitTexture('art-'+selected.texture);reinaView.setTexture(texture,selected.frame).setOrigin(128/256,188/256).setScale(1).setAngle(0);}
 else reinaView.setTexture(outfit,visualFrame).setOrigin(56/112,111/144).setScale(1).setAngle(attacking?side*(-7+phase*12):0);
 reinaView.setPosition(p.x,p.y).setDepth(p.y+2);
 playerShadow.setPosition(p.x,p.y+22).setDepth(p.y-2);
 // A real articulated forearm and native weapon sweep change the silhouette.
 attackArm.setVisible(attacking&&!town&&!whole).setPosition(p.x+side*10,p.y-41).setDepth(p.y+3).setRotation(Phaser.Math.DegToRad(angle));
 const reach=a?.weapon==='spear'?Math.sin(phase*Math.PI)*88:attacking?35:19;
 weaponView.setVisible(!town&&!whole).setTexture('art-'+state.weapon).setCrop().setOrigin(.5,.8).setDisplaySize(state.weapon==='spear'?94:60,state.weapon==='spear'?94:60).setPosition(p.x+dir.x*reach,p.y-22+dir.y*reach).setAngle(state.weapon==='bow'?baseAngle:angle+90).setDepth(p.y+4);
 // Visible spear tip and hammer head use the same world coordinates as their damage shapes.
 if(!whole&&a?.weapon==='spear'){
  const w=a.definition,recovery=Phaser.Math.Clamp((a.elapsed-w.windup-w.active)/(w.period-w.windup-w.active),0,1);
  const extension=a.phase==='windup'?40*a.elapsed/w.windup:a.phase==='active'?w.length:w.length*(1-recovery);
  const tipOffset=(.8-.0625)*94;
  weaponView.setAngle(baseAngle+90).setPosition(p.x+dir.x*(extension-tipOffset),p.y+dir.y*(extension-tipOffset));
 }
 if(!whole&&a?.weapon==='hammer'){
  const w=a.definition,recovery=Phaser.Math.Clamp((a.elapsed-w.windup-w.active)/(w.period-w.windup-w.active),0,1),windup=Phaser.Math.Clamp(a.elapsed/w.windup,0,1);
  const extension=a.phase==='recovery'?w.offset*(1-recovery)+24*recovery:w.offset;
  const lift=a.phase==='windup'?90*(1-windup):a.phase==='recovery'?32*recovery:0;
  const hx=p.x+dir.x*extension,hy=p.y+dir.y*extension-lift;
  weaponView.setCrop(40,30,174,78).setOrigin(.5,.27).setDisplaySize(82,112).setAngle(0).setPosition(hx,hy);
  effects.lineStyle(4,0xb39371,.85);effects.lineBetween(p.x+dir.x*10,p.y-30,hx,hy+12);
 }
 if(!town){
  drawCombatEffects();
  for(const {kind,art,size} of entityViews.values())if(kind==='bubble'){
   effects.fillStyle(0xd4edf1,.22);effects.fillCircle(art.x,art.y,25);effects.lineStyle(1.5,0xf5ffed,.8);effects.strokeCircle(art.x,art.y,25);effects.fillStyle(0xffffff,.7);effects.fillEllipse(art.x-10,art.y-13,8,4);
  }
  if(state.shield>0){effects.fillStyle(0xb6dfd4,.13);effects.fillEllipse(p.x,p.y-25,76,128);effects.lineStyle(2,0xe2f9ec,.75);effects.strokeEllipse(p.x,p.y-25,76,128);}
  for(const hit of artState.hitEffects){const age=(artState.clock-hit.at)/.32;effects.fillStyle(0xffe8a5,1-age);for(let i=0;i<5;i++){const a=i*Math.PI*2/5,r=9+age*24,x=hit.x+Math.cos(a)*r,y=hit.y+Math.sin(a)*r;effects.fillTriangle(x,y-4,x-3,y+3,x+3,y+3);}}
 }
}
function drawCombatEffects(){
 const snap=combat.snapshot(),p=state.player,a=combat.getAttack(),q=combat.getCharging();
 const commands=combatVFX({player:p,attack:a,projectiles:snap.projectiles,hits:artState.hitEffects,clock:artState.clock});artState.vfxCommands=commands.length;
 for(const c of commands){if(c.kind==='circle'){effects.fillStyle(c.color,c.alpha);effects.fillCircle(c.x,c.y,c.radius);}else{effects.lineStyle(c.width,c.color,c.alpha);if(c.kind==='line')effects.lineBetween(c.x,c.y,c.x2,c.y2);else if(c.kind==='ring')effects.strokeCircle(c.x,c.y,c.radius);else{effects.beginPath();effects.arc(c.x,c.y,c.radius,c.start,c.end,false);effects.strokePath();}}}

 if(a){const w=a.definition,d=a.direction,ang=Math.atan2(d.y,d.x),active=a.phase==='active';
  if(w.shape==='circle'){const x=p.x+d.x*w.offset,y=p.y+d.y*w.offset;effects.fillStyle(0xe4bc77,active?.16:.035);effects.fillCircle(x,y,w.radius);effects.lineStyle(active?3:1.5,0xd4aa70,active?.85:.45);effects.strokeCircle(x,y,w.radius);if(active&&a.weapon==='hammer'){effects.lineStyle(2,0xf6de9c,.8);effects.strokeCircle(x,y,w.radius*.72);}}
  if(w.shape==='sector'&&active){effects.fillStyle(0xf4dc9a,.17);effects.slice(p.x,p.y,w.radius,ang-w.angle*Math.PI/360,ang+w.angle*Math.PI/360,false);effects.fillPath();effects.lineStyle(3,0xf3d69a,.8);effects.beginPath();effects.arc(p.x,p.y,w.radius,ang-w.angle*Math.PI/360,ang+w.angle*Math.PI/360,false);effects.strokePath();}
  if(w.shape==='rect'&&a.phase!=='recovery'){const nx=-d.y*w.width/2,ny=d.x*w.width/2;effects.fillStyle(0xd8e6df,active?.20:.04);effects.fillPoints([{x:p.x+nx,y:p.y+ny},{x:p.x+d.x*w.length+nx,y:p.y+d.y*w.length+ny},{x:p.x+d.x*w.length-nx,y:p.y+d.y*w.length-ny},{x:p.x-nx,y:p.y-ny}],true);if(active){effects.lineStyle(4,0xe2e7cf,.9);effects.lineBetween(p.x,p.y,p.x+d.x*w.length,p.y+d.y*w.length);}}
 }
 if(q&&WEAPONS[state.weapon].charge){const ready=q.ready,r=27+Math.min(1,q.elapsed/WEAPONS[state.weapon].charge)*10;effects.lineStyle(ready?3:2,ready?0xe9c260:0xe5d9b9,.8);effects.strokeCircle(p.x,p.y-24,r);if(state.weapon==='bow'){const d=q.direction,n={x:-d.y,y:d.x},pull=3+18*Math.min(1,q.elapsed/WEAPONS.bow.charge);effects.lineStyle(1.5,0x82664a,.9);effects.lineBetween(p.x+n.x*25,p.y-20+n.y*25,p.x-d.x*pull,p.y-20-d.y*pull);effects.lineBetween(p.x-d.x*pull,p.y-20-d.y*pull,p.x-n.x*25,p.y-20-n.y*25);}}
 for(const b of snap.projectiles){if(b.kind==='orb'){effects.fillStyle(0xc4b0df,.18);effects.fillCircle(b.x,b.y,14);effects.fillStyle(0xc9b7e2,.95);effects.fillCircle(b.x,b.y,9);effects.lineStyle(1,0xfff4dd,1);effects.strokeCircle(b.x,b.y,9);}else{const len=Math.hypot(b.vx,b.vy),d={x:b.vx/len,y:b.vy/len},n={x:-d.y,y:d.x};effects.lineStyle(b.damage===2?4:3,0x96734f,1);effects.lineBetween(b.x-d.x*18,b.y-d.y*18,b.x,b.y);effects.fillStyle(b.damage===2?0xe5c77d:0xdce7dc,1);effects.fillTriangle(b.x+d.x*4,b.y+d.y*4,b.x-d.x*5+n.x*4,b.y-d.y*5+n.y*4,b.x-d.x*5-n.x*4,b.y-d.y*5-n.y*4);}}
 for(const m of snap.monsters)if(m.status==='dying'){const f=m.deathElapsed/.4;effects.fillStyle(0xe6dfcd,(1-f)*.7);for(let i=0;i<5;i++)effects.fillCircle(m.x+Math.cos(i*1.256)*(10+f*30),m.y+Math.sin(i*1.256)*(10+f*30),3*(1-f)+1);}
 for(const e of snap.effects)if(e.kind==='afterimage'){effects.fillStyle(0xe9dfbb,e.life*1.5);effects.fillEllipse(e.x,e.y-24,42,94);}
 if(snap.dodge.active){effects.lineStyle(2,0xf9edc6,.6);effects.lineBetween(p.x-snap.dodge.direction.x*42,p.y-snap.dodge.direction.y*42,p.x,p.y);}
 if(typeof dodgeButton!=='undefined'){dodgeButton.textContent=snap.dodge.cooldown>0?'회피 '+snap.dodge.cooldown.toFixed(1):'회피';dodgeButton.setAttribute('aria-disabled',String(snap.dodge.cooldown>0));}
}
function renderScene(){draw();if(scene){const renderer=scene.sys.game.renderer;renderer.preRender();scene.sys.render(renderer);renderer.postRender();}}
function inspectArt(){
 const p=state.player,b=playerSprite.body;
 return {vfxCommands:artState.vfxCommands||0,poseTexture:reinaView.texture.key,poseState:currentPose?.state||'legacy',poseFrame:currentPose?.frame??Number(reinaView.frame.name),weaponAttached:!!currentPose,usesSeparateWeapon:weaponView.visible,world:inspectWorld(),direction:['down','left','right','up'][Math.floor(Number(reinaView.frame.name)/4)],frame:Number(reinaView.frame.name),pose:currentPose?(combat.getAttack()?'attack':currentPose.state):artState.clock-artState.attackAt<.18&&state.swing>0?'attack':'idle',clock:artState.clock,height:120,visualHeight:120,attackEffects:attackArm.visible?1:0,anchor:currentPose?{x:128,y:188}:{x:56,y:111},player:{x:p.x,y:p.y},playerBody:{x:b.center.x,y:b.center.y,radius:b.radius},armAngle:attackArm.angle,weaponAngle:weaponView.angle,weaponPoint:(()=>{const featureY=state.weapon==='spear'?.0625:state.weapon==='hammer'?.27:.09;const localY=(featureY-weaponView.originY)*weaponView.displayHeight;return {x:weaponView.x-Math.sin(weaponView.rotation)*localY,y:weaponView.y+Math.cos(weaponView.rotation)*localY};})(),hitEffects:artState.hitEffects.length,background:backdrop.texture.key,outfit:reinaView.texture.key,shadow:playerShadow.visible};
}
function advanceArcade(dt){
 const world=scene.physics.world;
 for(const body of world.bodies.entries)if(body.enable)body.preUpdate(false,dt);
 world.step(dt);world.postUpdate();
}
function preparePlayer(){
 const p=state.player;
 playerSprite.setPosition(p.x,p.y);playerSprite.body.reset(p.x,p.y);
 const bottom=H-24,top=state.mode==='playing'?55:225;
 playerSprite.body.setBoundsRectangle(new Phaser.Geom.Rectangle(0,top-p.r,W,bottom-top+2*p.r));
 playerSprite.body.setCollideWorldBounds(true);
 const dx=Number(state.keys.right)-Number(state.keys.left)+state.joy.x;
 const dy=Number(state.keys.down)-Number(state.keys.up)+state.joy.y;
 const length=Math.max(1,Math.hypot(dx,dy)),speed=state.mode==='playing'?330:240;
 playerSprite.body.setVelocity(dx/length*speed,dy/length*speed);
}
function within(x,y,r){return Phaser.Math.Distance.Between(state.player.x,state.player.y,x,y)<r}
let testSpawns=true;
const combat=createCombat(state,{attack:onArtAttack,hit:onArtHit});
function combatInput(){return {x:Number(state.keys.right)-Number(state.keys.left)+state.joy.x,y:Number(state.keys.down)-Number(state.keys.up)+state.joy.y};}
function update(dt){
 if(!scene||!Number.isFinite(dt)||dt<0)return;
 if(state.mode==='playing'){
  advanceArt(dt);state.time+=dt;state.score+=dt*2;
  if(state.time>=3&&!state.met){meet();draw();return;}
  combat.step(dt,combatInput());followCamera(dt);
  if(state.health<=0){end();draw();return;}
  for(let i=state.bubbles.length-1;i>=0;i--){const b=state.bubbles[i];b.life-=dt;if(Math.hypot(b.x-state.player.x,b.y-state.player.y)<34){if(WEAPONS[b.type])combat.setWeapon(b.type);else if(b.type==='shield')state.shield=3;state.bubbles.splice(i,1);}else if(b.life<=0)state.bubbles.splice(i,1);}
  if(testSpawns){state.spawn+=dt;while(state.spawn>=Math.max(.7,1.6-state.time*.015)){state.spawn-=Math.max(.7,1.6-state.time*.015);spawn();}state.bubbleSpawn+=dt;while(state.bubbleSpawn>=4.5){state.bubbleSpawn-=4.5;const types=['sword','spear','hammer','bow','wand','shield'];spawnBubbleAt(types[Math.floor(Math.random()*types.length)],35+Math.random()*(W-70),cameraY+130+Math.random()*300);}}
  updateWeaponHUD();scoreEl.textContent=String(Math.floor(state.score));draw();return;
 }
 updateLegacy(dt);
}
function updateLegacy(dt){
 if(!scene||!Number.isFinite(dt)||dt<0||!['village','shop'].includes(state.mode))return;
 advanceArt(dt);syncViews();preparePlayer();
 for(const {sprite} of entityViews.values()){sprite.body.moves=false;sprite.body.setVelocity(0);}
 advanceArcade(dt);state.player.x=playerSprite.x;state.player.y=playerSprite.y;
 if(state.mode==='village'&&within(210,320,53))enterShop();
 else if(state.mode==='shop'){
  if(within(155,355,61)&&(!state.passedOwner||state.pendingReward))passOwner();
  else if(state.passedOwner&&!state.pendingReward&&within(330,290,56))start();
 }
 draw();
}
function bootEngine(){
 game=new Phaser.Game({type:Phaser.CANVAS,canvas,width:W,height:H,backgroundColor:'#0b1431',banner:false,
  audio:{noAudio:true},input:{keyboard:false,mouse:false,touch:false},
  physics:{default:'arcade',arcade:{gravity:{x:0,y:0},fixedStep:false}},
  scene:{key:'DreamAdventure',preload:preloadArt,create(){
   scene=this;this.physics.disableUpdate();createArt();
   backdrop=this.add.image(0,0,'art-village').setOrigin(0).setDepth(-1000);
   effects=this.add.graphics().setDepth(10000);
   playerSprite=this.add.zone(state.player.x,state.player.y,32,32);
   createBody(playerSprite,16,16,16);
   reinaView=this.add.sprite(state.player.x,state.player.y,'art-reina',0).setOrigin(56/112,111/144);
   playerShadow=this.add.image(0,0,'art-shadow').setDisplaySize(62,21);
   weaponView=this.add.image(0,0,'art-branch').setOrigin(.5,.8);
   attackArm=this.add.container(0,0);
   attackArm.add(this.add.rectangle(0,9,7,22,0xf4d7b4).setStrokeStyle(1,0xc29a72));
   attackArm.add(this.add.circle(0,19,4,0xefc76c));
   // Phaser must not impose inline dimensions that bypass the existing responsive canvas CSS.
   canvas.style.width='100%';canvas.style.height='auto';draw();
   window.__neonTest=testAPI;window.__combatTest=combatTest;
   Object.assign(window.__neonTest,{
    art:inspectArt,world:inspectWorld,snapCamera,render:renderScene,
    collisions:()=>[...entityViews].map(([e,v])=>({type:e.type,x:e.x,y:e.y,bodyX:v.sprite.body.center.x,bodyY:v.sprite.body.center.y,radius:v.sprite.body.radius,enabled:v.sprite.body.enable,playerX:playerSprite.body.center.x,playerY:playerSprite.body.center.y,overlap:scene.physics.overlap(playerSprite,v.sprite)})),
    setAutoStep(value){autoStep=!!value},
    engine:()=>({version:Phaser.VERSION,sceneActive:scene.sys.isActive(),arcade:scene.physics.world instanceof Phaser.Physics.Arcade.World,nativeObjects:scene.children.length,arcadeBodies:scene.physics.world.bodies.size,autoStep}),
    state:()=>JSON.parse(JSON.stringify(state)),home:()=>JSON.parse(JSON.stringify(home)),
    entities:()=>state.monsters.map(({x,y,hp,r,type})=>({x,y,hp,r,type}))
   });
  },update(_time,delta){if(autoStep)update(Math.min(delta/1000,.05))}}
 });
}
