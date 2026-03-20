import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useTokenomics } from "@/hooks/useTokenomics";
import { AlertCircle, TrendingDown, TrendingUp } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-md px-3 py-2 text-xs shadow-lg">
      <div className="text-muted-foreground">{label}</div>
      <div className="font-bold text-cyan">
        {payload[0].value.toFixed(2)}x ratio
      </div>
    </div>
  );
}

export function MintBurnRatio() {
  const { data, isLoading } = useTokenomics();

  const ratio = data?.mintBurnRatio ?? 19.3;
  const isDeflationary = data?.isDeflationary ?? false;
  const history = data?.ratioHistory ?? [];

  // Compute 7-day trend: compare last 7 avg vs prev 7 avg
  let trendDir: "up" | "down" | "flat" = "flat";
  if (history.length >= 14) {
    const last7 = history.slice(-7).reduce((s, p) => s + p.ratio, 0) / 7;
    const prev7 = history.slice(-14, -7).reduce((s, p) => s + p.ratio, 0) / 7;
    if (last7 < prev7 - 0.05) trendDir = "down";
    else if (last7 > prev7 + 0.05) trendDir = "up";
  }

  return (
    <div
      className="card-glass rounded-lg p-5 shadow-card flex flex-col gap-4"
      data-ocid="mint_burn_ratio.card"
    >
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-semibold text-foreground">
            Mint / Burn Ratio
          </span>
          <span className="text-xs text-muted-foreground">
            How many ICP minted per 1 burned (all-time)
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isLoading ? (
            <Skeleton className="h-6 w-20" />
          ) : (
            <>
              <span className="text-2xl font-bold text-cyan">
                {ratio.toFixed(2)}x
              </span>
              <Badge
                className={`text-xs font-semibold flex items-center gap-1 ${
                  isDeflationary
                    ? "bg-green-subtle text-green border-green-500/30"
                    : "bg-orange-subtle text-orange border-orange-500/30"
                }`}
              >
                {isDeflationary ? (
                  <TrendingDown className="h-3 w-3" />
                ) : (
                  <TrendingUp className="h-3 w-3" />
                )}
                {isDeflationary ? "Deflationary" : "Inflationary"}
              </Badge>
              {trendDir !== "flat" && (
                <Badge className="text-xs bg-accent/40 text-muted-foreground border-border/40 flex items-center gap-1">
                  {trendDir === "down" ? (
                    <TrendingDown className="h-3 w-3 text-green" />
                  ) : (
                    <TrendingUp className="h-3 w-3 text-orange" />
                  )}
                  {trendDir === "down" ? "Trending down" : "Trending up"}
                </Badge>
              )}
            </>
          )}
        </div>
      </div>

      <div className="flex items-start gap-2 p-3 rounded-md bg-accent/20 border border-border/30">
        <AlertCircle className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
        <p className="text-xs text-muted-foreground">
          ICP is <strong className="text-foreground">inflationary</strong> when
          ratio &gt; 1. It becomes{" "}
          <strong className="text-foreground">deflationary</strong> once the
          annual burn rate (transaction fees + NNS) exceeds new issuance from
          node & staking rewards. The ratio trends down as network usage grows.
        </p>
      </div>

      {isLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : (
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={history}
              margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="ratioGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="oklch(0.78 0.12 195)"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="oklch(0.78 0.12 195)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="oklch(0.3 0.01 245 / 0.4)"
              />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 10, fill: "oklch(0.55 0.01 245)" }}
                tickLine={false}
                axisLine={false}
                interval={6}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "oklch(0.55 0.01 245)" }}
                tickLine={false}
                axisLine={false}
                domain={["auto", "auto"]}
                tickFormatter={(v: number) => `${v.toFixed(0)}x`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="ratio"
                stroke="oklch(0.78 0.12 195)"
                strokeWidth={2}
                fill="url(#ratioGrad)"
                dot={false}
                activeDot={{ r: 4, fill: "oklch(0.78 0.12 195)" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        {[
          {
            label: "30d Avg Ratio",
            value: history.length
              ? `${(history.reduce((s, p) => s + p.ratio, 0) / history.length).toFixed(2)}x`
              : "—",
            color: "text-cyan",
          },
          {
            label: "30d High",
            value: history.length
              ? `${Math.max(...history.map((p) => p.ratio)).toFixed(2)}x`
              : "—",
            color: "text-orange",
          },
          {
            label: "30d Low",
            value: history.length
              ? `${Math.min(...history.map((p) => p.ratio)).toFixed(2)}x`
              : "—",
            color: "text-green",
          },
        ].map((item) => (
          <div key={item.label} className="bg-accent/30 rounded-md p-2.5">
            <div className="text-xs text-muted-foreground">{item.label}</div>
            <div className={`text-base font-bold mt-0.5 ${item.color}`}>
              {item.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
