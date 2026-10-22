import {readFile,writeFile,mkdir} from 'node:fs/promises';
const root=new URL('./',import.meta.url),read=p=>readFile(new URL(p,root),'utf8');
const template=await read('src/template.html'),game=await read('src/game.js'),runtime=await read('src/runtime.js');
const phaser=await read('node_modules/phaser/dist/phaser.min.js'),pkg=JSON.parse(await read('node_modules/phaser/package.json'));
const phaserLicense=await read('node_modules/phaser/LICENSE.md');
if(pkg.version!=='3.90.0')throw Error('Expected pinned Phaser 3.90.0');
const manifest=JSON.parse(await read('assets/manifest.json')),art={};
for(const [key,name]of Object.entries(manifest))art[key]='data:image/png;base64,'+(await readFile(new URL('assets/'+name,root))).toString('base64');
// Release builds fail closed: no equipped/attack placeholder can be shipped.
const dev=process.argv.includes('--dev-allow-missing-poses');let poses=null;
try{
 poses=JSON.parse(await read('assets/weapon-poses.json'));
 if(poses.frameWidth!==256||poses.frameHeight!==256||poses.origin?.x!==128||poses.origin?.y!==188||JSON.stringify(poses.directions)!==JSON.stringify(['down','left','right','up']))throw Error('Invalid weapon pose contract');
 for(const weapon of ['branch','sword','spear','hammer','bow','wand'])for(const state of ['equipped','attack']){
  const path=poses.weapons?.[weapon]?.[state];if(!path||path.includes('..'))throw Error('Missing pose '+weapon+' '+state);
  const data=await readFile(new URL('assets/'+path,root));
  if(data.toString('hex',0,8)!=='89504e470d0a1a0a'||data.readUInt32BE(16)!==1024||data.readUInt32BE(20)!==1024)throw Error('Expected 1024x1024 PNG: '+path);
  art[state+'-'+weapon]='data:image/png;base64,'+data.toString('base64');
 }
}catch(e){if(!dev)throw Error('Release requires all 12 genuine pose assets: '+e.message);console.warn('DEVELOPMENT ONLY — pose dependency incomplete:',e.message);poses=null;for(const key of Object.keys(art))if(/^(equipped|attack)-/.test(key))delete art[key];}
let ui='',css='';try{ui=await read('src/ui.js')}catch{}try{css=await read('src/style.css')}catch{}
const combat=(await read('src/weapons.js'))+'\n'+(await read('src/combat.js'))+'\n'+(await read('src/poses.js'))+'\n'+(await read('src/vfx.js'));
let source=game.replace('/* ENGINE_UPDATE */',combat+'\n'+runtime).replace('/* ENGINE_RENDER */','');
ui+='\n'+await read('src/controls.js');
if(source.includes('/* STORYBOOK_UI */'))source=source.replace('/* STORYBOOK_UI */',ui);else source=source.replace('const testAPI=',ui+'\nconst testAPI=');
const inline=s=>s.replace(/<\/script/gi,'<\\/script');
const html=template.replace('</head>','<style>'+css+'</style></head>').replace('<!-- PHASER -->','<!-- Phaser license\n'+phaserLicense+'\n--><script>window.DREAM_ART='+JSON.stringify(art)+';window.DREAM_POSES='+JSON.stringify(poses)+';</script><script>'+inline(phaser)+'</script>').replace('<!-- GAME -->',inline(source));
if(html.includes('/* ENGINE_UPDATE */')||html.includes('<!-- GAME -->'))throw Error('Unresolved build marker');
await mkdir(new URL('artifacts/',root),{recursive:true});
// Existing test commands retain the phaser filename; storybook is the delivery copy.
for(const name of [...(!dev?['bad-dream-adventure-armed-scroll.html']:[]),'bad-dream-adventure-phaser.html','bad-dream-adventure-storybook.html','bad-dream-adventure-combat.html'])await writeFile(new URL('artifacts/'+name,root),html);
console.log('Built storybook',Buffer.byteLength(html),'bytes, embedded',Object.keys(art).length,'assets; Phaser',pkg.version);
