import { ScrollArea } from "@/components/ui/scroll-area";
import { useSettings } from "@/context/SettingsContext";
import { Waves } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

interface WhaleAlert {
  id: string;
  amount: number;
  from: string;
  to: string;
  type: "transfer" | "burn" | "stake" | "unstake";
  timeAgo: string;
  usdValue: number;
}

const ADDRESSES = [
  "abc12...xyz34",
  "def56...uvw78",
  "gh901...stu23",
  "ijk45...pqr67",
  "lmn89...mno12",
  "opq34...jkl56",
  "rst78...ghi90",
  "uvw12...def34",
  "Exchange (Binance)",
  "Exchange (Coinbase)",
  "NNS Governance",
  "Unknown Wallet",
];

const TYPE_LABELS = {
  transfer: { label: "Transfer", color: "text-cyan" },
  burn: { label: "\uD83D\uDD25 Burn", color: "text-orange" },
  stake: { label: "\uD83D\uDD12 Staked", color: "text-green" },
  unstake: { label: "\uD83D\uDD13 Unstaked", color: "text-red-custom" },
};

function generateAlert(
  price: number,
  minIcp: number,
  enabledTypes: WhaleAlert["type"][],
): WhaleAlert {
  const amount = Math.floor(Math.random() * (500_000 - minIcp) + minIcp);
  const available =
    enabledTypes.length > 0
      ? enabledTypes
      : (["transfer"] as WhaleAlert["type"][]);
  const type = available[Math.floor(Math.random() * available.length)];
  const from = ADDRESSES[Math.floor(Math.random() * ADDRESSES.length)];
  let to = ADDRESSES[Math.floor(Math.random() * ADDRESSES.length)];
  while (to === from)
    to = ADDRESSES[Math.floor(Math.random() * ADDRESSES.length)];
  const mins = Math.floor(Math.random() * 10 + 1);
  return {
    id: `${Date.now()}-${Math.random()}`,
    amount,
    from,
    to,
    type,
    timeAgo: mins === 1 ? "1 min ago" : `${mins} min ago`,
    usdValue: amount * price,
  };
}

function buildInitialAlerts(
  price: number,
  minIcp: number,
  enabledTypes: WhaleAlert["type"][],
): WhaleAlert[] {
  return Array.from({ length: 8 }, (_, i) => ({
    ...generateAlert(price, minIcp, enabledTypes),
    timeAgo: `${(i + 1) * 3} min ago`,
    id: `init-${i}`,
  }));
}

interface Props {
  icpPrice: number;
}

export function WhaleAlerts({ icpPrice }: Props) {
  const { settings } = useSettings();
  const { whaleMinIcp, whaleIntervalSecs, enabledAlertTypes, maxAlertsShown } =
    settings;

  const [alerts, setAlerts] = useState<WhaleAlert[]>(() =>
    buildInitialAlerts(icpPrice, whaleMinIcp, enabledAlertTypes),
  );

  // Track previous filter key to reset alerts on filter change
  const filterKey = `${whaleMinIcp}-${enabledAlertTypes.slice().sort().join(",")}`;
  const prevFilterKeyRef = useRef(filterKey);
  if (prevFilterKeyRef.current !== filterKey) {
    prevFilterKeyRef.current = filterKey;
    setAlerts(buildInitialAlerts(icpPrice, whaleMinIcp, enabledAlertTypes));
  }

  useEffect(() => {
    const interval = setInterval(() => {
      const newAlert = generateAlert(icpPrice, whaleMinIcp, enabledAlertTypes);
      setAlerts((prev) => [newAlert, ...prev.slice(0, maxAlertsShown - 1)]);
    }, whaleIntervalSecs * 1000);
    return () => clearInterval(interval);
  }, [
    icpPrice,
    whaleMinIcp,
    whaleIntervalSecs,
    enabledAlertTypes,
    maxAlertsShown,
  ]);

  return (
    <div
      className="card-glass rounded-lg p-5 shadow-card flex flex-col gap-3 h-full"
      data-ocid="whale_alerts.card"
    >
      <div className="flex items-center gap-2">
        <Waves className="h-4 w-4 text-cyan" />
        <span className="text-sm font-semibold text-foreground">
          Whale Alerts
        </span>
        <span className="text-xs text-muted-foreground ml-1">
          &ge; {whaleMinIcp.toLocaleString()} ICP
        </span>
        <span className="ml-auto flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse-cyan" />
          <span className="text-xs text-muted-foreground">Live</span>
        </span>
      </div>

      <ScrollArea className="flex-1 h-[420px]">
        <div className="flex flex-col gap-1 pr-3">
          <AnimatePresence initial={false}>
            {alerts.map((alert, i) => {
              const typeInfo = TYPE_LABELS[alert.type];
              return (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, y: -16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }}
                  data-ocid={`whale_alerts.item.${i + 1}`}
                  className="flex flex-col gap-0.5 py-2.5 border-b border-border/30 last:border-0"
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-semibold ${typeInfo.color}`}>
                      {typeInfo.label}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {alert.timeAgo}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm font-bold text-foreground">
                      {alert.amount.toLocaleString()} ICP
                    </span>
                    <span className="text-xs text-muted-foreground">
                      &asymp; ${(alert.usdValue / 1_000_000).toFixed(2)}M
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {alert.from} &rarr; {alert.to}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </ScrollArea>
    </div>
  );
}
