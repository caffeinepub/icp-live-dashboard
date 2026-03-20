# ICP Live Dashboard

## Current State
All price and market data (ICP price, BTC price, market cap, dominance, tokenomics) are fetched directly from the frontend browser via CoinGecko and IC API. When CoinGecko rate-limits or blocks browser requests (CORS/rate limits), the app falls back to stale hardcoded values (BTC $85,000, ICP $12.50), showing incorrect prices.

## Requested Changes (Diff)

### Add
- Backend Motoko actor methods that use http-outcalls to fetch:
  - ICP price, market cap, 24h volume, 24h change, circulating supply, total supply from CoinGecko
  - BTC price from CoinGecko
  - ICP market dominance from CoinGecko global endpoint
  - Total ICP burned from IC API
- Backend caches results for 60 seconds to avoid redundant outcalls
- Frontend hooks `useMarketData` and `useTokenomics` call backend actor methods instead of direct browser fetches

### Modify
- `useMarketData.ts`: replace direct CoinGecko browser fetches with backend actor calls
- `useTokenomics.ts`: replace direct CoinGecko + IC API browser fetches with backend actor calls
- `backend.d.ts`: expose new backend methods

### Remove
- Direct browser-side CoinGecko and IC API fetch calls in market data and tokenomics hooks
- Stale hardcoded fallback values (BTC $85k, ICP $12.50)

## Implementation Plan
1. Select `http-outcalls` Caffeine component
2. Generate Motoko backend with `getMarketData()` and `getTokenomics()` query/update methods that perform HTTP outcalls to CoinGecko and IC API
3. Update `useMarketData.ts` and `useTokenomics.ts` to call backend actor instead of fetching directly
4. Update fallback values to null/loading states rather than stale hardcoded numbers
