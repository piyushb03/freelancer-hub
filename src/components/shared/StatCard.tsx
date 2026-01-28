import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    positive: boolean;
  };
  className?: string;
  variant?: 'default' | 'primary' | 'accent' | 'success';
}

const variantStyles = {
  default: 'bg-card',
  primary: 'gradient-primary text-primary-foreground',
  accent: 'gradient-accent text-accent-foreground',
  success: 'gradient-success text-success-foreground',
};

export function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  trend, 
  className,
  variant = 'default'
}: StatCardProps) {
  const isGradient = variant !== 'default';

  return (
    <div 
      className={cn(
        "relative overflow-hidden rounded-xl p-6 shadow-md transition-all duration-300 hover-lift",
        variantStyles[variant],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className={cn(
            "text-sm font-medium",
            isGradient ? "text-current opacity-80" : "text-muted-foreground"
          )}>
            {title}
          </p>
          <p className={cn(
            "text-3xl font-bold tracking-tight",
            !isGradient && "text-foreground"
          )}>
            {value}
          </p>
          {subtitle && (
            <p className={cn(
              "text-sm",
              isGradient ? "text-current opacity-70" : "text-muted-foreground"
            )}>
              {subtitle}
            </p>
          )}
          {trend && (
            <div className={cn(
              "inline-flex items-center text-xs font-medium px-2 py-1 rounded-full",
              isGradient 
                ? "bg-white/20"
                : trend.positive 
                  ? "bg-success/10 text-success" 
                  : "bg-destructive/10 text-destructive"
            )}>
              {trend.positive ? '↑' : '↓'} {trend.value}
            </div>
          )}
        </div>
        <div className={cn(
          "p-3 rounded-xl",
          isGradient ? "bg-white/20" : "bg-muted"
        )}>
          {icon}
        </div>
      </div>
      
      {/* Decorative element */}
      <div className={cn(
        "absolute -bottom-4 -right-4 w-24 h-24 rounded-full opacity-10",
        isGradient ? "bg-white" : "bg-primary"
      )} />
    </div>
  );
}
