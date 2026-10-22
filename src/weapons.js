const WEAPONS=Object.freeze({
 branch:{name:'나뭇가지',damage:1,windup:.08,active:.10,period:.38,shape:'sector',radius:96,angle:100,push:100},
 sword:{name:'칼',damage:2,windup:.08,active:.10,period:.32,shape:'sector',radius:156,angle:100,push:110,charge:.6},
 spear:{name:'창',damage:2,windup:.12,active:.10,period:.50,shape:'rect',length:264,width:48,push:160},
 hammer:{name:'망치',damage:3,windup:.30,active:.10,period:.95,shape:'circle',offset:108,radius:108,push:420},
 bow:{name:'활',damage:1,windup:0,active:.02,period:.45,shape:'arrow',push:90,charge:.7},
 wand:{name:'마법봉',damage:1,windup:0,active:.02,period:.65,shape:'orb',push:80}
});
if(typeof module!=='undefined')module.exports={WEAPONS};
