# Pipeline v2 — reel « LLC américaine » (Fynovates)

Chaîne complète rush paysage → reel vertical 1080x1920 30 fps avec dérushage, recadrage dynamique,
sous-titres karaoké, motion design devant/derrière (détourage BiRefNet) et mix audio.

```
work/
  scripts/
    transcribe.py / transcribe_novad.py   Whisper large-v3 (faster-whisper, CPU int8), mots horodatés
    facetrack.py                          suivi visage/yeux (YuNet) sur le rush -> src/face.json
    edl.py                                EDL : plages source conservées + coupes (à éditer pour changer le montage)
    report.py                             -> output/derush-report.md
    cut.py                                coupe audio (fondus 6 ms) + vidéo 30 fps -> cut/cut_1080p.mp4, cut/cut_audio.wav
    shots.py                              échelle de plan + micro-zoom par segment
    pass1_reframe.py                      recadrage 9:16 (yeux au tiers supérieur), zooms, étalonnage -> cut/base.mp4
    align.py                              script corrigé (mots-clés *ainsi*) aligné sur la transcription du montage -> groupes 2-4 mots
    plan_fx.py                            cards devant + effets derrière (temps source -> timeline finale) -> cut/fx.json
    render_overlay.js                     Playwright + GSAP : séquences PNG transparentes (front / behind)
    masks.py                              BiRefNet-portrait sur les plages "derrière" (1 image/2, interpolées)
    synth_audio.py                        lit musical synthétique (100 BPM) + SFX whoosh/pop/impact
    audio_mix.py                          voix (de-esser, compression, -14 LUFS) + musique -24 dB avec sidechain + SFX
    pass3_composite.py                    base + derrière (via masque) + devant, fondu 8 images, H.264 CRF 18 / AAC 192k
    check_layout.py                       vérifie qu'aucun overlay ne couvre la zone yeux-bouche
  overlay/overlay.html                    design system des overlays (Inter / IBM Plex Mono / #4353FF)
  run_all.sh                              enchaîne tout après modification de l'EDL
```

Rendu final : `python3 scripts/pass3_composite.py final ../output/reel-final.mp4`
Previews : `python3 scripts/pass3_composite.py preview ../output/preview-frames nom=frame ...`
