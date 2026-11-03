import type { SchemaProps } from './index';
import { INK, MUTED, NAVY, RoughArrow, SchemaBox, SchemaSvg, StraightArrow } from './primitives';

/** Organigramme : Membre(s) → LLC → Manager (optionnel) ; Registered Agent à côté ; Secretary of State et IRS au-dessus. */
export default function Orgchart({ accent, soft, ink, seed }: SchemaProps) {
  return (
    <SchemaSvg label="Organigramme d’une LLC" height={236}>
      {/* Administrations, au-dessus */}
      <SchemaBox x={38} y={18} w={112} h={34} lines={['Secretary of State']} fill={soft} stroke={soft} color={INK} size={10.5} tag="État" />
      <SchemaBox x={190} y={18} w={112} h={34} lines={['IRS']} fill={soft} stroke={soft} color={INK} size={10.5} tag="Fédéral" />
      <StraightArrow from={[108, 54]} to={[150, 92]} stroke={MUTED} seed={`${seed}-sos`} label="enregistre" />
      <StraightArrow from={[232, 54]} to={[190, 92]} stroke={MUTED} seed={`${seed}-irs`} label="EIN" />

      {/* LLC au centre */}
      <SchemaBox x={125} y={94} w={90} h={44} lines={['LLC']} fill={NAVY} stroke={NAVY} color="#ffffff" weight={900} size={16} radius={12} />

      {/* Registered Agent, à côté */}
      <SchemaBox x={236} y={99} w={92} h={34} lines={['Registered', 'Agent']} fill="#ffffff" stroke={accent} color={INK} size={10} dashed />
      <RoughArrow d="M 215 116 L 236 116" stroke={accent} seed={`${seed}-ra`} />
      <text x={282} y={146} textAnchor="middle" fontSize={8.5} fontWeight={600} fill={MUTED}>
        adresse officielle
      </text>

      {/* Membre(s) → LLC → Manager */}
      <SchemaBox x={14} y={178} w={104} h={40} lines={['Membre(s)']} fill="#ffffff" stroke={accent} color={ink} size={11.5} tag="propriétaires" tagColor={ink} />
      <StraightArrow from={[118, 198]} to={[170, 140]} stroke={accent} seed={`${seed}-member`} label="possède" labelColor={ink} />
      <SchemaBox x={218} y={178} w={108} h={40} lines={['Manager']} fill="#ffffff" stroke={accent} color={ink} size={11.5} dashed tag="optionnel" tagColor={ink} />
      <StraightArrow from={[232, 180]} to={[176, 140]} stroke={accent} seed={`${seed}-manager`} label="dirige" labelColor={ink} />
    </SchemaSvg>
  );
}
