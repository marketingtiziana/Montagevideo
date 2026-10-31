// Rend une page canvas (window.render(t)) en séquence PNG : node render_canvas.js page.html outdir seconds fps
const { chromium } = require('playwright'); const fs=require('fs'); const path=require('path');
(async()=>{
  const [page_, outdir, secs, fpsS] = process.argv.slice(2); const FPS=parseInt(fpsS||'30'); fs.mkdirSync(outdir,{recursive:true});
  const browser=await chromium.launch(); const page=await browser.newPage({viewport:{width:1080,height:1920}});
  await page.goto('file://'+path.resolve(page_)); const dataFile=process.argv[6]; if(dataFile){ const data=JSON.parse(fs.readFileSync(dataFile,'utf8')); await page.evaluate(g=>window.setGeo(g),data);} await page.waitForFunction('window.ready===true');
  const n=Math.round(parseFloat(secs)*FPS);
  for(let f=0;f<n;f++){ await page.evaluate(t=>window.render(t),f/FPS); await page.screenshot({path:path.join(outdir,`f${String(f).padStart(4,'0')}.png`),type:'png'}); }
  console.log('rendered',n); await browser.close();
})();
