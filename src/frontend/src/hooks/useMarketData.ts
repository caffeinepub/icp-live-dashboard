import { useQuery } from "@tanstack/react-query";
import { useActor } from "./useActor";

export interface MarketData {
  price: number;
  marketCap: number;
  volume24h: number;
  change24h: number;
  circulatingSupply: number;
  totalSupply: number;
  lastUpdated: number;
  btcPrice: number;
  icpDominance: number;
}

interface BackendMarketData {
  price: number;
  marketCap: number;
  volume24h: number;
  change24h: number;
  circulatingSupply: number;
  totalSupply: number;
  btcPrice: number;
  icpDominance: number;
  lastUpdated: bigint;
}

interface MarketDataActor {
  getMarketData: () => Promise<BackendMarketData>;
}

export function useMarketData(refreshIntervalSecs = 60) {
  const { actor, isFetching } = useActor();

  return useQuery<MarketData>({
    queryKey: ["marketData", refreshIntervalSecs],
    queryFn: async () => {
      if (!actor) {
        return {
          price: 0,
          marketCap: 0,
          volume24h: 0,
          change24h: 0,
          circulatingSupply: 0,
          totalSupply: 0,
          lastUpdated: Date.now(),
          btcPrice: 0,
          icpDominance: 0,
        };
      }
      const typedActor = actor as unknown as MarketDataActor;
      const data = await typedActor.getMarketData();
      return {
        price: data.price,
        marketCap: data.marketCap,
        volume24h: data.volume24h,
        change24h: data.change24h,
        circulatingSupply: data.circulatingSupply,
        totalSupply: data.totalSupply,
        lastUpdated: Number(data.lastUpdated),
        btcPrice: data.btcPrice,
        icpDominance: data.icpDominance,
      };
    },
    enabled: !!actor && !isFetching,
    refetchInterval: refreshIntervalSecs * 1000,
    staleTime: (refreshIntervalSecs - 5) * 1000,
    retry: 1,
  });
}
