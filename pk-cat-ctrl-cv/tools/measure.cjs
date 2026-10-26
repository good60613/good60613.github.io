// usage: node measure.cjs  → prints framing per 0.1s
const {chromium}=require('playwright'); const fs=require('fs'); const path=require('path'); const three=path.join(__dirname,'node_modules/three');
(async()=>{
  const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const p=await b.newPage({viewport:{width:640,height:360}});
  p.on('pageerror',e=>console.log('[err]',e.message));
  await p.route('https://cdn.jsdelivr.net/npm/three@0.160.0/**',r=>{const u=new URL(r.request().url()); const f=path.join(three,u.pathname.replace('/npm/three@0.160.0/','')); r.fulfill({body:fs.readFileSync(f),contentType:'text/javascript',headers:{'access-control-allow-origin':'*'}});});
  await p.goto('file://'+path.join(__dirname,'index.html')+'?render=1');
  await p.waitForFunction('window.ready===true');
  const step=parseFloat(process.argv[2]||'0.1');
  const res=await p.evaluate((step)=>{const o=[]; for(let t=0;t<14.001;t+=step){ const m=window.measure(t); const c=window.camInfo(t); o.push({t:+t.toFixed(2),n:m.length,m,c}); } return o;},step);
  fs.writeFileSync('measure.json',JSON.stringify(res));
  for(const r of res){
    if(!r.n) continue;
    const marg=Math.min(...r.m.map(x=>Math.min(x.l,1-x.r,x.b,1-x.tp)));
    const mean=r.m.reduce((a,x)=>a+x.wf,0)/r.n;
    const out=r.m.filter(x=>x.l<0.02||x.r>0.98||x.b<0.02||x.tp>0.985).map(x=>x.id).join(',');
    console.log(r.t.toFixed(1).padStart(5), 'n',String(r.n).padStart(2),'minMargin',marg.toFixed(3),'meanW',mean.toFixed(3),'D',r.c.D.toFixed(1), out?('OUT:'+out):'');
  }
  await b.close();
})();
