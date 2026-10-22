/* Developer checks: node tests/quality-regression.cjs. No player build step.
 * These supplement the Chromium player-control evidence in the HTML changelog.
 */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const source=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const digest=value=>crypto.createHash('sha256').update(value).digest('hex');
const SEA_LEVEL=62;
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
// Ids 0-255 are the original blocks (unchanged), 256-511 belong to items only, and
// new blocks append from 512. The extension hash pins the first 397 new ids; later
// blocks may only be appended after them.
const legacy=BLOCKS.slice(0,256);assert.equal(legacy.length,256);assert(legacy.every((b,i)=>b&&b.id===i));
assert.equal(digest(JSON.stringify(legacy.map(b=>[b.id,b.name]))),LEGACY.registry,'saved block IDs/names changed');
for(let i=256;i<512;i++)assert(!BLOCKS[i],'block ids 256-511 are reserved for items');
assert(BLOCKS.length<=1024);for(let i=512;i<BLOCKS.length;i++)assert(BLOCKS[i]&&BLOCKS[i].id===i,'extended block ids must be contiguous');
assert.equal(digest(JSON.stringify(BLOCKS.slice(512,909).map(b=>[b.id,b.name]))),'f245d780f7538ab90f3f79e6525d6564e5399178ea04a32f79943ea23f672805','extended block IDs/names changed');
for(const id of Object.keys(ITEMS).map(Number))assert(id>=256&&id<512&&!BLOCKS[id],'item ids live in 256-511');
const generation=source.match(/id="worldgen-src">([\s\S]*?)<\/script>/)[1],make=new Function(generation+';return makeGen;')();
// Generators 3, 4 and 5 shipped too, so their chunks are pinned like 1 and 2.
const SHIPPED=[[3,42,"overworld",0,0,"24e17454845ff84a70d3aa7618f01695c92f1c1fe4f4e6b403c5b57a104a7bd0"],[3,42,"overworld",-1,2,"5623be49c8e9fba17fcd348286824e78a45375b70cba7b4767f9fc2b8563082f"],[3,42,"overworld",15,-31,"2f4af8810ce00fd906b1911c26e69cef3a60a72f9f120bfa5bb0d19e1ee856bd"],[3,42,"overworld",100,100,"3b151d80a8d85c18049a2400a8547312e1d94dfe3d566f2ebe630898390cafa7"],[3,42,"nether",0,0,"e58f5906f4cf6b0522123044e444a12ec60d5ed2579405d957a9c333f418bf63"],[3,42,"nether",-1,2,"4bdc386a85c46910ccf7f89acddb00e2d236c61ddbca6472ccfbefc90b7001f1"],[3,42,"nether",15,-31,"844715a027bc49c1fee53af19740414cdad3ef08199512cf8146ebaee597b3fa"],[3,42,"nether",100,100,"2fbe84782b41fb12b15ffb722f1d850702c81988b2444d0b11d77e1968b56b92"],[3,12345,"overworld",0,0,"ed5e700e63eb276ab90f461d5fa0f1d75b58c30f00d2ebbef6b71e62903f68b9"],[3,12345,"overworld",-1,2,"2a824f11ba233895013c1fa371c65f41bd0c98d7921d922ed0215478968e1ab1"],[3,12345,"overworld",15,-31,"c2a1bc6ec9d6562a447044351da751fbd55c22661924d6339968931b295af95a"],[3,12345,"overworld",100,100,"d520315f10a958e7d6883e193407f1bfd2636c206d343b0a0998b61e6b25779a"],[3,12345,"nether",0,0,"a9ee6c4fb19c15bdd066661031a41b056249b684bce47a56a0a0be3a1e0d8e0e"],[3,12345,"nether",-1,2,"e62471909c6118168d21f46d7b150d3bd5d902112761c109d29c43e2080575c4"],[3,12345,"nether",15,-31,"8896efbb145ca7787717257e2990801085f319a4a136e8718cc559747237f249"],[3,12345,"nether",100,100,"ea5ea9ad1762819ed9fccca7c6d9786512870d65e337d700a3c74a2a35a70dba"],[3,-98765,"overworld",0,0,"632df24c2e171b1bf1dfb729bbcffac958a1f39149ea62235149c35a992d4d62"],[3,-98765,"overworld",-1,2,"60634c3be16fdb647601fe9416d26710b266e26ad9c1eb359a1bace75eb67ea1"],[3,-98765,"overworld",15,-31,"fb8f4e52c2b1c447f3dc312b1925f8207b5c2e39ab5b121660db9d72b0166026"],[3,-98765,"overworld",100,100,"0128fc019d4399668571bf356d3975d96463ae19e66094d0fa74088609c71c58"],[3,-98765,"nether",0,0,"ae2e8c33b633e28b7a550a4e41fb5094559c357946c8b7536ae185ff66f365aa"],[3,-98765,"nether",-1,2,"c70fbee40ff63da10b8abdbbc1ec83985d03b19d77999da37eaa6f25be09545b"],[3,-98765,"nether",15,-31,"5de3027e29eee2aa28ac8df7a41308ceb1ea4483fa42505e6b78e93403027141"],[3,-98765,"nether",100,100,"a79660ecf465e7bd142349a5ed602d66c74dcc670bd44c269ada8f06ac82e602"],[4,42,"overworld",0,0,"b6f65147d7f335dd4afd34c1eff8a5272df51c30114046651d445a4a59b341c1"],[4,42,"overworld",-1,2,"a8da151fa88e8ed1bd638c3477ce43b1efe37c7fa6c91718724de59626389642"],[4,42,"overworld",15,-31,"606c0ab0c2108662c7c861ab258a2188ff5e12c816fcc543350d62cb33bd2530"],[4,42,"overworld",100,100,"cde5650f03ff7b514aae2bb574465e808c97149bbfc818b1b6197e3fcc9b22b0"],[4,42,"nether",0,0,"4dacfd22a4aa0a6a093e477d96c2fc43fdb5a91a3e29b8619acc5e056bc3859d"],[4,42,"nether",-1,2,"4f61c7b0920b7272ad8a1f5eacebfa35e88d64c4dcac10ed5d9835db3491acb9"],[4,42,"nether",15,-31,"909b78cc3609af755b1da73a7cb7ea9f84bd3e53d0e70123be2824f5d23d41b6"],[4,42,"nether",100,100,"49c8baf8b16b50ba4d70258a9e618425e3786d5eea3bb1517d23594616a68fd2"],[4,12345,"overworld",0,0,"72d1314fd1e57907a74ab70ecafbd975300a9fea354bb53456a04f154d9efd0e"],[4,12345,"overworld",-1,2,"0f08d22f927c74ac7bfbc7219b6512c7973335584cb14df9a36ee77dddd708b8"],[4,12345,"overworld",15,-31,"b45da11b49ab2b83d4e3314d5bf0f35e2e7da9f9c4cddcdd2866f16c58f35d5c"],[4,12345,"overworld",100,100,"0f39de89da91b003e3fdf8a56d1a20bd29be4e9949c10b8f57d1843047922bba"],[4,12345,"nether",0,0,"8aa8473fb7b6f6e23cc1f9b3413def5bfc8bd6c7857f5e182858b8bd168a0867"],[4,12345,"nether",-1,2,"b09a31abde9a5f38c06a2d922c2e7ac0cbe501962990bfa0e551f937870f7241"],[4,12345,"nether",15,-31,"ecf24bb8f269df981fa0747edf21a95f0d430e9dba74698b0470e484963f21bb"],[4,12345,"nether",100,100,"0e4852308135eb9167e544c9c4ab484990676f2b823f554ef0edc5b7ee2377e0"],[4,-98765,"overworld",0,0,"d625218af3fc71a626aa72e3e775061b2f33aa98c89bc6ca22b5abb5c09f36b3"],[4,-98765,"overworld",-1,2,"3e64556bae46066e9d28e258d7374516503929482edf3a705367717ca4442a22"],[4,-98765,"overworld",15,-31,"a600c858617063e17753ce73cb32e845054e544e1ba3beaeb5aaf0f99e6d115a"],[4,-98765,"overworld",100,100,"78b610ccb3143c0523910dd57eab5c59689a65f8e81feb8509927f8841bd61ef"],[4,-98765,"nether",0,0,"096578496318c71f099e06bef4112cf8309eaf0f3f64a47538d98692e326d56d"],[4,-98765,"nether",-1,2,"e887c6290dec080f1c8a22b0d105ced0f7af0d27cf2478084bc3d75a356727c8"],[4,-98765,"nether",15,-31,"8e0153660e90319f404ce10fb39307affd7d6cde95dd117e5ff1ed6a9fbec10a"],[4,-98765,"nether",100,100,"ce8e0d9bb780d74bc1025af253a26f95a41f21777bee8e328a1e0244f8f609cf"],[5,42,"overworld",0,0,"b6f65147d7f335dd4afd34c1eff8a5272df51c30114046651d445a4a59b341c1"],[5,42,"overworld",-1,2,"a8da151fa88e8ed1bd638c3477ce43b1efe37c7fa6c91718724de59626389642"],[5,42,"overworld",15,-31,"ffa79dd0d5e4e3f63b0cb2f5c45215199dcb6baee32bc7463b9e0e56cffff208"],[5,42,"overworld",100,100,"cde5650f03ff7b514aae2bb574465e808c97149bbfc818b1b6197e3fcc9b22b0"],[5,42,"nether",0,0,"4dacfd22a4aa0a6a093e477d96c2fc43fdb5a91a3e29b8619acc5e056bc3859d"],[5,42,"nether",-1,2,"4f61c7b0920b7272ad8a1f5eacebfa35e88d64c4dcac10ed5d9835db3491acb9"],[5,42,"nether",15,-31,"909b78cc3609af755b1da73a7cb7ea9f84bd3e53d0e70123be2824f5d23d41b6"],[5,42,"nether",100,100,"49c8baf8b16b50ba4d70258a9e618425e3786d5eea3bb1517d23594616a68fd2"],[5,12345,"overworld",0,0,"72d1314fd1e57907a74ab70ecafbd975300a9fea354bb53456a04f154d9efd0e"],[5,12345,"overworld",-1,2,"0f08d22f927c74ac7bfbc7219b6512c7973335584cb14df9a36ee77dddd708b8"],[5,12345,"overworld",15,-31,"b45da11b49ab2b83d4e3314d5bf0f35e2e7da9f9c4cddcdd2866f16c58f35d5c"],[5,12345,"overworld",100,100,"0f39de89da91b003e3fdf8a56d1a20bd29be4e9949c10b8f57d1843047922bba"],[5,12345,"nether",0,0,"8aa8473fb7b6f6e23cc1f9b3413def5bfc8bd6c7857f5e182858b8bd168a0867"],[5,12345,"nether",-1,2,"b09a31abde9a5f38c06a2d922c2e7ac0cbe501962990bfa0e551f937870f7241"],[5,12345,"nether",15,-31,"ecf24bb8f269df981fa0747edf21a95f0d430e9dba74698b0470e484963f21bb"],[5,12345,"nether",100,100,"0e4852308135eb9167e544c9c4ab484990676f2b823f554ef0edc5b7ee2377e0"],[5,-98765,"overworld",0,0,"25137cab731428f42becd05080b78bd9e5f3541125465655e861803ad89a894a"],[5,-98765,"overworld",-1,2,"e75943b1d5056c81756de800b3aa9b996e32bc7200f4512753dc777f62ac615d"],[5,-98765,"overworld",15,-31,"a600c858617063e17753ce73cb32e845054e544e1ba3beaeb5aaf0f99e6d115a"],[5,-98765,"overworld",100,100,"78b610ccb3143c0523910dd57eab5c59689a65f8e81feb8509927f8841bd61ef"],[5,-98765,"nether",0,0,"096578496318c71f099e06bef4112cf8309eaf0f3f64a47538d98692e326d56d"],[5,-98765,"nether",-1,2,"e887c6290dec080f1c8a22b0d105ced0f7af0d27cf2478084bc3d75a356727c8"],[5,-98765,"nether",15,-31,"8e0153660e90319f404ce10fb39307affd7d6cde95dd117e5ff1ed6a9fbec10a"],[5,-98765,"nether",100,100,"ce8e0d9bb780d74bc1025af253a26f95a41f21777bee8e328a1e0244f8f609cf"]];
LEGACY.hashes.push(...SHIPPED);
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
// Generator 4 (Caves & Cliffs): deterministic 16-bit chunks, big caverns, deepslate and cave resources.
for(const seed of [42,-98765]){
 const a=make(seed,B,4),b=make(seed,B,4),v3=make(seed,B,3);let air4=0,air3=0;const seen=new Set();
 for(let z=-3;z<=3;z++)for(let x=-3;x<=3;x++){
  const data=a.genChunk(x,z),old=v3.genChunk(x,z);assert(data instanceof Uint16Array&&data.length===32768);
  if(x===0||z===0)assert.equal(digest(data),digest(b.genChunk(x,z)),'generator 4 depends on request order');
  for(let zz=0;zz<16;zz++)for(let xx=0;xx<16;xx++)for(let y=8;y<a.heightAt(x*16+xx,z*16+zz)-10;y++){const i=xx+(zz<<4)+(y<<8);if(data[i]===0)air4++;if(old[i]===0)air3++;}
  for(const id of data)seen.add(id);
 }
 assert(air4>air3*3,'big caves missing from generator 4');
 for(const name of ['deepslate','deepslate_iron_ore','deepslate_diamond_ore','tuff','granite','iron_ore','coal_ore'])assert(seen.has(B[name]),name+' missing from generator 4');
}
// Generator 5: generator 4 plus cave openings from the surface and wide river valleys.
{
 let open4=0,open5=0,river=0;
 for(const seed of [42,12345]){const g4=make(seed,B,4),g5=make(seed,B,5),again=make(seed,B,5);
  for(let cz=-12;cz<12;cz+=2)for(let cx=-12;cx<12;cx+=2){const a=g4.genChunk(cx,cz),b=g5.genChunk(cx,cz);
   if(cx===0)assert.equal(digest(b),digest(again.genChunk(cx,cz)),'generator 5 depends on request order');
   for(let z=0;z<16;z++)for(let x=0;x<16;x++){const i=x+(z<<4),hole=(g,d)=>{const h=g.heightAt(cx*16+x,cz*16+z);return h>SEA_LEVEL+3&&[0,1,2,6].every(k=>d[i+((h-k)<<8)]===0);};
    if(hole(g4,a))open4++;if(hole(g5,b))open5++;}}
  for(let x=-600;x<600;x++)if(g5.biomeAt(x,40)===7&&g5.heightAt(x,40)<SEA_LEVEL)river++;
 }
 if(process.env.DEBUG_GEN)console.log({open4,open5,river});assert(open5>open4*4&&open5>40,'cave openings missing from generator 5');assert(river>20,'generator 5 rivers missing');
}
// Generator 6: bigger cave mouths lined with coal near the surface.
{
 let open5=0,open6=0,coal5=0,coal6=0;
 for(const seed of [42,12345]){const g5=make(seed,B,5),g6=make(seed,B,6);
  for(let cz=-10;cz<10;cz+=2)for(let cx=-10;cx<10;cx+=2){const a=g5.genChunk(cx,cz),b=g6.genChunk(cx,cz);
   for(let z=0;z<16;z++)for(let x=0;x<16;x++){const i=x+(z<<4),h=g5.heightAt(cx*16+x,cz*16+z);if(h<=SEA_LEVEL+3)continue;
    if([0,1,2,6].every(k=>a[i+((h-k)<<8)]===0))open5++;if([0,1,2,6].every(k=>b[i+((h-k)<<8)]===0))open6++;
    for(let y=h-12;y<=h;y++){const j=i+(y<<8),nearAir=d=>[1,-1,16,-16,256,-256].some(o=>d[j+o]===0);if(a[j]===B.coal_ore&&nearAir(a))coal5++;if(b[j]===B.coal_ore&&nearAir(b))coal6++;}}}
 }
 if(process.env.DEBUG_GEN)console.log({open5,open6,coal5,coal6});
 assert(open6>open5*1.5&&coal6>coal5*2,'generator 6 cave mouths or their coal missing');
}
// Legacy metadata must retain generator and equipment, including offhand enchants.
vm.runInContext(source.slice(source.indexOf('function migrateMeta('),source.indexOf('function mobRecord('))+';globalThis.migrate=migrateMeta;',context);
const equipment=[315,1,123,{fortune:2}],old={v:12,generator:2,inv:[equipment],offhand:[384,1,200,null],p:{x:1,y:70,z:2}};
const migrated=context.migrate(old);assert.equal(migrated.v,15);assert.equal(migrated.generator,2);assert.deepEqual(migrated.inv[0],equipment);assert.equal(migrated.offhand[2],200);
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
console.log(`PASS: syntax, soundpack, 256 stable IDs + ${BLOCKS.length-512} appended, ${LEGACY.hashes.length} legacy chunks, v3-v6 determinism/resources, migration and both portal frames.`);
