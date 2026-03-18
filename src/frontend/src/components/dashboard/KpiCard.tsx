import { Skeleton } from "@/components/ui/skeleton";
import { TrendingDown, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import type { ReactNode } from "react";
import {
  Line,
  LineChart,
  Tooltip as ReTooltip,
  ResponsiveContainer,
} from "recharts";

interface SparklinePoint {
  value: number;
}

interface KpiCardProps {
  title: string;
  value: string;
  change?: number;
  changeLabel?: string;
  icon?: ReactNode;
  sparklineData?: SparklinePoint[];
  accentColor?: "cyan" | "green" | "orange";
  isLoading?: boolean;
  children?: ReactNode;
}

const accentMap = {
  cyan: {
    line: "oklch(0.78 0.12 195)",
    glow: "glow-cyan-sm",
    border: "border-cyan",
    bg: "bg-cyan-subtle",
  },
  green: {
    line: "oklch(0.72 0.18 145)",
    glow: "glow-green",
    border: "",
    bg: "bg-green-subtle",
  },
  orange: {
    line: "oklch(0.76 0.16 75)",
    glow: "glow-orange",
    border: "border-orange",
    bg: "bg-orange-subtle",
  },
};

export function KpiCard({
  title,
  value,
  change,
  changeLabel,
  icon,
  sparklineData,
  accentColor = "cyan",
  isLoading,
  children,
}: KpiCardProps) {
  const accent = accentMap[accentColor];
  const isPositive = change !== undefined ? change >= 0 : true;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`card-glass rounded-lg p-5 shadow-card ${accent.glow} flex flex-col gap-3`}
    >
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
          {title}
        </span>
        {icon && (
          <span className={`p-1.5 rounded-md ${accent.bg} text-cyan`}>
            {icon}
          </span>
        )}
      </div>

      {isLoading ? (
        <>
          <Skeleton className="h-9 w-32 bg-muted" />
          <Skeleton className="h-4 w-20 bg-muted" />
        </>
      ) : (
        <>
          <div className="text-3xl font-bold text-foreground tracking-tight">
            {value}
          </div>

          {change !== undefined && (
            <div
              className={`flex items-center gap-1 text-xs font-medium ${
                isPositive ? "text-green" : "text-red-custom"
              }`}
            >
              {isPositive ? (
                <TrendingUp className="h-3.5 w-3.5" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5" />
              )}
              {isPositive ? "+" : ""}
              {change.toFixed(2)}% {changeLabel ?? "24h"}
            </div>
          )}

          {children}
        </>
      )}

      {sparklineData && sparklineData.length > 0 && (
        <div className="h-12 mt-1">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparklineData}>
              <ReTooltip contentStyle={{ display: "none" }} cursor={false} />
              <Line
                type="monotone"
                dataKey="value"
                stroke={accent.line}
                strokeWidth={2}
                dot={false}
                strokeLinecap="round"
                style={{
                  filter: `drop-shadow(0 0 6px ${accent.line})`,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  );
}
