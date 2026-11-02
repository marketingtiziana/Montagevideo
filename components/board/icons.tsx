import {
  AlertTriangle,
  Bell,
  Building2,
  Calendar,
  Check,
  CreditCard,
  FileText,
  Image as ImageIcon,
  Landmark,
  Laptop,
  Mail,
  Receipt,
  Sparkles,
  User,
  Wallet,
  X,
  type LucideProps,
} from "lucide-react";
import type { IconName } from "@/data/types";

const ICONS: Record<IconName, React.ComponentType<LucideProps>> = {
  mail: Mail,
  bell: Bell,
  alert: AlertTriangle,
  file: FileText,
  wallet: Wallet,
  calendar: Calendar,
  user: User,
  building: Building2,
  check: Check,
  x: X,
  landmark: Landmark,
  receipt: Receipt,
  laptop: Laptop,
  "credit-card": CreditCard,
  image: ImageIcon,
  sparkles: Sparkles,
};

export function Icon({ name, ...props }: { name: IconName } & LucideProps) {
  const Cmp = ICONS[name];
  return <Cmp {...props} />;
}
