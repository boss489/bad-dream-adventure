// Cosmetic-only bounded drawing commands. Never changes combat time or hit geometry.
function combatVFX({player:p,attack:a=null,projectiles=[],hits=[],clock=0}={}){
 const out=[],add=(kind,o)=>out.push({kind,...o}),line=(x,y,x2,y2,width,color,alpha)=>add('line',{x,y,x2,y2,width,color,alpha});
 if(a){const w=a.definition,d=a.direction,ang=Math.atan2(d.y,d.x),active=a.phase==='active',t=Math.max(0,Math.min(1,(a.elapsed-w.windup)/w.active));
  if(active&&(w.shape==='sector'||a.kind==='spin')){
   const spin=a.kind==='spin',radius=w.radius,center=ang+(spin?t*Math.PI*2:((t-.5)*.7*(a.alternate||1))),span=spin?Math.PI*1.6:w.angle*Math.PI/180;
   for(const [i,width,color,alpha]of [[0,16,0xf4bbd0,.15],[1,8,0xffdc8f,.42],[2,2.5,0xfffde4,.95]])add('arc',{x:p.x,y:p.y,radius:radius-i*5,start:center-span/2,end:center+span/2,width,color,alpha});
   if(spin)add('ring',{x:p.x,y:p.y,radius:radius*(.6+.35*t),width:2,color:0xf8eed1,alpha:.65*(1-t)});
  }
  if(a.weapon==='spear'&&active){const x=p.x+d.x*w.length,y=p.y+d.y*w.length;for(const [width,color,alpha]of [[14,0x9bdedc,.14],[6,0xc7f6e7,.55],[2,0xfffdeb,1]])line(p.x,p.y,x,y,width,color,alpha);for(let i=0;i<6;i++){const r=8+t*20,b=ang+i*Math.PI/3;line(x+Math.cos(b)*r*.4,y+Math.sin(b)*r*.4,x+Math.cos(b)*r,y+Math.sin(b)*r,2,0xffefc4,1-t*.6);}}
  if(a.weapon==='hammer'){
   const x=p.x+d.x*w.offset,y=p.y+d.y*w.offset;
   if(active||a.phase==='recovery'&&a.elapsed-w.windup-w.active<.18){const age=active?t:(a.elapsed-w.windup)/(.18+w.active);for(let i=0;i<3;i++)add('ring',{x,y,radius:Math.min(w.radius+14,(.3+i*.22+age*.3)*w.radius),width:3-i*.6,color:i===0?0xffedb4:0xe9bdd0,alpha:Math.max(0,.7-age*.55)});for(let i=0;i<9;i++){const b=i*Math.PI*2/9,r=28+age*70;add('circle',{x:x+Math.cos(b)*r,y:y+Math.sin(b)*r*.5,radius:2+(i%3),color:0xf9e2c2,alpha:.55*(1-age)});}}
   else if(a.phase==='windup')add('arc',{x:p.x-d.x*14,y:p.y-52,radius:34,start:Math.PI,end:Math.PI*1.85,width:3,color:0xffefbb,alpha:.5});
  }
 }
 for(const b of projectiles){const speed=Math.hypot(b.vx,b.vy)||1,dx=b.vx/speed,dy=b.vy/speed;
  if(b.kind==='arrow'&&b.damage===2)for(const [width,color,alpha,length]of [[10,0xf6c3ce,.15,65],[5,0xffe4a1,.5,45],[1.5,0xffffef,.95,34]])line(b.x-dx*length,b.y-dy*length,b.x,b.y,width,color,alpha);
  if(b.kind==='orb')for(let i=0;i<5;i++)add('circle',{x:b.x-dx*i*8+Math.sin(clock*7+i)*4,y:b.y-dy*i*8+Math.cos(clock*7+i)*4,radius:7-i,color:i%2?0xffe7b8:0xc6b5ef,alpha:(5-i)*.08});
 }
 for(const h of hits.slice(-24)){const age=(clock-h.at)/.32;if(age<0||age>1)continue;const d=h.direction||{x:1,y:0},ang=Math.atan2(d.y,d.x);for(let i=0;i<7;i++){const angle=ang+(i-3)*.35,r=8+age*(24+i*3);line(h.x+Math.cos(angle)*r*.5,h.y+Math.sin(angle)*r*.5,h.x+Math.cos(angle)*r,h.y+Math.sin(angle)*r, i%2?2:3,i%2?0xfffbe3:0xf7bdd1,1-age);}
  if(h.kind==='bow')for(let i=0;i<4;i++){const angle=i*Math.PI/2+age,r=5+age*15;line(h.x-Math.cos(angle)*r,h.y-Math.sin(angle)*r,h.x+Math.cos(angle)*r,h.y+Math.sin(angle)*r,2,0xffedaa,1-age);}
 }
 return out.slice(0,256);
}
if(typeof module!=='undefined')module.exports={combatVFX};
