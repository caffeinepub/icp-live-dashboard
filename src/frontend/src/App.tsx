import {
  CanisterGrowthChart,
  IcpPriceMarketCapChart,
  MarketCapChart,
  NodeProviderChart,
  VolumeChart,
} from "@/components/dashboard/Charts";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { LiquidityTable } from "@/components/dashboard/LiquidityTable";
import { MintBurnRatio } from "@/components/dashboard/MintBurnRatio";
import { SettingsPanel } from "@/components/dashboard/SettingsPanel";
import { TokenomicsCards } from "@/components/dashboard/TokenomicsCards";
import { WhaleAlerts } from "@/components/dashboard/WhaleAlerts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { SettingsProvider, useSettings } from "@/context/SettingsContext";
import { useMarketData } from "@/hooks/useMarketData";
import { useNetworkStats } from "@/hooks/useNetworkStats";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Activity,
  BarChart2,
  Bell,
  CheckCircle2,
  CircleDollarSign,
  Cpu,
  Globe,
  Network,
  RefreshCw,
  Settings2,
  TrendingUp,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

const queryClient = new QueryClient();

const TOTAL_CANISTERS_START = 620_000;

interface SparklinePoint {
  value: number;
}

function buildSparkline(currentPrice: number, length = 14): SparklinePoint[] {
  const data: SparklinePoint[] = [];
  let val = currentPrice * 0.85;
  for (let i = 0; i < length; i++) {
    val = val + (Math.random() - 0.45) * currentPrice * 0.04;
    data.push({ value: Math.max(val, currentPrice * 0.6) });
  }
  data.push({ value: currentPrice });
  return data;
}

type Tab = "dashboard" | "market" | "network" | "alerts" | "settings";

const NAV_TABS: { id: Tab; label: string; icon: typeof Activity }[] = [
  { id: "dashboard", label: "Dashboard", icon: Activity },
  { id: "market", label: "Market", icon: TrendingUp },
  { id: "network", label: "Network", icon: Network },
  { id: "alerts", label: "Alerts", icon: Bell },
  { id: "settings", label: "Settings", icon: Settings2 },
];

