/* Developer checks: node tests/quality-regression.cjs. No player build step.
 * These supplement the Chromium player-control evidence in the HTML changelog.
 */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const source=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const digest=value=>crypto.createHash('sha256').update(value).digest('hex');
const LEGACY={"registry":"ddb4ac45a5812df58b39f4145395f0fdb73c782a40fd0ebdeca3c15238ef5b3c","hashes":[[1,12345,"overworld",0,0,"2c3bacc6a551e06a0e77bfb9082d1043ff843b2b09eedeb8d0996925e1987b0e"],[1,12345,"overworld",-1,2,"022e5fa067eca2e6c6d49938f4e4decb7d544ff97184865e6a13b042c4968aa2"],[1,12345,"overworld",15,-31,"18a1bb8a7c8da90e53370083710eb51b9f899490e02d9a7e04677f8ce89a393d"],[1,12345,"overworld",100,100,"91f8f8756f029554044f08ebdc523139584505e153b52bdeb2b816101e23d4da"],[1,12345,"nether",0,0,"64c7e75fef608125a0534ff39aa881d0dc77463d1fe38157cf57343630a01b2b"],[1,12345,"nether",-1,2,"6b1219efeb0424d17c2e2c1c3176c1ce6f1cbb4ae7d4df71f30fb2a988282a5b"],[1,12345,"nether",15,-31,"dcb75d77d2be4bb6fd6442493eb203c2d642607055b5050ebd3ea74dc22e024e"],[1,12345,"nether",100,100,"3606423f0994dafaac792f8b6fc8cb85acd650aa817150b7b080d942d59805eb"],[1,42,"overworld",0,0,"e85b8f534dc517fd3abc6bb86760b77829b804ef7483a798ceda9e875ef1e5e7"],[1,42,"overworld",-1,2,"ae6078b987d635fd2703d56690128939a689b9302e89c1fc6c02e5fb3f673115"],[1,42,"overworld",15,-31,"ed8ef6d809ac1bfa30e0e24b86c7d18eb748d9cc523cacdc41486ef21d3f6af0"],[1,42,"overworld",100,100,"f975a926f983cc33059d8c875df3eaafe5f1f4245abed839e442fa546a102085"],[1,42,"nether",0,0,"bf929c6691b67ce98da9317dddc80479ccfbdc6fb9a98d9a1a5cd5a4dde141a1"],[1,42,"nether",-1,2,"00205d5ff0bad125a0f52ac121a845701f8b89fbbabb5a4d9197b471e2c40cfc"],[1,42,"nether",15,-31,"a027e43aa6fd23416dffc2bf0f73455f70d3038b90cf8731dc50899dfee37e23"],[1,42,"nether",100,100,"5991392a97888288d3fffeec0bf65be1fcffe1e48393d89b657f8ade6073cc0e"],[1,-98765,"overworld",0,0,"3224695584596f2ea90572ce1e23c25fed7e8c5fcc17227c70f17a3a82e99ceb"],[1,-98765,"overworld",-1,2,"d60b41f12d236447760dc7007f21c97d48ecd8f3ee6be1042a0ffd6f13546e32"],[1,-98765,"overworld",15,-31,"eeda594ce9d5f22bd9930dc4e7cb86ebaea2573020c4f2e0428663d517659256"],[1,-98765,"overworld",100,100,"502206ba2eca2b5836085a74d5ef8b76a0dbad72d222f8383678914296251455"],[1,-98765,"nether",0,0,"706017ae2bffda081ba3039677a2c7ffad98723152d1ec483234237294937f44"],[1,-98765,"nether",-1,2,"5950c4510226016a258ff9e2a45165c2f245ea014536f183f52dea8498d7319c"],[1,-98765,"nether",15,-31,"05f316f4a421b9a71206ba22a05fee3c276eb4ff3568c613d12fd2f02508d3c0"],[1,-98765,"nether",100,100,"a0a0cc5b45cc0b33543b308f8e79110f52efe6e4b0df54a9417490bca69bbee3"],[2,12345,"overworld",0,0,"763896d3f00250a133cd12bcef77f14f07b586b401d26f285e33cbe11010518d"],[2,12345,"overworld",-1,2,"e78fb4956b849d3c2355592a7796323e63caf7258109bbc25db5cc5f7b9ff513"],[2,12345,"overworld",15,-31,"9f3801aa68e7013b40fd25e8e580451db3dd4555c42db85a120338923d97084f"],[2,12345,"overworld",100,100,"052924b0309b6895873cccc925a2f063138858c216ea01646528a03ea06cee49"],[2,12345,"nether",0,0,"64c7e75fef608125a0534ff39aa881d0dc77463d1fe38157cf57343630a01b2b"],[2,12345,"nether",-1,2,"6b1219efeb0424d17c2e2c1c3176c1ce6f1cbb4ae7d4df71f30fb2a988282a5b"],[2,12345,"nether",15,-31,"dcb75d77d2be4bb6fd6442493eb203c2d642607055b5050ebd3ea74dc22e024e"],[2,12345,"nether",100,100,"3606423f0994dafaac792f8b6fc8cb85acd650aa817150b7b080d942d59805eb"],[2,42,"overworld",0,0,"e944fba1dfd7b178d7087bedab192396195ad04589ef1cad63e6241a0902f611"],[2,42,"overworld",-1,2,"df89345b71222785f3dab2cf8fb2c07f065d4689aad7cf1fafc7a8c852eeb0df"],[2,42,"overworld",15,-31,"b65ad714aa330cd797eb47e763c386a72530f4565378519eb50b614927378d95"],[2,42,"overworld",100,100,"11fcb2b0f7b8e37a7291c4957000ce81cde98ded134199367b10fea008020f27"],[2,42,"nether",0,0,"bf929c6691b67ce98da9317dddc80479ccfbdc6fb9a98d9a1a5cd5a4dde141a1"],[2,42,"nether",-1,2,"00205d5ff0bad125a0f52ac121a845701f8b89fbbabb5a4d9197b471e2c40cfc"],[2,42,"nether",15,-31,"a027e43aa6fd23416dffc2bf0f73455f70d3038b90cf8731dc50899dfee37e23"],[2,42,"nether",100,100,"5991392a97888288d3fffeec0bf65be1fcffe1e48393d89b657f8ade6073cc0e"],[2,-98765,"overworld",0,0,"a2b798cba5e624c20d13a79f7325a8a5848b39376dde3f33afddcbaba338821b"],[2,-98765,"overworld",-1,2,"bce0d9ddd9e9c216dfb6717c291b8465a7924c77ec2ee3e6bb058f9777791729"],[2,-98765,"overworld",15,-31,"d61c98f9f6ee8af2249de72997e48c13cdd53bbd12b7fc86de5ff3b66c853f45"],[2,-98765,"overworld",100,100,"0e9facaa3a836f7e9e38f550fdbd71ad99c37ab68ff1a088af45cc8089146218"],[2,-98765,"nether",0,0,"706017ae2bffda081ba3039677a2c7ffad98723152d1ec483234237294937f44"],[2,-98765,"nether",-1,2,"5950c4510226016a258ff9e2a45165c2f245ea014536f183f52dea8498d7319c"],[2,-98765,"nether",15,-31,"05f316f4a421b9a71206ba22a05fee3c276eb4ff3568c613d12fd2f02508d3c0"],[2,-98765,"nether",100,100,"a0a0cc5b45cc0b33543b308f8e79110f52efe6e4b0df54a9417490bca69bbee3"]]};
for(const match of source.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g))if(!/type=|src=/.test(match[1]))new vm.Script(match[2]);
assert(!/id="soundpack"/.test(source),'sound pack must stay in sounds/, not embedded in index.html');
{const dir=path.join(__dirname,'..','sounds'),keys=JSON.parse(fs.readFileSync(path.join(dir,'manifest.json'),'utf8')).sounds.slice().sort(),h=crypto.createHash('sha256');
 for(const k of keys)h.update(Buffer.concat([Buffer.from(k+'\0'),fs.readFileSync(path.join(dir,k+'.ogg'))]));
 assert.equal(keys.length,127,'sound manifest count changed');
 assert.equal(h.digest('hex'),'b8d2be862b3e28825e727e7876e7671f7162a58bbf6df7f91cbf42f83f5feff5','sound pack files changed');}
