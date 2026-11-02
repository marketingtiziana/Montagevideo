import {
  AlertTriangle,
  BadgeCheck,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  FileSignature,
  Globe,
  Image as ImageIcon,
  Landmark,
  Lightbulb,
  MapPin,
  Pin,
  Receipt,
  Scale,
  ScrollText,
  ShieldCheck,
  Sparkles,
  UserCog,
  Users,
  Wallet,
  XCircle,
  type LucideProps,
} from "lucide-react";
import type { IconName } from "@/data/vertical-types";

const ICONS: Record<IconName, React.ComponentType<LucideProps>> = {
  users: Users,
  "user-cog": UserCog,
  "map-pin": MapPin,
  "file-signature": FileSignature,
  landmark: Landmark,
  building: Building2,
  "shield-check": ShieldCheck,
  globe: Globe,
  scroll: ScrollText,
  "badge-check": BadgeCheck,
  receipt: Receipt,
  calendar: Calendar,
  wallet: Wallet,
  briefcase: Briefcase,
  scale: Scale,
  lightbulb: Lightbulb,
  "alert-triangle": AlertTriangle,
  "check-circle": CheckCircle2,
  "x-circle": XCircle,
  sparkles: Sparkles,
  pin: Pin,
  image: ImageIcon,
};

export function Icon({ name, ...props }: { name: IconName } & LucideProps) {
  const Cmp = ICONS[name];
  return <Cmp {...props} />;
}
