interface ClusterTagProps {
  label: string;
  /** Couleur du point. */
  color: string;
  /** Couleur du texte (contraste AA). Par défaut : `color`. */
  ink?: string;
  soft?: string;
  light?: boolean;
}

export default function ClusterTag({ label, color, ink, soft, light }: ClusterTagProps) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
      style={
        light
          ? { background: 'rgba(255,255,255,0.14)', color: '#ffffff' }
          : { background: soft ?? '#E7EAF0', color: ink ?? color }
      }
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: light ? '#ffffff' : color }} />
      {label}
    </span>
  );
}
