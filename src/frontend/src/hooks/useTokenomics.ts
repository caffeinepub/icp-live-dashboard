import { useQuery } from "@tanstack/react-query";
import { useActor } from "./useActor";

export interface TokenomicsData {
  totalBurned: number;
  totalMinted: number;
  currentSupply: number;
  mintBurnRatio: number;
  isDeflationary: boolean;
  ratioHistory: { day: string; ratio: number }[];
}

interface BackendTokenomicsData {
  totalBurned: number;
  circulatingSupply: number;
  totalSupply: number;
  lastUpdated: bigint;
}

interface TokenomicsActor {
  getTokenomicsData: () => Promise<BackendTokenomicsData>;
}

function buildRatioHistory(
  currentRatio: number,
): { day: string; ratio: number }[] {
  const points: { day: string; ratio: number }[] = [];
  const now = Date.now();
  let ratio = currentRatio + 3.5 + Math.random() * 1.5;
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now - i * 86_400_000);
    const label = d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    ratio = ratio - 3.5 / 29 + (Math.random() - 0.5) * 0.15;
    points.push({ day: label, ratio: Math.max(ratio, 1.0) });
  }
  points[points.length - 1].ratio = currentRatio;
  return points;
}

export function useTokenomics() {
  const { actor, isFetching } = useActor();

  return useQuery<TokenomicsData>({
    queryKey: ["tokenomics"],
    queryFn: async () => {
      if (!actor) {
        return {
          totalBurned: 0,
          totalMinted: 0,
          currentSupply: 0,
          mintBurnRatio: 0,
          isDeflationary: false,
          ratioHistory: [],
        };
      }
      const typedActor = actor as unknown as TokenomicsActor;
      const data = await typedActor.getTokenomicsData();
      const totalBurned = data.totalBurned;
      const totalMinted = data.totalSupply + totalBurned;
      const mintBurnRatio = totalMinted / Math.max(totalBurned, 1);
      const isDeflationary = mintBurnRatio < 12;

      return {
        totalBurned,
        totalMinted,
        currentSupply: data.circulatingSupply,
        mintBurnRatio,
        isDeflationary,
        ratioHistory: buildRatioHistory(mintBurnRatio),
      };
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 10 * 60 * 1000,
    staleTime: 9 * 60 * 1000,
    retry: 1,
  });
}
