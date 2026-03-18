import { useQuery } from "@tanstack/react-query";

export interface MarketData {
  price: number;
  marketCap: number;
  volume24h: number;
  change24h: number;
  circulatingSupply: number;
  totalSupply: number;
  lastUpdated: number;
}

const FALLBACK: MarketData = {
  price: 12.5,
  marketCap: 5_850_000_000,
  volume24h: 42_000_000,
  change24h: 2.34,
  circulatingSupply: 468_000_000,
  totalSupply: 500_000_000,
  lastUpdated: Date.now(),
};

async function fetchMarketData(): Promise<MarketData> {
  try {
    const [priceRes, coinRes] = await Promise.all([
      fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=internet-computer&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true&include_last_updated_at=true",
      ),
      fetch(
        "https://api.coingecko.com/api/v3/coins/internet-computer?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false",
      ),
    ]);

    if (!priceRes.ok || !coinRes.ok) throw new Error("API error");

    const [priceData, coinData] = await Promise.all([
      priceRes.json(),
      coinRes.json(),
    ]);

    const icp = priceData["internet-computer"];
    const md = coinData.market_data;

    return {
      price: icp.usd ?? FALLBACK.price,
      marketCap: icp.usd_market_cap ?? FALLBACK.marketCap,
      volume24h: icp.usd_24h_vol ?? FALLBACK.volume24h,
      change24h: icp.usd_24h_change ?? FALLBACK.change24h,
      circulatingSupply: md?.circulating_supply ?? FALLBACK.circulatingSupply,
      totalSupply: md?.total_supply ?? FALLBACK.totalSupply,
      lastUpdated: (icp.last_updated_at ?? Date.now() / 1000) * 1000,
    };
  } catch {
    return FALLBACK;
  }
}

export function useMarketData() {
  return useQuery<MarketData>({
    queryKey: ["marketData"],
    queryFn: fetchMarketData,
    refetchInterval: 60_000,
    staleTime: 55_000,
    retry: 1,
  });
}