assert.deepEqual([...source.matchAll(/<script[^>]+src="([^"]+)"/g)].map(m=>m[1]),['https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js']);
const context={};vm.createContext(context);
vm.runInContext(source.slice(source.indexOf('const B = {};'),source.indexOf('const isBlockId ='))+';globalThis.registry={B,BLOCKS,ITEMS};',context);
const {B,BLOCKS,ITEMS}=context.registry;
assert.equal(BLOCKS.length,256);assert(BLOCKS.every((b,i)=>b.id===i));
assert.equal(digest(JSON.stringify(BLOCKS.map(b=>[b.id,b.name]))),LEGACY.registry,'saved block IDs/names changed');
const generation=source.match(/id="worldgen-src">([\s\S]*?)<\/script>/)[1],make=new Function(generation+';return makeGen;')();
for(const [version,seed,dimension,x,z,expected] of LEGACY.hashes)assert.equal(digest(make(seed,B,version,dimension).genChunk(x,z)),expected,`legacy ${version}/${seed}/${dimension}/${x},${z}`);
for(const seed of [42,12345,-98765]){
 const a=make(seed,B,3),b=make(seed,B,3);let underground=0;
 for(const [x,z] of [[0,0],[1,0],[-1,0],[0,1],[0,-1],[-2,3]]){
  const data=a.genChunk(x,z);assert.equal(digest(data),digest(b.genChunk(x,z)),'generation depends on request order');
  assert.equal(data.length,32768);
  for(let zz=0;zz<16;zz++)for(let xx=0;xx<16;xx++)for(let y=8;y<a.heightAt(x*16+xx,z*16+zz)-5;y++)if(data[xx+(zz<<4)+(y<<8)]===0)underground++;
 }
 assert(underground>100,'connected caves disappeared');
 const nether=make(seed,B,3,'nether');let wart=0,quartz=0,groundGlow=0;
 for(let z=-3;z<=3;z++)for(let x=-3;x<=3;x++){
  const data=nether.genChunk(x,z);for(let i=0;i<data.length;i++){if(data[i]===B.nether_wart_block)wart++;if(data[i]===B.nether_quartz_ore)quartz++;if(data[i]===B.glowstone&&(i>>8)<60)groundGlow++;}
 }
 assert(wart>0&&quartz>0&&groundGlow>0,'Nether survival resources missing');
}
// Legacy metadata must retain generator and equipment, including offhand enchants.
vm.runInContext(source.slice(source.indexOf('function migrateMeta('),source.indexOf('function mobRecord('))+';globalThis.migrate=migrateMeta;',context);
const equipment=[315,1,123,{fortune:2}],old={v:12,generator:2,inv:[equipment],offhand:[384,1,200,null],p:{x:1,y:70,z:2}};
const migrated=context.migrate(old);assert.equal(migrated.v,13);assert.equal(migrated.generator,2);assert.deepEqual(migrated.inv[0],equipment);assert.equal(migrated.offhand[2],200);
assert.equal(context.migrate({v:1,p:{}}).generator,1);assert.equal(context.migrate({v:12,p:{}}).generator,2);
// Frame detection/destruction with optional corners, both orientations and a build marker.
const cells=new Map(),key=(x,y,z)=>`${x},${y},${z}`;
const world={getBlock:(x,y,z)=>cells.get(key(x,y,z))||0,setBlock:(x,y,z,id)=>cells.set(key(x,y,z),id)};
Object.assign(context,{world,CH:128,PW:.3,FLUID_DIR:[[0,-1,0],[1,0,0],[-1,0,0],[0,0,1],[0,0,-1],[0,1,0]],posKey:key,sfx:{fuse(){}},toast(){}});
vm.runInContext(source.slice(source.indexOf('const portalState='),source.indexOf('let fireballGeometry='))+';globalThis.portals={lightPortal,findPortal,invalidatePortal};',context);
for(const axis of [0,1]){
 cells.clear();const x=-12,y=35,z=8;world.setBlock(20,35,20,B.bricks);
 for(let h=0;h<5;h++)for(let w=0;w<4;w++)if(h===0||h===4||w===0||w===3)world.setBlock(x+(axis===0?w:0),y+h,z+(axis===1?w:0),(h===0||h===4)&&(w===0||w===3)?B.cobblestone:B.obsidian);
 assert(context.portals.lightPortal(x,y,z));let inside=0;for(const id of cells.values())if(id===B.portal)inside++;assert.equal(inside,6);
 assert.equal(context.portals.findPortal(x+(axis===0?1:0),y+1,z+(axis===1?1:0)).axis,axis);
 world.setBlock(x,y+2,z,0);context.portals.invalidatePortal(x,y+2,z);
 assert(![...cells.values()].includes(B.portal));assert.equal(world.getBlock(20,35,20),B.bricks,'frame maintenance changed a neighbouring build');
}
console.log(`PASS: syntax, soundpack, 256 stable IDs, ${LEGACY.hashes.length} legacy chunks, v3 determinism/resources, migration and both portal frames.`);
