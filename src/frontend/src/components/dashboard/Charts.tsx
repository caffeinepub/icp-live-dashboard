import { motion } from "motion/react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const CYAN = "oklch(0.78 0.12 195)";
const GREEN = "oklch(0.72 0.18 145)";
const ORANGE = "oklch(0.76 0.16 75)";

const tooltipStyle = {
  backgroundColor: "oklch(0.17 0.025 240)",
  border: "1px solid oklch(0.28 0.028 240)",
  borderRadius: "6px",
  color: "oklch(0.92 0.008 240)",
  fontSize: "12px",
};

const axisStyle = {
  fill: "oklch(0.55 0.01 240)",
  fontSize: 11,
};

interface VolumePoint {
  day: string;
  volume: number;
}

interface CanisterPoint {
  month: string;
  canisters: number;
}

function generateVolumeData(): VolumePoint[] {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return days.map((day) => ({
    day,
    volume: Math.floor(Math.random() * 30_000_000 + 20_000_000),
  }));
}

const NODE_DATA = [
  { region: "USA", nodes: 52 },
  { region: "Germany", nodes: 38 },
  { region: "Sweden", nodes: 45 },
  { region: "Japan", nodes: 25 },
  { region: "France", nodes: 30 },
  { region: "Canada", nodes: 22 },
  { region: "UK", nodes: 28 },
  { region: "Netherlands", nodes: 18 },
  { region: "Switzerland", nodes: 15 },
  { region: "Singapore", nodes: 20 },
];

function generateCanisterGrowthData(): CanisterPoint[] {
  const dataPoints: CanisterPoint[] = [];
  const months = [
    "Jan'22",
    "Apr'22",
    "Jul'22",
    "Oct'22",
    "Jan'23",
    "Apr'23",
    "Jul'23",
    "Oct'23",
    "Jan'24",
    "Apr'24",
    "Jul'24",
    "Oct'24",
    "Jan'25",
    "Apr'25",
    "Jul'25",
    "Oct'25",
    "Jan'26",
  ];
  const targets = [
    100_000, 145_000, 190_000, 230_000, 270_000, 320_000, 370_000, 410_000,
    450_000, 490_000, 525_000, 555_000, 575_000, 590_000, 600_000, 610_000,
    620_000,
  ];
  months.forEach((month, i) => {
    dataPoints.push({ month, canisters: targets[i] });
  });
  return dataPoints;
}

const VOLUME_DATA = generateVolumeData();
const CANISTER_DATA = generateCanisterGrowthData();

export function VolumeChart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="card-glass rounded-lg p-5 shadow-card"
      data-ocid="volume_chart.card"
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold text-foreground">
          Network Transaction Volume
        </span>
        <span className="text-xs text-muted-foreground">7-day</span>
      </div>
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={VOLUME_DATA}>
            <defs>
              <linearGradient id="volumeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CYAN} stopOpacity={0.25} />
                <stop offset="95%" stopColor={CYAN} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="oklch(0.28 0.028 240 / 0.3)"
            />
            <XAxis
              dataKey="day"
              tick={axisStyle}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={axisStyle}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => `$${(v / 1_000_000).toFixed(0)}M`}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(v: number) => [
                `$${(v / 1_000_000).toFixed(2)}M`,
                "Volume",
              ]}
            />
            <Area
              type="monotone"
              dataKey="volume"
              stroke={CYAN}
              strokeWidth={2.5}
              fill="url(#volumeGrad)"
              dot={false}
              style={{ filter: `drop-shadow(0 0 6px ${CYAN})` }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

export function NodeProviderChart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="card-glass rounded-lg p-5 shadow-card"
      data-ocid="node_provider_chart.card"
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold text-foreground">
          Node Providers by Region
        </span>
        <span className="text-xs text-muted-foreground">
          ~1,300 nodes total
        </span>
      </div>
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={NODE_DATA}>
            <defs>
              <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CYAN} stopOpacity={0.9} />
                <stop offset="100%" stopColor={CYAN} stopOpacity={0.4} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="oklch(0.28 0.028 240 / 0.3)"
              vertical={false}
            />
            <XAxis
              dataKey="region"
              tick={axisStyle}
              axisLine={false}
              tickLine={false}
            />
            <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="nodes" fill="url(#barGrad)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

export function CanisterGrowthChart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="card-glass rounded-lg p-5 shadow-card"
      data-ocid="canister_growth_chart.card"
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold text-foreground">
          Canister Smart Contracts Growth
        </span>
        <span className="text-xs text-muted-foreground">
          Cumulative · Jan 2022 – present
        </span>
      </div>
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={CANISTER_DATA}>
            <defs>
              <linearGradient id="canisterGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={GREEN} stopOpacity={0.25} />
                <stop offset="95%" stopColor={GREEN} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="oklch(0.28 0.028 240 / 0.3)"
            />
            <XAxis
              dataKey="month"
              tick={axisStyle}
              axisLine={false}
              tickLine={false}
              interval={3}
            />
            <YAxis
              tick={axisStyle}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(v: number) => [`${v.toLocaleString()}`, "Canisters"]}
            />
            <Area
              type="monotone"
              dataKey="canisters"
              stroke={GREEN}
              strokeWidth={2.5}
              fill="url(#canisterGrad)"
              dot={false}
              style={{ filter: `drop-shadow(0 0 6px ${GREEN})` }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

export function MarketCapChart() {
  const data = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    cap: 5_200_000_000 + Math.sin(i * 0.3) * 400_000_000 + i * 15_000_000,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="card-glass rounded-lg p-5 shadow-card"
      data-ocid="market_cap_chart.card"
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold text-foreground">
          Market Cap Trend
        </span>
        <span className="text-xs text-muted-foreground">30-day</span>
      </div>
      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="marketCapGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={ORANGE} stopOpacity={0.25} />
                <stop offset="95%" stopColor={ORANGE} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="oklch(0.28 0.028 240 / 0.3)"
            />
            <XAxis
              dataKey="day"
              tick={axisStyle}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={axisStyle}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) =>
                `$${(v / 1_000_000_000).toFixed(1)}B`
              }
            />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(v: number) => [
                `$${(v / 1_000_000_000).toFixed(2)}B`,
                "Market Cap",
              ]}
            />
            <Area
              type="monotone"
              dataKey="cap"
              stroke={ORANGE}
              strokeWidth={2.5}
              fill="url(#marketCapGrad)"
              dot={false}
              style={{ filter: `drop-shadow(0 0 6px ${ORANGE})` }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
