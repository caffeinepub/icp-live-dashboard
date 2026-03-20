import { type ReactNode, createContext, useContext, useState } from "react";

export type AlertType = "transfer" | "burn" | "stake" | "unstake";
export type RefreshInterval = 15 | 30 | 60 | 120 | 300;

export interface DashboardSettings {
  // Whale alerts
  whaleMinIcp: number;
  whaleIntervalSecs: number;
  enabledAlertTypes: AlertType[];
  maxAlertsShown: number;
  // Market data
  refreshIntervalSecs: RefreshInterval;
  // Display
  showSparklines: boolean;
  showSupplyProgress: boolean;
  compactMode: boolean;
  // Supply
  supplyBurned: number;
}

const DEFAULT: DashboardSettings = {
  whaleMinIcp: 50_000,
  whaleIntervalSecs: 15,
  enabledAlertTypes: ["transfer", "burn", "stake", "unstake"],
  maxAlertsShown: 20,
  refreshIntervalSecs: 60,
  showSparklines: true,
  showSupplyProgress: true,
  compactMode: false,
  supplyBurned: 35_420_000,
};

interface SettingsContextValue {
  settings: DashboardSettings;
  updateSettings: (patch: Partial<DashboardSettings>) => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<DashboardSettings>(DEFAULT);

  const updateSettings = (patch: Partial<DashboardSettings>) =>
    setSettings((prev) => ({ ...prev, ...patch }));

  const resetSettings = () => setSettings(DEFAULT);

  return (
    <SettingsContext.Provider
      value={{ settings, updateSettings, resetSettings }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used inside SettingsProvider");
  return ctx;
}
