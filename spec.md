# ICP Live Dashboard

## Current State
New project. No existing application files.

## Requested Changes (Diff)

### Add
- Live ICP price with 24h % change (fetched from CoinGecko API)
- Market cap and circulating supply display
- Total ICP burned / supply burn tracker
- Network status indicator (live/degraded/down)
- Whale alert feed (large transfers > threshold)
- Liquidity moves panel
- ICP node count and canister count from IC dashboard API
- Transaction volume (24h)
- Auto-refresh every 60 seconds
- Manual refresh button

### Modify
- N/A (new project)

### Remove
- N/A (new project)

## Implementation Plan
1. Backend: HTTP outcalls to CoinGecko (ICP market data), IC dashboard API (network stats, nodes, canisters, burned supply), and a simulated whale alert feed
2. Backend exposes: getMarketData(), getNetworkStats(), getWhaleAlerts()
3. Frontend: dark-themed dashboard with stat cards, price chart, whale feed, auto-refresh logic
