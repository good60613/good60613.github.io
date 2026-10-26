// usage: node render.cjs <outdir> <workerIndex> <workerCount> [N=2]
// renders frames i where chunk(i) % workerCount == workerIndex ; 150-frame chunks with .ok markers (resumable)
const {chromium}=require('playwright'); const fs=require('fs'); const path=require('path'); const three=path.join(__dirname,'node_modules/three');
const [outdir,wi,wc,Nraw]=process.argv.slice(2); const N=+(Nraw||2); const CH=150, NF=840;
(async()=>{
  fs.mkdirSync(outdir,{recursive:true});
  const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const p=await b.newPage({viewport:{width:640,height:360}}); p.on('pageerror',e=>console.log('[err]',e.message));
  await p.route('https://cdn.jsdelivr.net/npm/three@0.160.0/**',r=>{const u=new URL(r.request().url()); const f=path.join(three,u.pathname.replace('/npm/three@0.160.0/','')); r.fulfill({body:fs.readFileSync(f),contentType:'text/javascript',headers:{'access-control-allow-origin':'*'}});});
  await p.goto('file://'+path.join(__dirname,'index.html')+'?render=1'); await p.waitForFunction('window.ready===true',null,{timeout:300000});
  const nChunks=Math.ceil(NF/CH);
  for(let c=0;c<nChunks;c++){
    if(c%(+wc)!==+wi) continue;
    const ok=path.join(outdir,`chunk${c}.ok`); if(fs.existsSync(ok)) continue;
    const t0=Date.now();
    for(let i=c*CH;i<Math.min(NF,(c+1)*CH);i++){
      const f=path.join(outdir,`f${String(i).padStart(4,'0')}.png`); if(fs.existsSync(f)) continue;
      await p.evaluate(([i,N])=>window.renderFrame(i,N),[i,N]);
      const b64=await p.evaluate(()=>window.frameB64('image/png'));
      fs.writeFileSync(f+'.tmp',Buffer.from(b64,'base64')); fs.renameSync(f+'.tmp',f);
      if(i%10===0) console.log(`worker ${wi} frame ${i} (${((Date.now()-t0)/1000).toFixed(0)}s into chunk ${c})`);
    }
    fs.writeFileSync(ok,String(Date.now())); console.log(`worker ${wi} chunk ${c} done in ${((Date.now()-t0)/60000).toFixed(1)} min`);
  }
  await b.close();
})();
