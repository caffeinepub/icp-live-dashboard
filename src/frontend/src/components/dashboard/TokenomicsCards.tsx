import { Skeleton } from "@/components/ui/skeleton";
import { useTokenomics } from "@/hooks/useTokenomics";
import { Coins, Flame, TrendingUp } from "lucide-react";

function StatCard({
  title,
  value,
  sub,
  icon,
  accentClass,
  isLoading,
}: {
  title: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
  accentClass: string;
  isLoading: boolean;
}) {
  return (
    <div className="card-glass rounded-lg p-5 shadow-card flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground uppercase tracking-wider">
          {title}
        </span>
        <span className={accentClass}>{icon}</span>
      </div>
      {isLoading ? (
        <Skeleton className="h-7 w-28" />
      ) : (
        <div className={`text-2xl font-bold ${accentClass}`}>{value}</div>
      )}
      <div className="text-xs text-muted-foreground">{sub}</div>
    </div>
  );
}

export function TokenomicsCards({ icpPrice }: { icpPrice: number }) {
  const { data, isLoading } = useTokenomics();

  const burned = data?.totalBurned ?? 30_000_000;
  const minted = data?.totalMinted ?? 580_000_000;
  const supply = data?.currentSupply ?? 468_000_000;

  return (
    <div className="grid grid-cols-3 gap-4">
      <StatCard
        title="Total Supply Burned"
        value={`${(burned / 1_000_000).toFixed(2)}M ICP`}
        sub={`≈ $${((burned * icpPrice) / 1_000_000).toFixed(0)}M USD value destroyed`}
        icon={<Flame className="h-4 w-4" />}
        accentClass="text-orange"
        isLoading={isLoading}
      />
      <StatCard
        title="Total Minted All-Time"
        value={`${(minted / 1_000_000).toFixed(1)}M ICP`}
        sub="Genesis + node & staking rewards"
        icon={<Coins className="h-4 w-4" />}
        accentClass="text-cyan"
        isLoading={isLoading}
      />
      <StatCard
        title="Current Circulating"
        value={`${(supply / 1_000_000).toFixed(1)}M ICP`}
        sub={`${((supply / minted) * 100).toFixed(1)}% of all ever minted`}
        icon={<TrendingUp className="h-4 w-4" />}
        accentClass="text-green"
        isLoading={isLoading}
      />
    </div>
  );
}
