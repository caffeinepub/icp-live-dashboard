import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;

export interface MarketData {
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

export interface TokenomicsData {
    totalBurned: number;
    circulatingSupply: number;
    totalSupply: number;
    lastUpdated: bigint;
}

export interface backendInterface {
    getMarketData: () => Promise<MarketData>;
    getTokenomicsData: () => Promise<TokenomicsData>;
}
