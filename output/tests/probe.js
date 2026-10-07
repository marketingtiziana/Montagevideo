export default async ({ project, text, rect, media, path, frame, icon }) => {
  const p = await project({ dir: "tp", size: "1080x1920", fps: 30, background: "#0F0F12" });
  const v = await p.add("src.mp4");
  p.cut(v, { from: 0, dur: 6, fit: "cover" });
  const grain = `vec4 pixel(vec2 uv){ vec4 c=texture(u_src,uv); float n=fract(sin(dot(uv*u_resolution+u_time*61.0,vec2(12.9898,78.233)))*43758.5453)-0.5; vec2 d=uv-0.5; float vig=1.0-u_vig*smoothstep(0.35,0.9,length(d*vec2(1.0,0.8))*1.4); vec3 rgb=(c.rgb+n*u_amt)*vig; return vec4(rgb*c.a,c.a);}`;
  p.compose(media({ file: v, x: 0, y: 0, width: 1080, height: 1920, fit: "cover", trimStart: 0,
    effects: [{ kind: "shader", params: { glsl: grain, amt: 0.035, vig: 0.12 } }],
    motionBlur: { samples: 6, shutter: 0.5 },
    animate: [{ property: "scale", keyframes: [{ at: 0, value: 1 }, { at: 1, value: 1, easing: "ease-out" }, { at: 1.25, value: 1.08 }, { at: 2.5, value: 1.08, easing: "hold" }, { at: 2.53, value: 1 }, { at: 3.0, value: 1, easing: "ease-in" }, { at: 3.1, value: 1.22, easing: "ease-out" }, { at: 3.2, value: 1 }] },
      { property: "offsetY", keyframes: [{ at: 0, value: 0 }, { at: 5.9, value: -8 }], easing: "linear" }] }), { at: 0, dur: 6 });
  // karaoke group
  const words = ["ARRÊTEZ", "DE", "VOUS", "ASSOCIER"];
  p.compose(frame({ x: 60, y: 1400, width: 960, height: 170, layout: "row", wrap: true, gap: 16, align: "center", justify: "center" },
    words.map((w, i) => text(w, { fontFamily: "Montserrat", fontWeight: 700, fontSize: 68, color: "#FFFFFF", width: undefined,
      shadow: { x: 0, y: 4, blur: 18, color: "#00000099" },
      animate: [{ property: "color", keyframes: [{ at: 0, value: "#FFFFFF", easing: "hold" }, { at: 0.3 + i * 0.4, value: "#F2B544", easing: "hold" }, { at: 0.7 + i * 0.4, value: "#FFFFFF" }] }] }))), { at: 0.5, dur: 2.5 });
  // card pop
  p.compose(frame({ x: 140, y: 1040, width: 800, height: 150, origin: "center", layout: "row", gap: 20, align: "center", justify: "center", background: "#0F0F12E6", radius: 28, shadow: { x: 0, y: 10, blur: 30, color: "#00000080" },
    motion: { enter: { from: { scale: 0, opacity: 0 }, duration: 0.35, easing: { kind: "spring" } }, exit: { to: { scale: 0.9, opacity: 0 }, duration: 0.25 } } },
    [icon("gem", { size: 64, color: "#F2B544", strokeWidth: 2 }), text("S'ASSOCIER = UN MARIAGE", { fontFamily: "Montserrat", fontWeight: 700, fontSize: 50, color: "#FFFFFF", width: 640, motion: { by: "word", from: { opacity: 0, y: 16 }, duration: 0.3, overlap: 0.5, easing: "ease-out" } })]), { at: 0.2, dur: 2.2 });
  // rising curve wipe
  p.compose(path({ x: 190, y: 1000, width: 700, height: 320, d: "M 10 300 C 250 290 380 200 460 140 C 540 80 620 40 690 12", stroke: { width: 4, color: "#F2B544", cap: "round" },
    shadow: { x: 0, y: 4, blur: 12, color: "#00000080" },
    mask: { shape: "rectangle", x: 0, y: 0, width: 0, height: 320 },
    animate: [{ property: "maskWidth", from: 0, to: 700, duration: 1.3, easing: "ease-in-out" }, { property: "opacity", keyframes: [{ at: 0, value: 1 }, { at: 2.2, value: 1 }, { at: 2.5, value: 0 }] }] }), { at: 3, dur: 2.5 });
  await p.frame(1.2, "renders/f1.png");
  await p.frame(4.2, "renders/f2.png");
  await p.frame(3.12, "renders/f3.png");
};
