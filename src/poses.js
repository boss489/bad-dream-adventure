// Pure phase-to-keyframe selection: combat time, never cosmetic art clock.
function selectWeaponPose({weapon,direction={x:0,y:1},attack=null,charging=null,walkFrame=0}){
 const d=attack?.direction||charging?.direction||direction;
 const facing=Math.abs(d.x)>Math.abs(d.y)?(d.x<0?'left':'right'):(d.y<0?'up':'down');
 const rows={down:0,left:1,right:2,up:3};
 let state=charging?(charging.ready?'charge':'hold'):'equipped',column=charging?0:walkFrame%4;
 if(attack){state=attack.phase;column=state==='windup'?0:state==='recovery'?3:1+Number((attack.elapsed-attack.definition.windup)/attack.definition.active>=.5);
  // Projectile damage timing remains untouched; retain its release drawing
  // briefly so 20fps devices do not skip a <50ms active visual entirely.
  if((weapon==='bow'||weapon==='wand')&&attack.elapsed<.18)column=attack.elapsed<.09?1:2;
 }
 if(charging&&weapon==='bow')column=charging.ready?2:1;
 return {texture:(attack||(charging&&weapon==='bow')?'attack-':'equipped-')+weapon,state,frame:rows[facing]*4+column,direction:facing};
}
if(typeof module!=='undefined')module.exports={selectWeaponPose};
