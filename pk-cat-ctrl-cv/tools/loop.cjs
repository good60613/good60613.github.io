// seamless-loop check: pose and velocity at t=14 vs t=0, via world positions of rig parts
const {chromium}=require('playwright'); const fs=require('fs'); const path=require('path'); const three=path.join(__dirname,'node_modules/three');
(async()=>{
  const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const p=await b.newPage({viewport:{width:320,height:180}}); p.on('pageerror',e=>console.log('[err]',e.message));
  await p.route('https://cdn.jsdelivr.net/npm/three@0.160.0/**',r=>{const u=new URL(r.request().url()); const f=path.join(three,u.pathname.replace('/npm/three@0.160.0/','')); r.fulfill({body:fs.readFileSync(f),contentType:'text/javascript',headers:{'access-control-allow-origin':'*'}});});
  await p.goto('file://'+path.join(__dirname,'index.html')+'?render=1'); await p.waitForFunction('window.ready===true');
  const r=await p.evaluate(()=>{
    const snap=t=>{ window.setStateDbg(t); const o=[]; const h=window.TOYS[0].rig; const objs=[h.root,h.yaw,h.sq,h.tilt,h.hp,h.hc,h.tail[5],h.tail[3],h.arm[0],h.arm[1],h.eye[0].g,h.mArc[0],h.tagP,h.ear[0]]; for(const ob of objs){ob.updateWorldMatrix(true,false); const e=ob.matrixWorld.elements; o.push(...e);} const cp=window.camInfo(t); o.push(...cp.p,...cp.t,cp.D,cp.az,cp.el); o.push(window.TOYS.filter(T=>T.rig.root.visible).length); return o; };
    const dt=1/600; const a0=snap(0), a14=snap(14), p0=snap(dt), m14=snap(14-dt);
    const names=['root','yaw','sq','tilt','hp','hc','tail5','tail3','armL','armR','eyeL','mArc0','tagP','ear0']; const per=[]; for(let k=0;k<names.length;k++){let dp=0,dv=0; for(let i=k*16;i<k*16+16;i++){dp=Math.max(dp,Math.abs(a0[i]-a14[i])); dv=Math.max(dv,Math.abs((p0[i]-a0[i])-(a14[i]-m14[i]))/dt);} per.push(names[k]+' pose '+dp.toFixed(4)+' vel '+dv.toFixed(3));} let cp=0; for(let i=224;i<a0.length;i++) cp=Math.max(cp,Math.abs(a0[i]-a14[i])); return {per,cam:cp};
  });
  console.log(JSON.stringify(r)); await b.close();
})();
