import { Mail, MessageCircle, Smartphone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const typeConfig = {
  email: { icon: Mail, label: "Email", className: "bg-email/10 text-email border-email/20" },
  whatsapp: { icon: MessageCircle, label: "WhatsApp", className: "bg-whatsapp/10 text-whatsapp border-whatsapp/20" },
  sms: { icon: Smartphone, label: "SMS", className: "bg-sms/10 text-sms border-sms/20" },
} as const;

export function TypeBadge({ type }: { type: "email" | "whatsapp" | "sms" }) {
  const config = typeConfig[type];
  const Icon = config.icon;
  return (
    <Badge variant="outline" className={cn("gap-1 font-medium", config.className)}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}
