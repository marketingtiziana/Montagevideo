import { Config } from "@remotion/cli/config";

// Chromium pré-installé dans l'environnement (remotion.media bloqué par le proxy)
Config.setBrowserExecutable("/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell");
// WebGL logiciel fiable en headless sans GPU (nécessaire pour @remotion/three)
Config.setChromiumOpenGlRenderer("swangle");
Config.setVideoImageFormat("jpeg");
Config.setConcurrency(3);
