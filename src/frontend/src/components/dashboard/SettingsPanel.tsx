import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  type AlertType,
  type RefreshInterval,
  useSettings,
} from "@/context/SettingsContext";
import { RotateCcw, Settings2 } from "lucide-react";
import { motion } from "motion/react";

const REFRESH_OPTIONS: { value: RefreshInterval; label: string }[] = [
  { value: 15, label: "15s" },
  { value: 30, label: "30s" },
  { value: 60, label: "60s" },
  { value: 120, label: "2m" },
  { value: 300, label: "5m" },
];

const ALERT_TYPE_OPTIONS: { value: AlertType; label: string; color: string }[] =
  [
    { value: "transfer", label: "Transfer", color: "text-cyan" },
    { value: "burn", label: "Burn", color: "text-orange" },
    { value: "stake", label: "Stake", color: "text-green" },
    { value: "unstake", label: "Unstake", color: "text-red-custom" },
  ];

function Section({
  title,
  children,
}: { title: string; children: React.ReactNode }) {
  return (
    <div className="card-glass rounded-lg p-5 shadow-card flex flex-col gap-4">
      <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        {title}
      </div>
      {children}
    </div>
  );
}

function Row({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex flex-col gap-0.5 flex-1">
        <span className="text-sm font-medium text-foreground">{label}</span>
        {description && (
          <span className="text-xs text-muted-foreground">{description}</span>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export function SettingsPanel() {
  const { settings, updateSettings, resetSettings } = useSettings();

  const toggleAlertType = (type: AlertType) => {
    const has = settings.enabledAlertTypes.includes(type);
    if (has && settings.enabledAlertTypes.length === 1) return; // keep at least one
    updateSettings({
      enabledAlertTypes: has
        ? settings.enabledAlertTypes.filter((t) => t !== type)
        : [...settings.enabledAlertTypes, type],
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col gap-5"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings2 className="h-4 w-4 text-cyan" />
          <span className="text-sm font-semibold text-foreground">
            Dashboard Settings
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={resetSettings}
          className="text-xs text-muted-foreground hover:text-foreground gap-1.5"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset to defaults
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Whale Alerts */}
        <Section title="Whale Alerts">
          <Row
            label="Minimum Whale Size"
            description={`Only show transfers ≥ ${settings.whaleMinIcp.toLocaleString()} ICP`}
          >
            <div className="flex flex-col items-end gap-1 w-48">
              <span className="text-xs font-mono text-cyan">
                {settings.whaleMinIcp.toLocaleString()} ICP
              </span>
              <Slider
                min={10000}
                max={500000}
                step={10000}
                value={[settings.whaleMinIcp]}
                onValueChange={([v]) => updateSettings({ whaleMinIcp: v })}
                className="w-full"
              />
              <div className="flex justify-between w-full text-xs text-muted-foreground">
                <span>10k</span>
                <span>500k</span>
              </div>
            </div>
          </Row>

          <Row
            label="Alert Interval"
            description="How often new simulated alerts are generated"
          >
            <div className="flex flex-col items-end gap-1 w-48">
              <span className="text-xs font-mono text-cyan">
                {settings.whaleIntervalSecs}s
              </span>
              <Slider
                min={5}
                max={60}
                step={5}
                value={[settings.whaleIntervalSecs]}
                onValueChange={([v]) =>
                  updateSettings({ whaleIntervalSecs: v })
                }
                className="w-full"
              />
              <div className="flex justify-between w-full text-xs text-muted-foreground">
                <span>5s</span>
                <span>60s</span>
              </div>
            </div>
          </Row>

          <Row
            label="Max Alerts Shown"
            description="Number of alerts retained in feed"
          >
            <div className="flex flex-col items-end gap-1 w-48">
              <span className="text-xs font-mono text-cyan">
                {settings.maxAlertsShown}
              </span>
              <Slider
                min={5}
                max={50}
                step={5}
                value={[settings.maxAlertsShown]}
                onValueChange={([v]) => updateSettings({ maxAlertsShown: v })}
                className="w-full"
              />
              <div className="flex justify-between w-full text-xs text-muted-foreground">
                <span>5</span>
                <span>50</span>
              </div>
            </div>
          </Row>

          <Row
            label="Enabled Alert Types"
            description="Filter which transaction types appear"
          >
            <div className="flex flex-wrap gap-2 justify-end max-w-[200px]">
              {ALERT_TYPE_OPTIONS.map((opt) => {
                const active = settings.enabledAlertTypes.includes(opt.value);
                return (
                  <Badge
                    key={opt.value}
                    onClick={() => toggleAlertType(opt.value)}
                    className={`cursor-pointer select-none text-xs transition-all ${
                      active
                        ? `bg-accent/60 ${opt.color} border-current/30`
                        : "bg-transparent text-muted-foreground border-border/30 opacity-50"
                    }`}
                  >
                    {opt.label}
                  </Badge>
                );
              })}
            </div>
          </Row>
        </Section>

        {/* Market Data */}
        <Section title="Market Data">
          <Row
            label="Refresh Interval"
            description="How often live market data is fetched"
          >
            <div className="flex flex-wrap gap-1.5 justify-end">
              {REFRESH_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() =>
                    updateSettings({ refreshIntervalSecs: opt.value })
                  }
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                    settings.refreshIntervalSecs === opt.value
                      ? "bg-cyan-subtle text-cyan border border-cyan/30"
                      : "bg-accent/30 text-muted-foreground hover:text-foreground hover:bg-accent/60"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </Row>

          <div className="border-t border-border/20 pt-4 flex flex-col gap-3">
            <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Network Constants
            </div>

            <Row
              label="Supply Burned (ICP)"
              description="Total ICP burned (editable reference)"
            >
              <div className="flex flex-col items-end gap-1 w-48">
                <span className="text-xs font-mono text-orange">
                  {(settings.supplyBurned / 1_000_000).toFixed(2)}M
                </span>
                <Slider
                  min={10_000_000}
                  max={100_000_000}
                  step={1_000_000}
                  value={[settings.supplyBurned]}
                  onValueChange={([v]) => updateSettings({ supplyBurned: v })}
                  className="w-full"
                />
                <div className="flex justify-between w-full text-xs text-muted-foreground">
                  <span>10M</span>
                  <span>100M</span>
                </div>
              </div>
            </Row>

            <Row
              label="Total Subnets"
              description="Number of active network subnets"
            >
              <div className="flex flex-col items-end gap-1 w-48">
                <span className="text-xs font-mono text-cyan">
                  {settings.totalSubnets}
                </span>
                <Slider
                  min={1}
                  max={100}
                  step={1}
                  value={[settings.totalSubnets]}
                  onValueChange={([v]) => updateSettings({ totalSubnets: v })}
                  className="w-full"
                />
                <div className="flex justify-between w-full text-xs text-muted-foreground">
                  <span>1</span>
                  <span>100</span>
                </div>
              </div>
            </Row>

            <Row
              label="Total Nodes"
              description="Number of active network nodes"
            >
              <div className="flex flex-col items-end gap-1 w-48">
                <span className="text-xs font-mono text-cyan">
                  {settings.totalNodes.toLocaleString()}
                </span>
                <Slider
                  min={100}
                  max={5000}
                  step={100}
                  value={[settings.totalNodes]}
                  onValueChange={([v]) => updateSettings({ totalNodes: v })}
                  className="w-full"
                />
                <div className="flex justify-between w-full text-xs text-muted-foreground">
                  <span>100</span>
                  <span>5k</span>
                </div>
              </div>
            </Row>
          </div>
        </Section>

        {/* Display */}
        <Section title="Display">
          <Row
            label="Show Sparklines"
            description="Mini price charts on KPI cards"
          >
            <Switch
              checked={settings.showSparklines}
              onCheckedChange={(v) => updateSettings({ showSparklines: v })}
            />
          </Row>
          <Row
            label="Show Supply Progress"
            description="Progress bar on circulating supply card"
          >
            <Switch
              checked={settings.showSupplyProgress}
              onCheckedChange={(v) => updateSettings({ showSupplyProgress: v })}
            />
          </Row>
          <Row label="Compact Mode" description="Reduce padding and font sizes">
            <Switch
              checked={settings.compactMode}
              onCheckedChange={(v) => updateSettings({ compactMode: v })}
            />
          </Row>
        </Section>

        {/* Live Preview */}
        <Section title="Live Preview">
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                label: "Whale Min",
                value: `${settings.whaleMinIcp.toLocaleString()} ICP`,
                color: "text-cyan",
              },
              {
                label: "Alert Every",
                value: `${settings.whaleIntervalSecs}s`,
                color: "text-cyan",
              },
              {
                label: "Market Refresh",
                value: `${settings.refreshIntervalSecs}s`,
                color: "text-green",
              },
              {
                label: "Supply Burned",
                value: `${(settings.supplyBurned / 1_000_000).toFixed(1)}M`,
                color: "text-orange",
              },
              {
                label: "Subnets",
                value: settings.totalSubnets.toString(),
                color: "text-cyan",
              },
              {
                label: "Nodes",
                value: settings.totalNodes.toLocaleString(),
                color: "text-foreground",
              },
            ].map((item) => (
              <div key={item.label} className="bg-accent/30 rounded-lg p-3">
                <div className="text-xs text-muted-foreground">
                  {item.label}
                </div>
                <div className={`text-lg font-bold mt-0.5 ${item.color}`}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Changes apply instantly to the live dashboard.
          </div>
        </Section>
      </div>
    </motion.div>
  );
}
