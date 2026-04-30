import { Mail, MessageCircle, Smartphone, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Channel chips data ──────────────────────────────────────────────────────

export const CHANNELS = [
  { value: "email", label: "Email", icon: Mail },
  { value: "whatsapp", label: "WhatsApp", icon: MessageCircle },
  { value: "sms", label: "SMS", icon: Smartphone },
  { value: "push", label: "Push", icon: Bell },
] as const;

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ResultsToolbarProps {
  channels: string[];
  onChannelsChange: (v: string[]) => void;
  resultCount?: number;
  isLoading?: boolean;
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────
// Multi-select channel chips. Empty array = "Todos" (show all channels).

export function ResultsToolbar({
  channels,
  onChannelsChange,
  resultCount,
  isLoading,
  className,
}: ResultsToolbarProps) {
  const allSelected = channels.length === 0;

  const toggleChannel = (value: string) => {
    if (channels.includes(value)) {
      onChannelsChange(channels.filter((c) => c !== value));
    } else {
      onChannelsChange([...channels, value]);
    }
  };

  return (
    <div
      className={cn(
        "bg-background/96 backdrop-blur-md border-b border-border/50",
        className
      )}
    >
      <div className="container">
        <div className="flex items-center justify-between gap-4 py-2.5">

          {/* ── Channel chips (left) ── */}
          <div className="overflow-x-auto shrink-0">
            <div
              className="flex items-center gap-[6px] w-fit"
              role="group"
              aria-label="Filtrar por canal"
            >
              {/* "Todos" chip */}
              <button
                onClick={() => onChannelsChange([])}
                className={cn(
                  "flex items-center px-3 py-[6px] rounded-full text-[12.5px] font-medium whitespace-nowrap transition-all duration-150 border",
                  allSelected
                    ? "bg-primary/10 border-primary/25 text-primary"
                    : "bg-muted/40 border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted/60"
                )}
              >
                Todos
              </button>

              {/* Individual channel chips */}
              {CHANNELS.map((ch) => {
                const Icon = ch.icon;
                const isActive = channels.includes(ch.value);
                return (
                  <button
                    key={ch.value}
                    onClick={() => toggleChannel(ch.value)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-[6px] rounded-full text-[12.5px] font-medium whitespace-nowrap transition-all duration-150 border",
                      isActive
                        ? "bg-primary/10 border-primary/25 text-primary"
                        : "bg-muted/40 border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted/60"
                    )}
                  >
                    <Icon
                      style={{ width: "12px", height: "12px" }}
                      className="shrink-0"
                    />
                    {ch.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Result count (right) ── */}
          <div className="shrink-0 tabular-nums text-right hidden sm:block min-w-[80px]">
            {isLoading ? (
              <span className="text-[13px] text-muted-foreground/40">—</span>
            ) : resultCount !== undefined ? (
              <span className="text-[13px] text-muted-foreground">
                <span className="font-semibold text-foreground/80">
                  {resultCount}
                </span>{" "}
                {resultCount === 1 ? "template" : "templates"}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
