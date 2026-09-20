/* Contrôle des contrastes WCAG des couples couleur/fond de la charte */
const hex = h => [1,3,5].map(i => parseInt(h.slice(i,i+2),16)/255);
const lin = c => c <= 0.03928 ? c/12.92 : ((c+0.055)/1.055)**2.4;
const L   = h => { const [r,g,b] = hex(h).map(lin); return 0.2126*r+0.7152*g+0.0722*b; };
const ratio = (a,b) => { const [x,y]=[L(a),L(b)].sort((p,q)=>q-p); return (x+0.05)/(y+0.05); };

const BG = '#0A0A0F';
const cases = [
  ['#F5F5F7', BG, 'texte principal',              4.5],
  ['#9CA3AF', BG, 'texte secondaire',             4.5],
  ['#60A5FA', BG, 'bleu clair (petit texte)',     4.5],
  ['#2563EB', BG, 'bleu principal (grand texte >=24px gras)', 3.0],
  ['#2563EB', BG, 'bleu principal (traits de schema)',        3.0],
  ['#FFFFFF', '#2563EB', 'texte du bouton CTA',   4.5],
  ['#9CA3AF', '#0D1526', 'texte secondaire / bas du degrade', 4.5],
];
console.log('\n=== CONTRASTES ===');
let ko = 0;
for (const [fg,bg,label,min] of cases) {
  const r = ratio(fg,bg);
  const ok = r >= min;
  if (!ok) ko++;
  console.log(`${ok?'OK ':'KO '} ${r.toFixed(2)}:1  (min ${min})  ${label}  ${fg} sur ${bg}`);
}
console.log(ko ? `\n${ko} contraste(s) insuffisant(s).` : '\nTous les contrastes sont conformes.');
