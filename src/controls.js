// All inputs share the same press/release/cancel execution path.
let attackPointer=null;
const attackButton=document.querySelector('#attack');
document.querySelector('.controls').insertAdjacentHTML('beforeend','<button id="dodge" class="dodge" type="button" aria-label="회피">회피</button>');
const dodgeButton=document.querySelector('#dodge');
function resetCombatInput(){combat.cancel();attackPointer=null;for(const k of Object.keys(state.keys))state.keys[k]=false;resetJoystick();}
const oldSync=syncJoystick;
syncJoystick=function(){if(state.mode!=='playing')resetCombatInput();oldSync();dodgeButton.classList.toggle('active',state.mode==='playing');};
attackButton.addEventListener('pointerdown',e=>{if(state.mode!=='playing'||attackPointer!==null)return;e.preventDefault();attackPointer=e.pointerId;try{attackButton.setPointerCapture(e.pointerId);}catch{}combat.press();draw();});
attackButton.addEventListener('pointerup',e=>{if(e.pointerId!==attackPointer)return;e.preventDefault();attackPointer=null;if(state.mode==='playing')combat.release();else combat.cancel();draw();});
for(const type of ['pointercancel','lostpointercapture'])attackButton.addEventListener(type,e=>{if(attackPointer===e.pointerId){resetCombatInput();draw();}});
// Accessible non-pointer activation remains a single tap, never a second attack after pointerup.
attackButton.addEventListener('click',e=>{if(e.detail===0&&state.mode==='playing')attack();});
dodgeButton.addEventListener('pointerdown',e=>{e.preventDefault();if(state.mode==='playing'){combat.dodge(combatInput());attackPointer=null;draw();}});
dodgeButton.addEventListener('click',e=>{if(e.detail===0&&state.mode==='playing'){combat.dodge(combatInput());draw();}});
key=function(e,down){
 if(!['playing','shop','village'].includes(state.mode))return;
 if(['Space','ShiftLeft','ShiftRight','ArrowLeft','ArrowRight','ArrowUp','ArrowDown','KeyA','KeyD','KeyW','KeyS'].includes(e.code))e.preventDefault();
 const map={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',ArrowUp:'up',KeyW:'up',ArrowDown:'down',KeyS:'down'};if(map[e.code])state.keys[map[e.code]]=down;
 if(state.mode==='playing'&&e.code==='Space'){if(down&&!e.repeat)combat.press();else if(!down)combat.release();}
 if(state.mode==='playing'&&down&&!e.repeat&&e.code.startsWith('Shift')){combat.dodge(combatInput());attackPointer=null;}
};
window.addEventListener('blur',resetCombatInput);window.addEventListener('pointercancel',resetCombatInput);
document.addEventListener('visibilitychange',()=>{if(document.hidden)resetCombatInput();});
const oldMovePointer=movePointer;
movePointer=function(e){const before={x:state.player.x,y:state.player.y},walking=state.mode==='playing';oldMovePointer(e);if(walking&&state.mode==='playing'){const delta={x:state.player.x-before.x,y:state.player.y-before.y};if(Math.hypot(delta.x,delta.y)>0)combat.setFacing(delta);draw();}};
const oldStart=start;start=function(){if(state.mode==='shop'&&state.passedOwner&&!state.pendingReward){combat.clear();combat.setFacing(({left:{x:-1,y:0},right:{x:1,y:0},up:{x:0,y:-1},down:{x:0,y:1}})[artState.direction]);resetCombatInput();testSpawns=true;artState.hitEffects=[];}oldStart();};
const oldEnd=end;end=function(returned=false){if(state.mode!=='playing')return;oldEnd(returned);configureWorld(600);combat.clear();state.bubbles=[];artState.hitEffects=[];resetCombatInput();draw();};
const combatTest={
 metadata:{version:1,characterHeight:120,simulation:'shared 240Hz substeps',projectilesOnModal:'freeze',arrowTTL:1.5},
 reset({weapon='branch',x=210,y=400,facing={x:1,y:0},spawns=false,met=true,worldHeight=1800}={}){autoStep=false;combat.clear();resetCombatInput();state.mode='playing';state.weapon=weapon;state.player.x=x;state.player.y=y;configureWorld(worldHeight);state.health=3;state.shield=0;state.invuln=0;state.kills=0;state.score=0;state.time=0;state.met=met;state.spawn=0;state.bubbleSpawn=0;state.bubbles=[];testSpawns=spawns;combat.setWeapon(weapon);combat.setFacing(facing);artState.hitEffects=[];dialog.classList.add('hidden');teamModal.classList.add('hidden');overlay.classList.add('hidden');returnBtn.disabled=false;syncJoystick();renderRoute();updateWeaponHUD();draw();return combat.snapshot();},
 setWeapon(name){combat.setWeapon(name);updateWeaponHUD();draw();},
 setPlayer({x,y,facing}){if(x!==undefined)state.player.x=x;if(y!==undefined)state.player.y=y;if(facing)combat.setFacing(facing);snapCamera();draw();},
 spawn(options){const id=combat.spawn(options);draw();return id;},
 removeMonster(id){state.monsters=state.monsters.filter(m=>m.id!==id);draw();},
 obstacle(o){combat.obstacle(o);draw();},clearObstacles(){combat.clearObstacles();},
 press(){if(state.mode==='playing')combat.press();draw();},release(){if(state.mode==='playing')combat.release();draw();},
 dodge(direction){if(state.mode==='playing')combat.dodge(direction);attackPointer=null;draw();},
 step(dt){update(dt);renderScene();},
 pause(){document.querySelector('#team-open').click();},resume(){if(state.mode==='team')document.querySelector('#team-close').click();},returnToVillage(){end(true);},
 world:inspectWorld,snapCamera,setWorldBounds({height=1800}={}){configureWorld(height);draw();},
 snapshot:()=>({...combat.snapshot(),world:inspectWorld()})
};
syncJoystick();
