
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Extending badge with additional custom variants
export function SuccessBadge({ children, className, ...props }: React.ComponentProps<typeof Badge>) {
  return (
    <Badge 
      {...props} 
      variant="secondary"
      className={cn("bg-green-500 text-white", className)}
    >
      {children}
    </Badge>
  );
}

export function WarningBadge({ children, className, ...props }: React.ComponentProps<typeof Badge>) {
  return (
    <Badge 
      {...props} 
      variant="outline"
      className={cn("bg-amber-500 text-white", className)}
    >
      {children}
    </Badge>
  );
}
