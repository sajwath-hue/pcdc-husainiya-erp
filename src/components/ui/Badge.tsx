import { cn } from "@/lib/utils";
import { STATUS_BADGE } from "@/lib/utils";

export function Badge({
  children,
  tone,
  className,
}: {
  children: React.ReactNode;
  tone?: keyof typeof STATUS_BADGE | string;
  className?: string;
}) {
  const style = (tone && STATUS_BADGE[tone]) || "bg-slate-100 text-slate-600";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize",
        style,
        className
      )}
    >
      {children}
    </span>
  );
}
