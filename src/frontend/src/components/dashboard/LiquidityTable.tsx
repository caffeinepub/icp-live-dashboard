import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { motion } from "motion/react";

interface BarPoint {
  pos: number;
  value: number;
}

interface LiquidityPool {
  pool: string;
  platform: string;
  price: number;
  change24h: number;
  volume24h: number;
  liquidity: number;
  activity: BarPoint[];
}

function makeActivity(vals: number[]): BarPoint[] {
  return vals.map((value, pos) => ({ pos, value }));
}

const POOLS: LiquidityPool[] = [
  {
    pool: "ICP / USDT",
    platform: "ICPSwap",
    price: 12.48,
    change24h: 2.34,
    volume24h: 8_420_000,
    liquidity: 32_100_000,
    activity: makeActivity([4, 6, 5, 8, 7, 9, 8, 10, 9, 11]),
  },
  {
    pool: "ICP / ckBTC",
    platform: "ICPSwap",
    price: 0.000248,
    change24h: -1.12,
    volume24h: 3_200_000,
    liquidity: 15_800_000,
    activity: makeActivity([7, 5, 6, 4, 5, 4, 3, 5, 4, 3]),
  },
  {
    pool: "ICP / USDC",
    platform: "Sonic",
    price: 12.51,
    change24h: 1.87,
    volume24h: 2_100_000,
    liquidity: 9_400_000,
    activity: makeActivity([3, 4, 5, 6, 5, 7, 6, 8, 7, 9]),
  },
  {
    pool: "ICP / ETH",
    platform: "InfinitySwap",
    price: 0.00385,
    change24h: -3.41,
    volume24h: 1_540_000,
    liquidity: 7_200_000,
    activity: makeActivity([8, 6, 5, 4, 5, 3, 4, 3, 2, 3]),
  },
  {
    pool: "ckBTC / USDT",
    platform: "ICPSwap",
    price: 51_240.0,
    change24h: 0.92,
    volume24h: 5_800_000,
    liquidity: 22_600_000,
    activity: makeActivity([5, 6, 7, 6, 8, 7, 9, 8, 10, 9]),
  },
  {
    pool: "SNS-1 / ICP",
    platform: "Sonic",
    price: 0.0842,
    change24h: 5.23,
    volume24h: 420_000,
    liquidity: 1_800_000,
    activity: makeActivity([2, 3, 4, 6, 8, 9, 10, 11, 13, 15]),
  },
];

function MiniBar({ data }: { data: BarPoint[] }) {
  const max = Math.max(...data.map((d) => d.value));
  return (
    <div className="flex items-end gap-0.5 h-6">
      {data.map((bar) => (
        <div
          key={bar.pos}
          className="w-1.5 rounded-sm"
          style={{
            height: `${(bar.value / max) * 100}%`,
            background: `oklch(0.78 0.12 195 / ${0.4 + (bar.value / max) * 0.6})`,
          }}
        />
      ))}
    </div>
  );
}

function formatPrice(price: number) {
  if (price >= 1000)
    return `$${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  if (price >= 1) return `$${price.toFixed(2)}`;
  return `$${price.toFixed(6)}`;
}

export function LiquidityTable() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.25 }}
      className="card-glass rounded-lg p-5 shadow-card"
      data-ocid="liquidity.table"
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold text-foreground">
          Liquidity Moves
        </span>
        <span className="text-xs text-muted-foreground">Top ICP Pools</span>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border/30 hover:bg-transparent">
              <TableHead className="text-muted-foreground text-xs">
                Pool
              </TableHead>
              <TableHead className="text-muted-foreground text-xs">
                Price
              </TableHead>
              <TableHead className="text-muted-foreground text-xs">
                24h Change
              </TableHead>
              <TableHead className="text-muted-foreground text-xs">
                Volume 24h
              </TableHead>
              <TableHead className="text-muted-foreground text-xs">
                Liquidity
              </TableHead>
              <TableHead className="text-muted-foreground text-xs">
                Activity
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {POOLS.map((pool, i) => (
              <TableRow
                key={pool.pool}
                className="border-border/20 hover:bg-accent/30 transition-colors"
                data-ocid={`liquidity.item.${i + 1}`}
              >
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-foreground">
                      {pool.pool}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {pool.platform}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-sm text-foreground">
                  {formatPrice(pool.price)}
                </TableCell>
                <TableCell>
                  <span
                    className={`text-sm font-semibold ${
                      pool.change24h >= 0 ? "text-green" : "text-red-custom"
                    }`}
                  >
                    {pool.change24h >= 0 ? "+" : ""}
                    {pool.change24h.toFixed(2)}%
                  </span>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  ${(pool.volume24h / 1_000_000).toFixed(2)}M
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  ${(pool.liquidity / 1_000_000).toFixed(1)}M
                </TableCell>
                <TableCell>
                  <MiniBar data={pool.activity} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </motion.div>
  );
}
