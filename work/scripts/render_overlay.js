// Rendu d'une séquence PNG transparente via Playwright : node render_overlay.js data.json mode outdir [f0 f1]
const { chromium } = require('playwright'); const fs=require('fs'); const path=require('path');
(async()=>{
  const [dataFile, mode, outdir, f0s, f1s] = process.argv.slice(2);
  const data=JSON.parse(fs.readFileSync(dataFile,'utf8')); const FPS=30;
  const f0=parseInt(f0s||'0'), f1=parseInt(f1s||String(Math.ceil(data.duration*FPS)));
  fs.mkdirSync(outdir,{recursive:true});
  const browser=await chromium.launch(); const page=await browser.newPage({viewport:{width:1080,height:1920},deviceScaleFactor:1});
  await page.goto('file://'+path.resolve(__dirname,'../overlay/overlay.html'));
  await page.evaluate(([d,m])=>window.setup(d,m),[data,mode]);
  await page.waitForTimeout(300);
  let prevSig=null, prevFile=null, shots=0, blank=0;
  const t0=Date.now();
  for(let f=f0;f<f1;f++){
    const t=f/FPS; const sig=await page.evaluate(t=>window.render(t),t);
    const file=path.join(outdir,`f${String(f).padStart(5,'0')}.png`);
    if(sig===''){ blank++; if(fs.existsSync(file)) fs.unlinkSync(file); prevSig=sig; continue; } // rien à afficher : pas de fichier
    if(sig===prevSig && prevFile){ fs.linkSync(prevFile,file); }
    else { await page.screenshot({path:file,omitBackground:true,type:'png'}); shots++; }
    prevSig=sig; prevFile=file;
  }
  console.log(`done frames ${f0}-${f1} screenshots=${shots} blank=${blank} in ${(Date.now()-t0)/1000}s`);
  await browser.close();
})();
