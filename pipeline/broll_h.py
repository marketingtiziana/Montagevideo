# -*- coding: utf-8 -*-
# Overlays MOTION "SaaS premium" pour le reel HOLDING (navy #0F1535 + indigo
# #4F6BFF uniquement, coins arrondis, aucune couleur chaude, aucun emoji) :
#   hsep.mp4    : PATRIMOINE | EXPLOITATION qui se separent (cutaway ~1.7s)
#   hflow.mp4   : schema HOLDING <- SOCIETES avec fleches indigo qui remontent (~2.3s)
#   hfortune.mp4: mot plein ecran "UNE FORTUNE" (climax ~0.9s)
#   cta.mp4     : carte finale AUDIT OFFERT / Lien en bio (~3.0s)
# + assets/ins_poche.png : petit portefeuille barre (insert)
import os, math, subprocess, imageio_ffmpeg
from PIL import Image, ImageDraw, ImageFont, ImageFilter
FF = imageio_ffmpeg.get_ffmpeg_exe()
W, H, FPS = 1080, 1920, 30
os.makedirs('broll/_f', exist_ok=True); os.makedirs('assets', exist_ok=True)

INTER = 'fonts/Inter-Black.ttf'
NAVY0, NAVY1 = (15, 21, 53), (8, 11, 30)     # #0F1535 -> plus sombre
BOX = (26, 34, 74)                            # box fill
INDIGO = (79, 107, 255)                       # #4F6BFF
WHITE = (255, 255, 255)
INK = (206, 214, 240)

def F(s): return ImageFont.truetype(INTER, s)
def ease(t): return 1-(1-t)**3
def clamp(x,a=0.0,b=1.0): return max(a,min(b,x))

