import {
  Building2,
  Calendar,
  CreditCard,
  FileSignature,
  FileText,
  Globe,
  Image as ImageIcon,
  Landmark,
  Laptop,
  Mail,
  MapPin,
  Receipt,
  ScrollText,
  User,
  UserCog,
  Users,
  Wallet,
  type LucideProps,
} from "lucide-react";
import type { IconName } from "@/data/types";

const ICONS: Record<IconName, React.ComponentType<LucideProps>> = {
  users: Users,
  "user-cog": UserCog,
  "map-pin": MapPin,
  "file-signature": FileSignature,
  landmark: Landmark,
  building: Building2,
  globe: Globe,
  scroll: ScrollText,
  receipt: Receipt,
  calendar: Calendar,
  wallet: Wallet,
  laptop: Laptop,
  "credit-card": CreditCard,
  mail: Mail,
  user: User,
  image: ImageIcon,
  "file-text": FileText,
};

export function Icon({ name, ...props }: { name: IconName } & LucideProps) {
  const Cmp = ICONS[name];
  return <Cmp {...props} />;
}