function Header({
  activeTab,
  onTabChange,
  onRefresh,
  isRefreshing,
  lastUpdated,
}: {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  lastUpdated: Date | null;
}) {
  return (
    <header
      className="sticky top-0 z-50 w-full border-b border-border/40"
      style={{
        background:
          "linear-gradient(180deg, oklch(0.13 0.020 245) 0%, oklch(0.12 0.018 242) 100%)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-6 h-14">
          <div
            className="flex items-center gap-2.5 shrink-0"
            data-ocid="header.section"
          >
            <div className="relative">
              <div className="w-7 h-7 rounded-md bg-cyan-subtle border border-cyan flex items-center justify-center">
                <Activity className="h-4 w-4 text-cyan" />
              </div>
              <div
                className="absolute -inset-0.5 rounded-md opacity-40"
                style={{
                  background:
                    "radial-gradient(circle, oklch(0.78 0.12 195 / 0.5), transparent)",
                }}
              />
            </div>
            <span className="font-bold text-sm tracking-widest uppercase text-cyan hidden sm:block">
              ICP Live Analytics
            </span>
          </div>

          <nav
            className="flex items-center gap-1 flex-1"
            aria-label="Main navigation"
          >
            {NAV_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  type="button"
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  data-ocid={`nav.${tab.id}.tab`}
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    isActive
                      ? "text-cyan bg-cyan-subtle"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full"
                      style={{ background: "oklch(0.78 0.12 195)" }}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            {lastUpdated && (
              <span className="text-xs text-muted-foreground hidden md:block">
                {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="h-7 w-7 text-muted-foreground hover:text-cyan hover:bg-cyan-subtle"
              data-ocid="header.refresh.button"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`}
              />
            </Button>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-subtle border border-green-500/30">
              <CheckCircle2 className="h-3 w-3 text-green" />
              <span className="text-xs text-green font-medium">Connected</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function DashboardTab({
  market,
  isLoading,
  icpPrice,
}: {
  market: ReturnType<typeof useMarketData>["data"];
  isLoading: boolean;
  icpPrice: number;
}) {
  const { settings } = useSettings();
  const { data: network } = useNetworkStats();
  const supplyPct = market
    ? (market.circulatingSupply / market.totalSupply) * 100
    : 93.6;

  const [canisters, setCanisters] = useState(TOTAL_CANISTERS_START);
  useEffect(() => {
    const interval = setInterval(() => {
      setCanisters((prev) => prev + Math.floor(Math.random() * 3 + 1));
    }, 8_000);
    return () => clearInterval(interval);
  }, []);

  const mcValue = market
    ? `$${(market.marketCap / 1_000_000_000).toFixed(2)}B`
    : "$5.85B";

  const totalSubnets = network?.totalSubnets ?? 41;
  const totalNodes = network?.totalNodes ?? 1312;
  const btcPrice = market?.btcPrice ?? 85_000;
  const icpDominance = market?.icpDominance ?? 0.15;
  const circSupply = market
    ? `${(market.circulatingSupply / 1_000_000).toFixed(1)}M`
    : "468.0M";
  const change24h = market?.change24h ?? 0;

  return (
    <div
      className={`flex flex-col gap-3 ${settings.compactMode ? "text-xs" : ""}`}
    >
      {/* Compact 4-column stat row */}
      <div
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
        data-ocid="dashboard.section"
      >
        {/* ICP Price */}
        <div
          className="card-glass rounded-lg px-3 py-2 shadow-card flex flex-col gap-0.5"
          data-ocid="icp_price.card"
        >
          <div className="flex items-center gap-1.5">
            <CircleDollarSign className="h-3.5 w-3.5 text-cyan" />
            <span className="text-xs text-muted-foreground">ICP Price</span>
          </div>
          <div className="text-lg font-bold text-foreground">
            {isLoading ? (
              <span className="text-muted-foreground">—</span>
            ) : (
              `$${icpPrice.toFixed(2)}`
            )}
          </div>
          {change24h !== 0 && (
            <span
              className={`text-xs font-semibold ${
                change24h >= 0 ? "text-green" : "text-red-custom"
              }`}
            >
              {change24h >= 0 ? "+" : ""}
              {change24h.toFixed(2)}%
            </span>
          )}
        </div>

        {/* Market Cap */}
        <div
          className="card-glass rounded-lg px-3 py-2 shadow-card flex flex-col gap-0.5"
          data-ocid="market_cap.card"
        >
          <div className="flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-cyan" />
            <span className="text-xs text-muted-foreground">Market Cap</span>
          </div>
          <div className="text-lg font-bold text-foreground">
            {isLoading ? (
              <span className="text-muted-foreground">—</span>
            ) : (
              mcValue
            )}
          </div>
          {change24h !== 0 && (
            <span
              className={`text-xs font-semibold ${
                change24h >= 0 ? "text-green" : "text-red-custom"
              }`}
            >
              {change24h >= 0 ? "+" : ""}
              {change24h.toFixed(2)}%
            </span>
          )}
        </div>

        {/* ICP Dominance */}
        <div
          className="card-glass rounded-lg px-3 py-2 shadow-card flex flex-col gap-0.5"
          data-ocid="icp_dominance.card"
        >
          <div className="flex items-center gap-1.5">
            <Globe className="h-3.5 w-3.5 text-cyan" />
            <span className="text-xs text-muted-foreground">ICP Dominance</span>
          </div>
          <div className="text-lg font-bold text-foreground">
            {isLoading ? (
              <span className="text-muted-foreground">—</span>
            ) : (
              `${icpDominance.toFixed(2)}%`
            )}
          </div>
          <span className="text-xs text-muted-foreground">
            of total mkt cap
          </span>
        </div>

        {/* Circulating Supply */}
        <div
          className="card-glass rounded-lg px-3 py-2 shadow-card flex flex-col gap-0.5"
          data-ocid="circulating_supply.card"
        >
          <div className="flex items-center gap-1.5">
            <Globe className="h-3.5 w-3.5 text-green" />
            <span className="text-xs text-muted-foreground">Circulating</span>
          </div>
          <div className="text-lg font-bold text-foreground">
            {isLoading ? (
              <span className="text-muted-foreground">—</span>
            ) : (
              `${circSupply} ICP`
            )}
          </div>
          {settings.showSupplyProgress && (
            <div className="flex flex-col gap-0.5 mt-0.5">
              <Progress value={supplyPct} className="h-1" />
              <span className="text-xs text-muted-foreground">
                {supplyPct.toFixed(1)}% of total
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Full-width price + market cap chart */}
      <IcpPriceMarketCapChart
        icpPrice={icpPrice}
        marketCap={market?.marketCap ?? 5_850_000_000}
      />

      <TokenomicsCards icpPrice={icpPrice} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <WhaleAlerts icpPrice={icpPrice} />
        <div className="flex flex-col gap-3">
          <VolumeChart />
          <div
            className="card-glass rounded-lg p-3 shadow-card"
            data-ocid="network_status.card"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-foreground">
                Network Status
              </span>
              <Badge className="bg-green-subtle text-green border-green-500/30 text-xs">
                Operational
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Uptime</span>
                <span className="text-lg font-bold text-green">99.99%</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">
                  Block Time
                </span>
                <span className="text-lg font-bold text-foreground">~1.5s</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Subnets</span>
                <span className="text-lg font-bold text-cyan">
                  {totalSubnets}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Nodes</span>
                <span className="text-lg font-bold text-foreground">
                  {totalNodes.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div
          className="card-glass rounded-lg p-3 shadow-card flex flex-col gap-3"
          data-ocid="canisters.card"
        >
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-cyan" />
            <span className="text-sm font-semibold text-foreground">
              Canister Smart Contracts
            </span>
          </div>
          <div className="text-4xl font-bold text-foreground">
            {canisters.toLocaleString()}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-green">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            Growing
          </div>
          <div className="mt-auto">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Capacity utilization</span>
              <span>~62%</span>
            </div>
            <Progress value={62} className="h-1.5" />
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {[
              { label: "NNS Canisters", val: "57" },
              { label: "System Canisters", val: "1,204" },
              { label: "Active 24h", val: "~412k" },
              { label: "Subnets", val: totalSubnets.toString() },
            ].map((item) => (
              <div key={item.label} className="bg-accent/30 rounded p-2">
                <div className="text-xs text-muted-foreground">
                  {item.label}
                </div>
                <div className="text-sm font-bold text-foreground">
                  {item.val}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <NodeProviderChart />
        <CanisterGrowthChart />
      </div>

      <MintBurnRatio />

      <LiquidityTable icpPrice={icpPrice} btcPrice={btcPrice} />
    </div>
  );
}

function MarketTab({
  market,
  isLoading,
  icpPrice,
}: {
  market: ReturnType<typeof useMarketData>["data"];
  isLoading: boolean;
  icpPrice: number;
}) {
  const { settings } = useSettings();
  const priceSparkline = buildSparkline(icpPrice);
  const mcSparkline = buildSparkline(market?.marketCap ?? 5_850_000_000);
  const mcValue = market
    ? `$${(market.marketCap / 1_000_000_000).toFixed(2)}B`
    : "$5.85B";
  const volValue = market
    ? `$${(market.volume24h / 1_000_000).toFixed(1)}M`
    : "$42M";
  const btcPrice = market?.btcPrice ?? 85_000;

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          title="ICP Price"
          value={`$${icpPrice.toFixed(2)}`}
          change={market?.change24h}
          icon={<CircleDollarSign className="h-4 w-4" />}
          sparklineData={settings.showSparklines ? priceSparkline : undefined}
          accentColor="cyan"
          isLoading={isLoading}
        />
        <KpiCard
          title="Market Cap"
          value={mcValue}
          icon={<TrendingUp className="h-4 w-4" />}
          sparklineData={settings.showSparklines ? mcSparkline : undefined}
          accentColor="cyan"
          isLoading={isLoading}
        />
        <KpiCard
          title="24h Volume"
          value={volValue}
          icon={<BarChart2 className="h-4 w-4" />}
          accentColor="green"
          isLoading={isLoading}
        />
      </div>
      <TokenomicsCards icpPrice={icpPrice} />
      <MarketCapChart />
      <MintBurnRatio />
      <LiquidityTable icpPrice={icpPrice} btcPrice={btcPrice} />
    </div>
  );
}

function NetworkTab() {
  const { data: network } = useNetworkStats();
  const [canisters, setCanisters] = useState(TOTAL_CANISTERS_START);
  useEffect(() => {
    const interval = setInterval(() => {
      setCanisters((prev) => prev + Math.floor(Math.random() * 3 + 1));
    }, 8_000);
    return () => clearInterval(interval);
  }, []);

  const totalSubnets = network?.totalSubnets ?? 41;
  const totalNodes = network?.totalNodes ?? 1312;

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: "Active Subnets",
            value: totalSubnets.toString(),
            sub: "All operational",
            color: "text-cyan",
          },
          {
            title: "Total Nodes",
            value: totalNodes.toLocaleString(),
            sub: "Globally distributed",
            color: "text-foreground",
          },
          {
            title: "Network Uptime",
            value: "99.99%",
            sub: "Last 365 days",
            color: "text-green",
          },
          {
            title: "Block Time",
            value: network
              ? `${(1 / network.blockRatePerSec).toFixed(1)}s`
              : "~1.5s",
            sub: "Average finality",
            color: "text-cyan",
          },
        ].map((item) => (
          <div
            key={item.title}
            className="card-glass rounded-lg p-5 shadow-card"
          >
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
              {item.title}
            </div>
            <div className={`text-3xl font-bold ${item.color}`}>
              {item.value}
            </div>
            <div className="text-xs text-muted-foreground mt-1">{item.sub}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <NodeProviderChart />
        <CanisterGrowthChart />
      </div>
      <div className="card-glass rounded-lg p-5 shadow-card">
        <div className="text-sm font-semibold text-foreground mb-4">
          Smart Contract Stats
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Canisters", value: canisters.toLocaleString() },
            { label: "NNS Canisters", value: "57" },
            { label: "Active 24h", value: "~412k" },
            { label: "New Today", value: "+284" },
          ].map((item) => (
            <div key={item.label} className="bg-accent/30 rounded-lg p-3">
              <div className="text-xs text-muted-foreground">{item.label}</div>
              <div className="text-xl font-bold text-foreground mt-1">
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AlertsTab({ icpPrice }: { icpPrice: number }) {
  const { settings } = useSettings();
  return (
    <div className="flex flex-col gap-5">
      <WhaleAlerts icpPrice={icpPrice} />
      <div className="card-glass rounded-lg p-5 shadow-card">
        <div className="text-sm font-semibold text-foreground mb-1">
          Alert Thresholds
        </div>
        <div className="text-xs text-muted-foreground mb-4">
          Whale alerts trigger for transfers &ge;{" "}
          {settings.whaleMinIcp.toLocaleString()} ICP
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Min Whale Size",
              value: `${settings.whaleMinIcp.toLocaleString()} ICP`,
              color: "text-cyan",
            },
            {
              label: "Alert Interval",
              value: `${settings.whaleIntervalSecs}s`,
              color: "text-foreground",
            },
            {
              label: "Max Alerts",
              value: settings.maxAlertsShown.toString(),
              color: "text-foreground",
            },
            {
              label: "Active Types",
              value: settings.enabledAlertTypes.length.toString(),
              color: "text-green",
            },
          ].map((item) => (
            <div key={item.label} className="bg-accent/30 rounded-lg p-3">
              <div className="text-xs text-muted-foreground">{item.label}</div>
              <div className={`text-lg font-bold mt-1 ${item.color}`}>
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const { settings } = useSettings();
  const {
    data: market,
    isLoading,
    refetch,
    dataUpdatedAt,
  } = useMarketData(settings.refreshIntervalSecs);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const lastUpdated = dataUpdatedAt ? new Date(dataUpdatedAt) : null;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const icpPrice = market?.price ?? 0;

  return (
    <div className="min-h-screen">
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        lastUpdated={lastUpdated}
      />

      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6">
        {isLoading && (
          <div
            className="flex items-center gap-2 mb-4 text-xs text-muted-foreground"
            data-ocid="market_data.loading_state"
          >
            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            Fetching live market data...
          </div>
        )}

        <AnimatePresence mode="wait">
          {activeTab === "dashboard" && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <DashboardTab
                market={market}
                isLoading={isLoading}
                icpPrice={icpPrice}
              />
            </motion.div>
          )}
          {activeTab === "market" && (
            <motion.div
              key="market"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <MarketTab
                market={market}
                isLoading={isLoading}
                icpPrice={icpPrice}
              />
            </motion.div>
          )}
          {activeTab === "network" && (
            <motion.div
              key="network"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <NetworkTab />
            </motion.div>
          )}
          {activeTab === "alerts" && (
            <motion.div
              key="alerts"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <AlertsTab icpPrice={icpPrice} />
            </motion.div>
          )}
          {activeTab === "settings" && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <SettingsPanel />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="max-w-[1200px] mx-auto px-4 sm:px-6 py-4 border-t border-border/30 mt-8">
        <div className="flex flex-col sm:flex:row items-center justify-between gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>ICP Live Analytics Dashboard</span>
            <span className="hidden sm:inline">&middot;</span>
            <span className="hidden sm:inline">
              Refresh: {settings.refreshIntervalSecs}s
            </span>
          </div>
          <div>
            &copy; {new Date().getFullYear()}. Built with &hearts; using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan hover:underline"
            >
              caffeine.ai
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SettingsProvider>
        <Dashboard />
      </SettingsProvider>
    </QueryClientProvider>
  );
}
