"""Extrait Montserrat ExtraBold Italic (wght=800) de la police variable google/fonts."""
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
s = instantiateVariableFont(TTFont('fonts/Montserrat-Italic.ttf'), {'wght': 800}); n = s['name']
for rec in list(n.names):
    if rec.nameID in (1, 2, 3, 4, 6, 16, 17): n.removeNames(nameID=rec.nameID)
for i, v in {1: 'Montserrat ExtraBold', 2: 'Italic', 3: 'Montserrat-ExtraBoldItalic',
             4: 'Montserrat ExtraBold Italic', 6: 'Montserrat-ExtraBoldItalic'}.items():
    n.setName(v, i, 3, 1, 0x409)
s['OS/2'].usWeightClass = 800; s['OS/2'].fsSelection = (s['OS/2'].fsSelection | 1) & ~0x40; s['head'].macStyle = 2
s.save('fonts/Montserrat-ExtraBoldItalic.ttf'); print('fonts/Montserrat-ExtraBoldItalic.ttf')
