/* Contrôle des contrastes WCAG des couples couleur/fond du design system */
const hex = h => [1,3,5].map(i => parseInt(h.slice(i,i+2),16)/255);
const lin = c => c <= 0.03928 ? c/12.92 : ((c+0.055)/1.055)**2.4;
const L   = h => { const [r,g,b] = hex(h).map(lin); return 0.2126*r+0.7152*g+0.0722*b; };
const ratio = (a,b) => { const [x,y]=[L(a),L(b)].sort((p,q)=>q-p); return (x+0.05)/(y+0.05); };

const BG = '#F7F8FC', CARD = '#EFF1F7', BLUE = '#4353FF';
const cases = [
  ['#12121F', BG,   'texte principal sur le fond',            4.5],
  ['#12121F', CARD, 'texte principal sur card claire',        4.5],
  [BLUE,      BG,   'bleu signature sur le fond',             4.5],
  [BLUE,      CARD, 'bleu signature sur card claire (badge)', 4.5],
  ['#FFFFFF', BLUE, 'texte blanc sur card bleue pleine',      4.5],
  ['#8A8FA3', BG,   'gris secondaire sur le fond',            4.5],
  ['#8A8FA3', CARD, 'gris secondaire sur card claire',        4.5],
  ['#6B7085', BG,   'gris alternatif propose sur le fond',    4.5],
  ['#6B7085', CARD, 'gris alternatif propose sur card',       4.5],
];
console.log('\n=== CONTRASTES ===');
let ko = 0;
for (const [fg,bg,label,min] of cases) {
  const r = ratio(fg,bg);
  const ok = r >= min;
  if (!ok) ko++;
  console.log(`${ok?'OK ':'KO '} ${r.toFixed(2)}:1  (min ${min})  ${label}`);
}
console.log(ko ? `\n${ko} couple(s) sous le seuil AA.` : '\nTous les contrastes sont conformes.');
