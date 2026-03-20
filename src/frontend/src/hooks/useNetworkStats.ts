import { useQuery } from "@tanstack/react-query";

export interface NetworkStats {
  totalSubnets: number;
  totalNodes: number;
  blockRatePerSec: number;
}

const FALLBACK: NetworkStats = {
  totalSubnets: 41,
  totalNodes: 1312,
  blockRatePerSec: 0.67,
};

async function fetchNetworkStats(): Promise<NetworkStats> {
  try {
    const res = await fetch(
      "https://ic-api.internetcomputer.org/api/v3/metrics",
    );
    if (!res.ok) throw new Error("API error");
    const data = await res.json();

    // The IC metrics API returns an array of { name, subsets } objects
    const find = (name: string): number | undefined => {
      const metric = (
        data as { name: string; subsets: { value: [number, string] }[] }[]
      ).find((m) => m.name === name);
      if (!metric) return undefined;
      const val = metric.subsets?.[0]?.value?.[1];
      return val !== undefined ? Number.parseFloat(val) : undefined;
    };

    const subnets = find("ic_subnet_total") ?? FALLBACK.totalSubnets;
    const nodes =
      find("ic_node_count") ?? find("ic_nodes_total") ?? FALLBACK.totalNodes;
    const blockRate = find("ic_block_height_rate") ?? FALLBACK.blockRatePerSec;

    return {
      totalSubnets: Math.round(subnets),
      totalNodes: Math.round(nodes),
      blockRatePerSec: blockRate,
    };
  } catch {
    return FALLBACK;
  }
}

export function useNetworkStats() {
  return useQuery<NetworkStats>({
    queryKey: ["networkStats"],
    queryFn: fetchNetworkStats,
    refetchInterval: 5 * 60 * 1000, // every 5 minutes
    staleTime: 4 * 60 * 1000,
    retry: 1,
  });
}
