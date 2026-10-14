import type { LucideIcon } from "lucide-react";
import { Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

/**
 * Placeholder card for features that are planned but not built.
 */
export function ComingSoonCard({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <Card className="border-dashed p-6">
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="bg-muted flex h-9 w-9 shrink-0 items-center justify-center rounded-md"
        >
          <Icon className="h-4 w-4" />
        </span>

        <div className="min-w-0 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold leading-none">{title}</h3>
            <Badge>
              <Lock className="h-3 w-3" aria-hidden="true" />
              Coming soon
            </Badge>
          </div>

          <p className="text-muted-foreground text-sm">{description}</p>
        </div>
      </div>
    </Card>
  );
}
