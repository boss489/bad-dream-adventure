// Presentation only. Catalog IDs, prices, storage, actions and simulation stay in game.js.
document.body.dataset.artStyle='storybook';
const storyIcons={
 branch:'<path d="M22 52 43 14M30 38 17 29M36 27 49 24" stroke="#977558" stroke-width="5"/><path d="M20 30Q8 16 23 20L29 31M40 26Q45 10 54 17L46 26" fill="#99bba0"/>',
 sword:'<path d="m20 47 24-34 7-4 1 9-26 33Z" fill="#d2e1dc"/><path d="m18 39 15 12M22 46l-7 10" stroke="#bc945e" stroke-width="5"/>',
 spear:'<path d="m17 56 28-38" stroke="#977558" stroke-width="4"/><path d="m37 24 8-18 9 4-3 19-8-7Z" fill="#d2e1dc"/><path d="m38 27 10 7" stroke="#bc945e" stroke-width="3"/>',
 shield:'<path d="M15 15 32 8l17 7v19Q47 46 32 56 17 46 15 34Z" fill="#a8c6bd"/><path d="m32 17 8 14-8 15-8-15Z" fill="#f1d99b"/>',
 flowers:'<path d="M19 54V28m23 26V21m-10 33V35" stroke="#829f78" stroke-width="3"/><path d="m18 45-9-7m32 1 11-8"/><g fill="#dca5af"><circle cx="19" cy="21" r="8"/><circle cx="12" cy="28" r="7"/><circle cx="25" cy="28" r="7"/></g><g fill="#c4b3d8"><circle cx="42" cy="15" r="8"/><circle cx="35" cy="22" r="7"/><circle cx="48" cy="22" r="7"/></g><circle cx="19" cy="27" r="4" fill="#ecd29b"/><circle cx="42" cy="21" r="4" fill="#ecd29b"/>',
 path:'<path d="m12 45 11-5 9 5-2 10H16Zm23-21 13-3 7 8-7 9-13-3ZM18 8l12-2 7 10-9 8-14-6Z" fill="#d4c9ba"/>',
 lamp:'<path d="M32 29v25m-11 1h22M15 31 22 9h20l8 22Z" fill="#efcf92"/><path d="M20 31h25M25 14l-3 12" stroke="#fff2ce" stroke-width="3"/>',
 table:'<path d="M12 28h40v11H12Zm5 11v16m30-16v16" fill="#c79b76" stroke-width="5"/><path d="M18 28 22 18h21l8 10" fill="#e0bb91"/><path d="M27 21v-8m-4 0h8" stroke="#9ba980"/><circle cx="27" cy="12" r="4" fill="#d9aaa5"/>',
 bed:'<path d="M10 18h44v35H10Z" fill="#bf9c7c"/><path d="M14 22h36v25H14Z" fill="#c2b4d5"/><rect x="18" y="23" width="28" height="9" rx="4" fill="#fff5e3"/><path d="M15 35h34M12 53v4m40-4v4"/>',
 crops:'<path d="M25 25Q7 23 17 45l6 13 15-26Z" fill="#e8ac7e"/><path d="m26 25-5-15m7 15L35 9m-7 15 15-9" stroke="#88a889" stroke-width="5"/><path d="m20 35 8 3m-5 7 5 2"/>',
 fence:'<path d="M10 31h44v9H10Z" fill="#dfc29c"/><path d="m15 53 1-34 6-8 6 8-1 34m13 0V19l6-8 6 8v34" fill="#d0ad88"/>',
 plant:'<path d="M28 57V25h8v32" fill="#bc9676"/><path d="M32 9Q17 3 15 19 1 22 11 36q-2 14 20 10 22 6 23-10 11-15-5-19Q46 4 32 9Z" fill="#a8c5a3"/><circle cx="20" cy="25" r="3" fill="#e5b4b5"/><circle cx="42" cy="34" r="4" fill="#e5b4b5"/>',
 seeds:'<path d="M14 13h36l-4 43H18Z" fill="#f0d6a8"/><path d="M16 20h32"/><path d="M32 45V30m0 8Q14 34 23 25q11-1 9 13m0-4q0-14 12-13 6 10-12 13" fill="#a7bd94"/>',
 ornament:'<path d="M32 7v8m-12 0h24l7 16-7 17H20l-7-17Zm12 33v9m-6 0h12" fill="#e8b8a7"/><path d="M25 18v27m14-27v27M17 31h30" stroke="#f7e0bb"/>',
 'dress-blue':'<path d="m23 10 9 6 9-6 13 13-9 7-4-5 11 30H12l11-30-4 5-9-7Z" fill="#a7bfd6"/><path d="M24 35h17m-9 2v15" stroke="#fff2d5" stroke-width="3"/>',
 'dress-red':'<path d="m23 10 9 6 9-6 13 13-9 7-4-5 11 30H12l11-30-4 5-9-7Z" fill="#d9a3aa"/><path d="M24 35h17m-9 2v15" stroke="#fff2d5" stroke-width="3"/>',
 potion:'<path d="M25 9h14v14q15 8 12 24-2 11-19 11T13 47q-3-16 12-24Z" fill="#e2e9db"/><path d="M16 37q17-6 32 0v10q-2 8-16 8t-16-8Z" fill="#c3afd3"/><path d="M24 8h16v8H24Z" fill="#bf9c78"/><path d="M23 31q-7 5-6 12" stroke="#fff8e9" stroke-width="3"/>',
 groceries:'<path d="M12 32h40l-6 24H18Z" fill="#d7b48b"/><path d="M20 33q-1-29 24 0" fill="none" stroke-width="4"/><path d="M31 22q-12-10-15 2-3 14 14 16 18-3 15-16-2-10-14-2" fill="#dca29b"/><path d="M31 22q-1-12 9-12-1 9-9 12" fill="#98b18c"/>',
 heart:'<path d="M32 54 13 34Q1 14 18 10q10-3 14 9 8-15 20-6 13 13-2 27Z" fill="#d6959d"/>',
 gem:'<path d="m12 23 12-13h18l11 13-21 32Z" fill="#c2b5d7"/><path d="m12 23 41 0M24 10l-4 13 12 32 10-32-1-13" fill="none"/>',
 coin:'<circle cx="32" cy="32" r="23" fill="#e8cc8d"/><circle cx="32" cy="32" r="16" fill="none"/><path d="M32 21v22m-5-18h7q8 4 0 8h-5q-8 5 7 8" fill="none"/>'
};
function storyIcon(id,extra=''){
 const art=window.DREAM_ART?.[id];
 if(typeof art==='string'&&art.startsWith('data:image/'))return `<img class="item-art ${extra}" data-art="${id}" src="${art}" alt="" aria-hidden="true">`;
 return `<svg class="item-art ${extra}" data-art="${id}" viewBox="0 0 64 64" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><g stroke="#776957" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${storyIcons[id]||storyIcons.gem}</g></svg>`;
}
portrait=function(c){
 const i=Math.max(0,candidates.findIndex(row=>row.id===c.id));
 return `<svg class="story-portrait" viewBox="0 0 120 140" role="img" aria-label="${c.name} 캐릭터 초상화" xmlns="http://www.w3.org/2000/svg"><title>${c.name} 캐릭터 초상화</title><rect x="4" y="4" width="112" height="132" rx="48" fill="${['#eee1d5','#e2eadd','#eee0e5','#e3e4ee'][i%4]}" stroke="#bca88f" stroke-width="1.5"/><path d="M15 133q3-35 32-38h26q29 5 32 38" fill="${c.coat}" stroke="#776957" stroke-width="1.5"/><path d="M29 72Q11 13 56 13q49-5 37 60l${c.style==='long'?'8 46H21Z':'-2 16H30Z'}" fill="${c.hair}" stroke="#776957" stroke-width="1.5"/><path d="M49 87v17q11 13 22 0V87" fill="${c.skin}" stroke="#a3816b"/><ellipse cx="60" cy="58" rx="29" ry="35" fill="${c.skin}" stroke="#a3816b"/><path d="M31 56q-7-40 27-36 32-6 32 35-14-5-22-22-14 17-37 23Z" fill="${c.hair}" stroke="#776957" stroke-width="1.5"/><path d="M39 61q8-6 16-1m10 0q8-5 16 1" stroke="#665249" stroke-width="2" fill="none"/><ellipse cx="47" cy="64" rx="6" ry="5" fill="#fff9ef"/><ellipse cx="73" cy="64" rx="6" ry="5" fill="#fff9ef"/><circle cx="47" cy="64" r="4" fill="${c.eyes}"/><circle cx="73" cy="64" r="4" fill="${c.eyes}"/><circle cx="48" cy="62" r="1.4" fill="#fff"/><circle cx="74" cy="62" r="1.4" fill="#fff"/><path d="m39 60-3-3m4 3-1-4m40 4 3-3m-4 3 1-4" stroke="#665249" stroke-linecap="round"/><ellipse cx="39" cy="76" rx="5" ry="2.5" fill="#dca398" opacity=".6"/><ellipse cx="81" cy="76" rx="5" ry="2.5" fill="#dca398" opacity=".6"/><path d="m60 70-2 4h3m-6 8q5 4 10 0" fill="none" stroke="#a6726d" stroke-linecap="round"/><path d="m43 108 17 16 17-16m-17 16v10" fill="none" stroke="#fff2d3" stroke-width="3"/><path d="m60 111 4 5-4 6-4-6Z" fill="${c.eyes}" stroke="#e9cf91"/><path d="M81 36q12-12 17 0-7 9-17 0" fill="${['#e8cc91','#e5b6bb','#c5badb'][i%3]}" stroke="#927c69"/><circle cx="88" cy="36" r="2.5" fill="#fff2d3"/></svg>`;
};
function reinaPortrait(){const art=window.DREAM_ART?.reinaPortrait;return typeof art==='string'&&art.startsWith('data:image/')?`<img class="reina-portrait" src="${art}" alt="금발, 에메랄드 눈과 금빛 갑옷의 레이나 대장">`:portrait({id:'reina',name:'레이나',hair:'#e5c77d',skin:'#f7e3ce',coat:'#d4b474',eyes:'#579c83',style:'long'});}
renderTeam=function(){const names=team.map(id=>candidates.find(c=>c.id===id).name);document.querySelector('#team-line').innerHTML=`<span class="captain-portrait">${reinaPortrait()}</span><span><b>레이나 대장</b><br>${names.length===2?names.join(' · '):'팀원 2명을 선택해 주세요'}</span>`;};
function lotIllustration(area){const objects=area==='house'?'<path d="M30 82V43h60v39" fill="#f3dfc2"/><path d="m20 45 40-29 41 29Z" fill="#c7b1c9"/><path d="M54 82V58h15v24" fill="#b4c7bb"/><rect x="37" y="52" width="12" height="13" rx="2" fill="#ebce8f"/><rect x="76" y="52" width="10" height="13" rx="2" fill="#ebce8f"/><path d="M38 86h45m-35 5h29" stroke="#c4b8a3"/>':area==='yard'?'<path d="M49 83V46h7v37" fill="#bd9b7c"/><path d="M52 20Q32 13 27 30 8 31 20 52q-4 16 29 13 28 8 35-11 13-15-5-25-4-19-27-9Z" fill="#adc5a5"/><path d="m65 91 10-6 15 3-3 9H68" fill="#d6cab7"/><path d="m27 90-12-5m13 2-6-12" stroke="#88a381"/>':'<path d="m17 64 58-15 32 22-59 21Z" fill="#be9f81"/><path d="m27 65 24 16m-9-20 24 16m-9-20 24 16m-9-20 24 16" stroke="#e5c49c" stroke-width="3"/><path d="M35 64V49m15 11V40m16 17V39m15 15V37" stroke="#819d77" stroke-width="3"/><path d="M35 51q-14-12-13-1l13 6q14-10 13-15Zm16-9q-13-13-13 0l13 8q16-13 11-17Zm16 0q-11-12-14-3l14 9q14-10 9-15Zm15-3q-10-12-12-4l12 10q13-7 9-15Z" fill="#a7bd94"/>';
return `<svg class="lot-art" viewBox="0 0 120 104" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><ellipse cx="60" cy="85" rx="56" ry="16" fill="#c4d3af"/><g stroke="#8a7a64" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">${objects}</g></svg>`;}
renderHome=function(){
 document.querySelector('#coins').textContent=String(home.coins);document.querySelector('#gems').textContent=String(home.gems);document.querySelector('#gift-weapon').textContent=WEAPONS[home.weaponGift].name;document.querySelector('#inventory-potion').textContent=String(home.supplies.potion);document.querySelector('#inventory-food').textContent=String(home.supplies.groceries);document.querySelector('#outfit-name').textContent=home.outfit==='dress-blue'?'푸른 모험복':home.outfit==='dress-red'?'붉은 모험복':'금빛 갑옷';
 for(const area of ['yard','house','garden'])document.querySelector('#'+area+'-decor').innerHTML=catalog.filter(item=>item.area===area&&home.owned.includes(item.id)).map(item=>`<span class="placed-item" title="${item.name}">${storyIcon(item.id)}</span>`).join('');
 document.querySelector('#shop').innerHTML=catalog.map(item=>{const owned=home.owned.includes(item.id),wearing=home.outfit===item.id,canBuy=state.mode==='shop',disabled=!canBuy||(item.area!=='outfit'&&item.area!=='supply'&&owned)||(!owned&&home.coins<item.price);return `<button type="button" data-item="${item.id}" class="catalog-card ${owned?'owned':''}" ${disabled?'disabled':''}>${storyIcon(item.id)}<span class="item-copy"><span class="item-name">${item.name}</span><span class="item-price">${wearing?'착용 중':owned&&item.area==='outfit'?'입기':owned&&item.area!=='supply'?'구입 완료':item.price+' 코인'}</span></span></button>`}).join('');
};
updateWeaponHUD=function(){const w=WEAPONS[state.weapon],q=combat.getCharging();const signature=[state.health,state.shield,state.weapon,state.kills,state.mode,home.supplies.potion,home.supplies.groceries,q?q.elapsed.toFixed(1):'',q?.ready].join('|');if(updateWeaponHUD.signature===signature){refreshSupplies();return}updateWeaponHUD.signature=signature;document.querySelector('#combat-hud').innerHTML=`<span>${storyIcon('heart')}<span class="sr-only">체력 </span>${state.health}/3</span><span>${storyIcon('shield')}<span class="sr-only">방패 </span>${state.shield}</span><span>${storyIcon(state.weapon)}${w.name}${w.charge?' · 충전 '+(q?.ready?'완료':q?q.elapsed.toFixed(1)+'s':'가능'):''}</span><span>처치 <span id="kills">${state.kills}</span></span>`;refreshSupplies();};
// Replace decorative text nodes, never action nodes/listeners.
document.querySelector('.home h2').innerHTML=storyIcon('plant')+' 레이나의 보금자리';
document.querySelector('.home h3').textContent='꿈나라 상점';
const lotPlaceholders=[...document.querySelectorAll('.lot .emoji')];for(const [i,area] of ['yard','house','garden'].entries())lotPlaceholders[i].outerHTML=lotIllustration(area);
for(const node of document.querySelector('.wallet').childNodes)if(node.nodeType===Node.TEXT_NODE)node.textContent=node.textContent.replace(/\p{Extended_Pictographic}|\uFE0F/gu,'');
document.querySelector('.wallet').insertAdjacentHTML('afterbegin',storyIcon('coin'));
document.querySelector('#team-open').innerHTML='<span class="team-dot" aria-hidden="true"></span> 원정대 편성';
document.querySelector('#team-title').textContent='함께 떠날 두 사람';
document.querySelector('#npc-name').textContent='길에서 만난 미나';
document.querySelector('#npc-name').insertAdjacentHTML('beforebegin',`<div class="npc-portrait">${portrait({id:'mina',name:'미나',hair:'#79604a',skin:'#efd2b8',coat:'#aabca1',eyes:'#7b947c',style:'bob'})}</div>`);
document.querySelector('#potion-use').innerHTML=storyIcon('potion')+'<span>포션</span>';
document.querySelector('#food-use').innerHTML=storyIcon('groceries')+'<span>식료품</span>';
document.querySelector('#shop-entrance').textContent='꿈나라 가게에 들어가기';
document.querySelector('#owner-action').textContent='주인에게 가기';
document.querySelector('#bed-action').textContent='오른쪽 침대에 눕기';
const oldReina=headline.nextElementSibling;if(oldReina?.tagName.toLowerCase()==='svg')oldReina.outerHTML=reinaPortrait();
renderTeam();renderHome();updateWeaponHUD();
