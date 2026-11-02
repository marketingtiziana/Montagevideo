import type { SchemaProps } from './index';
import { INK, NAVY, SchemaBox, SchemaSvg, StraightArrow } from './primitives';

/** Flux d'argent : Client → facture → LLC (compte US) → distribution → Membre → impôt dans son pays. */
export default function Moneyflow({ accent, soft, ink, seed }: SchemaProps) {
  return (
    <SchemaSvg label="Le circuit de l’argent dans une LLC" height={236}>
      {/* Ligne du haut */}
      <SchemaBox x={12} y={30} w={66} h={40} lines={['Client']} fill="#ffffff" stroke={soft} color={INK} tag="n’importe où" />
      <StraightArrow from={[78, 50]} to={[146, 50]} stroke={accent} seed={`${seed}-1`} label="facture" labelColor={ink} />
      <SchemaBox x={146} y={24} w={116} h={52} lines={['LLC', 'compte bancaire US']} fill={NAVY} stroke={NAVY} color="#ffffff" size={10.5} weight={800} radius={12} />
      <text x={296} y={44} textAnchor="middle" fontSize={8.5} fontWeight={600} fill={INK}>
        Stripe
      </text>
      <text x={296} y={56} textAnchor="middle" fontSize={8.5} fontWeight={600} fill={INK}>
        PayPal
      </text>
      <StraightArrow from={[284, 62]} to={[264, 56]} stroke={accent} seed={`${seed}-pay`} width={1.4} />

      {/* Descente vers le membre */}
      <StraightArrow from={[204, 76]} to={[204, 124]} stroke={accent} seed={`${seed}-2`} label="distribution" labelColor={ink} />
      <SchemaBox x={154} y={124} w={100} h={40} lines={['Membre']} fill="#ffffff" stroke={accent} color={ink} size={12} />

      {/* Imposition dans le pays de résidence */}
      <StraightArrow from={[204, 164]} to={[204, 196]} stroke={accent} seed={`${seed}-3`} label="déclare" labelColor={ink} />
      <SchemaBox x={98} y={196} w={212} h={32} lines={['Impôt dans le pays de résidence du membre']} fill={soft} stroke={soft} color={INK} size={9.5} />
    </SchemaSvg>
  );
}