def bg():
    g = Image.new('RGB',(1,H))
    for y in range(H):
        t=y/(H-1); g.putpixel((0,y),tuple(int(NAVY0[i]+(NAVY1[i]-NAVY0[i])*t) for i in range(3)))
    im=g.resize((W,H)).convert('RGBA')
    halo=Image.new('RGBA',(W,H),(0,0,0,0))
    ImageDraw.Draw(halo).ellipse([W//2-460,420,W//2+460,1160],fill=INDIGO+(26,))
    im.alpha_composite(halo.filter(ImageFilter.GaussianBlur(190)))
    return im

def ctext(d,cx,y,txt,f,fill,anchor='mm',shadow=True):
    if shadow: d.text((cx+3,y+4),txt,font=f,fill=(0,0,0,140),anchor=anchor)
    d.text((cx,y),txt,font=f,fill=fill,anchor=anchor)

def rbox(d, box, r, fill=None, outline=None, w=3):
    d.rounded_rectangle(box, radius=r, fill=fill, outline=outline, width=w)

def glow_box(canvas, box, r, col, blur=16, a=90):
    lay=Image.new('RGBA',(W,H),(0,0,0,0))
    ImageDraw.Draw(lay).rounded_rectangle(box,radius=r,fill=col+(a,))
    canvas.alpha_composite(lay.filter(ImageFilter.GaussianBlur(blur)))

def encode(name,n):
    src=f'broll/_f/{name}_%04d.png'; out=f'broll/{name}.mp4'
    r=subprocess.run([FF,'-y','-framerate',str(FPS),'-i',src,'-vf','format=yuv420p',
        '-c:v','libx264','-preset','medium','-crf','18','-pix_fmt','yuv420p',out],
        capture_output=True,text=True)
    print(f'{out}: rc={r.returncode} ({n}f)')
    if r.returncode: print(r.stderr[-600:])
    for fn in os.listdir('broll/_f'):
        if fn.startswith(name+'_'): os.remove('broll/_f/'+fn)

# ---------------------------------------------------------------- hsep
def hsep(dur=1.7):
    N=int(dur*FPS); ftit=F(38); flab=F(48)
    bw,bh=380,300; cy=980
    for i in range(N):
        t=i/(N-1); p=ease(clamp(t/0.45))     # slide-in 300-450ms
        im=bg(); d=ImageDraw.Draw(im)
        ctext(d,W//2,470,"2 MONDES SÉPARÉS",ftit,INK)
        gap=70*p+10
        lx=W//2-gap-bw; rx=W//2+gap
        # patrimoine (gauche)
        glow_box(im,[lx,cy-bh//2,lx+bw,cy+bh//2],28,INDIGO,16,70)
        rbox(d,[lx,cy-bh//2,lx+bw,cy+bh//2],28,fill=BOX+(255,),outline=INDIGO+(255,),w=4)
        ctext(d,lx+bw//2,cy,"PATRIMOINE",flab,WHITE)
        # exploitation (droite)
        rbox(d,[rx,cy-bh//2,rx+bw,cy+bh//2],28,fill=BOX+(255,),outline=INDIGO+(255,),w=4)
        ctext(d,rx+bw//2,cy,"EXPLOITATION",F(42),WHITE)
        # ligne de separation qui descend
        if p>0.2:
            lh=int((cy+bh//2-(cy-bh//2))*clamp((t-0.2)/0.5))
            d.line([W//2,cy-bh//2,W//2,cy-bh//2+lh],fill=INDIGO+(255,),width=6)
        im.convert('RGB').save(f'broll/_f/hsep_{i:04d}.png')
    encode('hsep',N)

# ---------------------------------------------------------------- hflow
def hflow(dur=2.3):
    N=int(dur*FPS); fh=F(64); fs=F(40)
    hold=(W//2-230,470,W//2+230,650)          # box HOLDING (haut)
    bw=300; bh=150; by=1120
    s1=(W//2-360,by,W//2-360+bw,by+bh)
    s2=(W//2+60, by,W//2+60+bw, by+bh)
    for i in range(N):
        t=i/(N-1)
        pb=ease(clamp(t/0.35))                # slide-in boxes
        pa=ease(clamp((t-0.4)/0.5))           # fleches remontent
        im=bg(); d=ImageDraw.Draw(im)
        # HOLDING (descend du haut)
        oy=int(-120*(1-pb))
        glow_box(im,[hold[0],hold[1]+oy,hold[2],hold[3]+oy],30,INDIGO,18,95)
        rbox(d,[hold[0],hold[1]+oy,hold[2],hold[3]+oy],30,fill=BOX+(255,),outline=INDIGO+(255,),w=5)
        ctext(d,W//2,(hold[1]+hold[3])//2+oy,"HOLDING",fh,WHITE)
        # societes (montent du bas)
        oy2=int(120*(1-pb))
        for bx in (s1,s2):
            rbox(d,[bx[0],bx[1]+oy2,bx[2],bx[3]+oy2],22,fill=BOX+(255,),outline=INDIGO+(220,),w=4)
            ctext(d,(bx[0]+bx[2])//2,(bx[1]+bx[3])//2+oy2,"SOCIÉTÉ",fs,INK)
        # fleches indigo qui remontent (societe -> holding) avec pulse
        for bx in (s1,s2):
            x=(bx[0]+bx[2])//2
            y0=bx[1]+oy2; y1=hold[3]+oy
            yy=int(y0+(y1-y0)*pa)
            if pa>0.02:
                d.line([x,y0,x,yy],fill=INDIGO+(255,),width=7)
                # tete de fleche
                if pa>0.15:
                    d.polygon([(x,yy-2),(x-16,yy+20),(x+16,yy+20)],fill=INDIGO+(255,))
                # pulse
                pulse=(t*1.6)%1.0
                py=int(y0+(y1-y0)*pulse)
                if py>=yy: py=yy
                d.ellipse([x-9,py-9,x+9,py+9],fill=WHITE+(230,))
        if pa>0.6:
            ctext(d,W//2,860,"L'ARGENT REMONTE",fs,INDIGO)
        im.convert('RGB').save(f'broll/_f/hflow_{i:04d}.png')
    encode('hflow',N)

# ---------------------------------------------------------------- hfortune
def hfortune(dur=0.9):
    N=int(dur*FPS)
    for i in range(N):
        t=i/(N-1); sc=1.0+0.12*(1-ease(clamp(t/0.35)))
        im=bg(); d=ImageDraw.Draw(im)
        fs=int(150*sc)
        ctext(d,W//2,900,"UNE",F(70),INK)
        ctext(d,W//2,1030,"FORTUNE",F(fs),INDIGO)
        ctext(d,W//2,1180,"EN IMPÔTS",F(56),WHITE)
        im.convert('RGB').save(f'broll/_f/hfortune_{i:04d}.png')
    encode('hfortune',N)

# ---------------------------------------------------------------- cta
def cta(dur=3.0):
    N=int(dur*FPS)
    for i in range(N):
        t=i/(N-1); p=ease(clamp(t/0.4)); sc=0.85+0.15*p
        im=bg(); d=ImageDraw.Draw(im)
        # halo indigo derriere le titre
        glow_box(im,[W//2-430,880,W//2+430,1120],40,INDIGO,40,70)
        ctext(d,W//2,760,"TA STRUCTURE MÉRITE MIEUX",F(40),INK)
        fs=int(124*sc)
        ctext(d,W//2,1000,"AUDIT OFFERT",F(fs),INDIGO)
        ctext(d,W//2,1180,"LIEN EN BIO",F(56),WHITE)
        # fleche vers le haut (bio) qui pulse
        ay=1330+int(10*math.sin(t*6))
        d.polygon([(W//2,ay-40),(W//2-34,ay+8),(W//2+34,ay+8)],fill=INDIGO+(255,))
        d.rectangle([W//2-12,ay+4,W//2+12,ay+70],fill=INDIGO+(255,))
        im.convert('RGB').save(f'broll/_f/cta_{i:04d}.png')
    encode('cta',N)

# ---------------------------------------------------------------- insert poche barree
def ins_poche():
    PAD=44; Wc,Hc=360,260
    canvas=Image.new('RGBA',(Wc+PAD*2,Hc+PAD*2),(0,0,0,0))
    d=ImageDraw.Draw(canvas)
    # glow
    gl=Image.new('RGBA',canvas.size,(0,0,0,0))
    ImageDraw.Draw(gl).rounded_rectangle([PAD-8,PAD-8,PAD+Wc+8,PAD+Hc+8],radius=30,fill=INDIGO+(80,))
    canvas.alpha_composite(gl.filter(ImageFilter.GaussianBlur(16)))
    rbox(d,[PAD,PAD,PAD+Wc,PAD+Hc],28,fill=BOX+(255,),outline=INDIGO+(255,),w=4)
    # portefeuille stylise
    wx,wy,ww,wh=PAD+70,PAD+80,220,110
    rbox(d,[wx,wy,wx+ww,wy+wh],18,fill=(12,16,40,255),outline=WHITE+(230,),w=4)
    d.ellipse([wx+ww-46,wy+wh//2-12,wx+ww-22,wy+wh//2+12],outline=WHITE+(230,),width=4)
    ctext(d,PAD+Wc//2,PAD+210,"TA POCHE",F(40),WHITE)
    # barre indigo (interdiction)
    d.line([PAD+30,PAD+Hc-30,PAD+Wc-30,PAD+40],fill=INDIGO+(255,),width=12)
    canvas.save('assets/ins_poche.png')
    print('assets/ins_poche.png', canvas.size)

if __name__=='__main__':
    hsep(); hflow(); hfortune(); cta(); ins_poche()
    import shutil; shutil.rmtree('broll/_f',ignore_errors=True)
    for n in ['hsep','hflow','hfortune','cta']:
        p=f'broll/{n}.mp4'; print(p, os.path.getsize(p) if os.path.exists(p) else 'MISSING')
