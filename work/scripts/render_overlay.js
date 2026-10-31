// Rendu d'une séquence PNG transparente via Playwright : node render_overlay.js data.json mode outdir [f0 f1]
const { chromium } = require('playwright'); const fs=require('fs'); const path=require('path');
(async()=>{
  const [dataFile, mode, outdir, f0s, f1s] = process.argv.slice(2);
  const data=JSON.parse(fs.readFileSync(dataFile,'utf8')); const FPS=30;
  const f0=parseInt(f0s||'0'), f1=parseInt(f1s||String(Math.ceil(data.duration*FPS)));
  fs.mkdirSync(outdir,{recursive:true});
  const browser=await chromium.launch(); let page=await browser.newPage({viewport:{width:1080,height:1920},deviceScaleFactor:1});
  await page.goto('file://'+path.resolve(__dirname,'../overlay/'+(process.env.OVERLAY||'overlay.html')));
  await page.evaluate(([d,m])=>window.setup(d,m),[data,mode]);
  await page.waitForTimeout(300);
  let prevSig=null, prevFile=null, shots=0, blank=0;
  const t0=Date.now();
  const RESET=parseInt(process.env.RESET||'0');
  for(let f=f0;f<f1;f++){
    if(RESET && f>f0 && (f-f0)%RESET===0){ await page.close(); page=await browser.newPage({viewport:{width:1080,height:1920},deviceScaleFactor:1}); await page.goto('file://'+path.resolve(__dirname,'../overlay/'+(process.env.OVERLAY||'overlay.html'))); await page.evaluate(([d,m])=>window.setup(d,m),[data,mode]); await page.waitForTimeout(200); prevSig=null; prevFile=null; }
    const t=f/FPS; const sig=await page.evaluate(t=>window.render(t),t);
    if(process.env.REPAINT==='1') await page.evaluate(()=>{document.body.style.display='none'; void document.body.offsetHeight; document.body.style.display='';});
    if(process.env.RAF==='1') await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
    const file=path.join(outdir,`f${String(f).padStart(5,'0')}.png`);
    if(sig===''){ blank++; if(fs.existsSync(file)) fs.unlinkSync(file); prevSig=sig; continue; } // rien à afficher : pas de fichier
    if(sig===prevSig && prevFile){ fs.linkSync(prevFile,file); }
    else { await page.screenshot({path:file,omitBackground:true,type:'png'}); shots++; }
    prevSig=sig; prevFile=file;
  }
  console.log(`done frames ${f0}-${f1} screenshots=${shots} blank=${blank} in ${(Date.now()-t0)/1000}s`);
  await browser.close();
})();
