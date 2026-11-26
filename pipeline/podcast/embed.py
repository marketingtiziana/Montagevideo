"""Empreintes vocales WeSpeaker ResNet34 (ONNX) sur fenêtres glissantes 1,5 s / pas 0,25 s.
Sortie : work/emb.npz {t: centres (s), e: embeddings L2-normalisés (N,256)}"""
import numpy as np, wave, onnxruntime as ort, kaldi_native_fbank as knf
w = wave.open('work/audio16.wav'); y = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32)
o = knf.FbankOptions(); o.frame_opts.dither = 0; o.frame_opts.samp_freq = 16000; o.mel_opts.num_bins = 80
o.frame_opts.frame_length_ms = 25; o.frame_opts.frame_shift_ms = 10
fb = knf.OnlineFbank(o); fb.accept_waveform(16000, y.tolist()); fb.input_finished()
Fe = np.array([fb.get_frame(i) for i in range(fb.num_frames_ready)], np.float32)   # 100 fps
sess = ort.InferenceSession('models/wespeaker/voxceleb_resnet34_LM.onnx', providers=['CPUExecutionProvider'])
WIN, HOP = 150, 25
starts = np.arange(0, len(Fe) - WIN, HOP)
E = []
for k in range(0, len(starts), 64):
    b = np.stack([Fe[s:s + WIN] - Fe[s:s + WIN].mean(0) for s in starts[k:k + 64]])
    E.append(sess.run(None, {'feats': b})[0])
E = np.concatenate(E); E /= np.linalg.norm(E, axis=1, keepdims=True)
np.savez('work/emb.npz', t=(starts + WIN / 2) / 100, e=E)
print('embeddings', E.shape)
