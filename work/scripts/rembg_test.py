import sys, time
from rembg import remove, new_session
from PIL import Image
for m in ["u2net_human_seg","isnet-general-use","birefnet-portrait"]:
    try:
        t=time.time(); s=new_session(m)
        for n in "ab":
            im=Image.open(f"rtest/{n}.png").convert("RGB")
            # crop to 9:16 center region to save time
            im=im.crop((656,0,1264,1080))
            o=remove(im, session=s, alpha_matting=False)
            bg=Image.new("RGBA",o.size,(67,83,255,255)); bg.alpha_composite(o); bg.convert("RGB").save(f"rtest/{n}_{m}.jpg",quality=92)
        print(m,"ok",round(time.time()-t,1),"s")
    except Exception as e: print(m,"FAIL",e)
