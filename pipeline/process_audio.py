# -*- coding: utf-8 -*-
# PRIORITÉ: traiter la voix pour un rendu "vrai micro RØDE" (broadcast/podcast).
# Chaîne: dé-rumble -> denoise spectral -> de-ess -> EQ (chaleur/présence/air) ->
#         compression broadcast -> exciter d'air léger -> loudnorm (social) -> limiteur.
# Source = micro de téléphone (mono, ambiance/pièce, aigus fins) -> son plein, chaud, présent.
import subprocess, imageio_ffmpeg, re, sys
FF = imageio_ffmpeg.get_ffmpeg_exe()

SRC = 'source.mp4'
OUT = 'voice_rode.wav'

# --- Chaîne de traitement voix facon RØDE (NT1 / broadcast) ---
CHAIN = ",".join([
    # 1) haut-parleur anti-rumble + coupe subsonique (bruit de manip / clim)
    "highpass=f=80:poles=2",
    # 2) débruitage spectral doux (enlève le souffle/pièce sans artefacts)
    "afftdn=nr=13:nf=-24:tn=1",
    # 3) noise gate très léger: baisse le fond entre les phrases, garde le naturel
    "agate=threshold=0.018:ratio=1.6:attack=12:release=220:makeup=1",
    # 4) de-esser: dompte la sibilance ("s","ch") -> son doux type grande capsule
    "deesser=i=0.35:m=0.5:f=0.18",
    # 5) EQ signature RØDE:
    #    - corps/chaleur bas-medium
    "equalizer=f=180:t=q:w=1.1:g=2.2",
    #    - dé-boxe le medium bas (enleve le côté "tél/pièce")
    "equalizer=f=430:t=q:w=1.4:g=-2.2",
    #    - creux léger sur la dureté
    "equalizer=f=2200:t=q:w=2.0:g=-1.2",
    #    - présence/intelligibilité (proximité micro)
    "equalizer=f=4200:t=q:w=1.3:g=3.0",
    #    - "air" brillance broadcast (shelf haut)
    "highshelf=f=9500:g=3.2",
    # 6) compression broadcast: densité + niveau constant
    "acompressor=threshold=-20dB:ratio=3.4:attack=8:release=140:makeup=3:knee=4",
    # 7) 2e compression douce (glue) pour un rendu "grand micro"
    "acompressor=threshold=-14dB:ratio=2.0:attack=20:release=250:makeup=1.5:knee=6",
    # 8) normalisation loudness cible réseaux sociaux
    "loudnorm=I=-14:TP=-1.3:LRA=10",
    # 9) resample propre + limiteur de sécurité
    "aresample=48000",
    "alimiter=limit=0.95:level=false",
])

cmd = [FF, '-y', '-i', SRC, '-vn',
       '-af', CHAIN,
       '-ac', '2', '-ar', '48000', '-c:a', 'pcm_s16le', OUT]
r = subprocess.run(cmd, capture_output=True, text=True)
print('rc:', r.returncode)
if r.returncode:
    print(r.stderr[-2000:]); sys.exit(1)

# Mesure du résultat (loudness + pics)
meas = subprocess.run([FF, '-i', OUT, '-af',
    'loudnorm=I=-14:TP=-1.3:LRA=10:print_format=summary,volumedetect',
    '-f', 'null', '-'], capture_output=True, text=True).stderr
for key in ['Input Integrated', 'Input True Peak', 'Output Integrated',
            'Output True Peak', 'max_volume', 'mean_volume']:
    m = re.search(rf'{re.escape(key)}.*', meas)
    if m: print(m.group(0).strip())
print('->', OUT)
