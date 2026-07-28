// Charge data/edit.json et expose des types. TOUT est piloté par ce JSON.
import editData from "../data/edit.json";

export type CaptionWord = { w: string; start: number; end: number; accent: boolean };

export type Camera =
  | { type: "punch_in"; from: number; to: number; easing?: string }
  | { type: "snap_zoom"; from: number; to: number }
  | { type: "drift"; px: number }
  | { type: "shake"; px: number; on?: string }
  | { type: "static" };

export type Overlay =
  | {
      type: "stat_counter";
      value: string;
      label: string;
      in: number;
      duration: number;
      anchor: string;
    }
  | {
      type: "lower_third";
      value: string;
      label: string;
      in: number;
      duration: number;
      anchor: string;
    }
  | null;

export type TransitionIn =
  | "hard_cut"
  | "whip_left"
  | "whip_right"
  | "flash"
  | "zoom_blur";

export type Segment = {
  id: string;
  role: string;
  src_in: number;
  src_out: number;
  out_start: number;
  out_end: number;
  dur: number;
  text: string;
  camera: Camera;
  transition_in: TransitionIn;
  sfx: string[];
  overlay: Overlay;
  caption_words: CaptionWord[];
};

export type EditDoc = {
  meta: {
    target_duration: number;
    fps: number;
    width: number;
    height: number;
    source: string;
    source_fps: number;
    whisper_model: string;
  };
  segments: Segment[];
  global_overlays: { type: string; anchor: string; height_px: number }[];
  music: { track: string; in: number; gain_db: number; duck_db: number; status: string };
  sfx_bank: Record<string, string>;
  captions: Record<string, unknown>;
  master: { target_lufs: number; true_peak_dbtp: number };
};

export const EDIT = editData as unknown as EditDoc;
