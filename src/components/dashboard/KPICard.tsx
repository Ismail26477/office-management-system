import { cn } from "@/lib/utils";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
  className?: string;
  delay?: number;
}

export function KPICard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  iconColor = "text-primary",
  iconBgColor = "bg-primary/10",
  className,
  delay = 0
}: KPICardProps) {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  return (
    <div 
      className={cn(
        "kpi-card opacity-0 animate-slide-up",
        className
      )}
      style={{ animationDelay: `${delay * 100}ms`, animationFillMode: 'forwards' }}
    >
      <div className="flex items-start justify-between">
        <div className={cn("p-3 rounded-xl", iconBgColor)}>
          <Icon className={cn("h-6 w-6", iconColor)} />
        </div>
        {change !== undefined && (
          <div className={cn(
            "flex items-center gap-1 text-sm font-medium",
            isPositive && "text-success",
            isNegative && "text-destructive",
            !isPositive && !isNegative && "text-muted-foreground"
          )}>
            {isPositive && <TrendingUp className="h-4 w-4" />}
            {isNegative && <TrendingDown className="h-4 w-4" />}
            <span>{isPositive ? "+" : ""}{change}%</span>
          </div>
        )}
      </div>
      <div className="mt-4">
        <h3 className="text-2xl font-bold text-foreground">{value}</h3>
        <p className="text-sm text-muted-foreground mt-1">{title}</p>
      </div>
    </div>
  );
}
