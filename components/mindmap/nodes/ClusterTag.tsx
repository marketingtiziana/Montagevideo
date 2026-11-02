interface ClusterTagProps {
  label: string;
  color: string;
  soft?: string;
  light?: boolean;
}

export default function ClusterTag({ label, color, soft, light }: ClusterTagProps) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
      style={
        light
          ? { background: 'rgba(255,255,255,0.14)', color: '#ffffff' }
          : { background: soft ?? '#E7EAF0', color }
      }
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: light ? '#ffffff' : color }} />
      {label}
    </span>
  );
}
