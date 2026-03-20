import Text "mo:core/Text";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Float "mo:core/Float";
import Nat "mo:core/Nat";
import Outcall "http-outcalls/outcall";

actor {
  // ── Domain types ─────────────────────────────────────────────────────────────
  public type MarketData = {
    price : Float;
    marketCap : Float;
    volume24h : Float;
    change24h : Float;
    circulatingSupply : Float;
    totalSupply : Float;
    btcPrice : Float;
    icpDominance : Float;
    lastUpdated : Int;
  };

  public type TokenomicsData = {
    totalBurned : Float;
    circulatingSupply : Float;
    totalSupply : Float;
    lastUpdated : Int;
  };

  // ── State ──────────────────────────────────────────────────────────────────
  stable var cachedMarket : ?MarketData = null;
  stable var cachedTokenomics : ?TokenomicsData = null;
  let CACHE_TTL_NS : Int = 60 * 1_000_000_000;

  // ── Transform callback (required by http-outcalls module) ──────────────────
  public query func transform(input : Outcall.TransformationInput) : async Outcall.TransformationOutput {
    Outcall.transform(input);
  };

  // ── HTTP helper ────────────────────────────────────────────────────────────
  func httpGet(url : Text) : async Text {
    await Outcall.httpGetRequest(url, [], transform);
  };

  // ── JSON number parser ────────────────────────────────────────────────────────

  // Parse a number from the beginning of a string (skipping leading whitespace).
  func parseNum(text : Text) : ?Float {
    var intPart : Nat = 0;
    var fracPart : Float = 0.0;
    var fracDiv : Float = 1.0;
    var negative = false;
    var seenDot = false;
    var started = false;

    label scan for (c in text.chars()) {
      if (c == ' ' or c == '\t' or c == '\n' or c == '\r') {
        if (started) break scan;
      } else if (c == '-') {
        if (not started) { negative := true }
        else break scan;
      } else if (c == '.') {
        if (started and not seenDot) { seenDot := true }
        else break scan;
      } else if (c >= '0' and c <= '9') {
        started := true;
        let d = (c.toNat32() -% 48).toNat();
        if (seenDot) {
          fracDiv *= 10.0;
          fracPart += d.toFloat() / fracDiv;
        } else {
          intPart := intPart * 10 + d;
        };
      } else {
        if (started) break scan;
      };
    };

    if (started) {
      var v = intPart.toFloat() + fracPart;
      if (negative) { v := -v };
      ?v
    } else null
  };

  // Return the text starting immediately after the first occurrence of `needle`.
  func afterFirst(text : Text, needle : Text) : ?Text {
    var parts = text.split(#text needle);
    ignore parts.next();
    parts.next()
  };

  // Find numeric value of a JSON key, e.g. `"key":123.4`
  func parseFloat(json : Text, key : Text) : ?Float {
    switch (afterFirst(json, "\"" # key # "\":")) {
      case (?after) parseNum(after);
      case null null;
    };
  };

  // ── Fetch market data ──────────────────────────────────────────────────────
  func fetchMarket() : async MarketData {
    let priceJson = await httpGet(
      "https://api.coingecko.com/api/v3/simple/price?ids=internet-computer%2Cbitcoin&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true"
    );
    let globalJson = await httpGet("https://api.coingecko.com/api/v3/global");
    let coinJson   = await httpGet(
      "https://api.coingecko.com/api/v3/coins/internet-computer?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false"
    );

    let icpPrice  = switch (parseFloat(priceJson, "usd"))            { case (?v) v; case null 0.0 };
    let icpMcap   = switch (parseFloat(priceJson, "usd_market_cap")) { case (?v) v; case null 0.0 };
    let icpVol    = switch (parseFloat(priceJson, "usd_24h_vol"))    { case (?v) v; case null 0.0 };
    let icpChange = switch (parseFloat(priceJson, "usd_24h_change")) { case (?v) v; case null 0.0 };

    // BTC price: locate the bitcoin block then parse its usd field
    let btcActual : Float = switch (afterFirst(priceJson, "\"bitcoin\"")) {
      case (?btcSlice) switch (parseFloat(btcSlice, "usd")) { case (?v) v; case null 0.0 };
      case null 0.0;
    };

    let circSupply  = switch (parseFloat(coinJson, "circulating_supply")) { case (?v) v; case null 0.0 };
    let totalSupply = switch (parseFloat(coinJson, "total_supply"))        { case (?v) v; case null 0.0 };
    let icpDom      = switch (parseFloat(globalJson, "internet-computer")) { case (?v) v; case null 0.0 };

    {
      price             = icpPrice;
      marketCap         = icpMcap;
      volume24h         = icpVol;
      change24h         = icpChange;
      circulatingSupply = circSupply;
      totalSupply       = totalSupply;
      btcPrice          = btcActual;
      icpDominance      = icpDom;
      lastUpdated       = Time.now();
    }
  };

  // ── Fetch tokenomics ───────────────────────────────────────────────────────
  func fetchTokenomicsData() : async TokenomicsData {
    let burnJson = await httpGet(
      "https://ic-api.internetcomputer.org/api/v3/metrics/ic-total-icp-burned"
    );
    let coinJson = await httpGet(
      "https://api.coingecko.com/api/v3/coins/internet-computer?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false"
    );

    let burnedE8s = switch (parseFloat(burnJson, "value")) { case (?v) v; case null 0.0 };
    let burned    = burnedE8s / 1e8;

    let circSupply  = switch (parseFloat(coinJson, "circulating_supply")) { case (?v) v; case null 0.0 };
    let totalSupply = switch (parseFloat(coinJson, "total_supply"))        { case (?v) v; case null 0.0 };

    {
      totalBurned       = burned;
      circulatingSupply = circSupply;
      totalSupply       = totalSupply;
      lastUpdated       = Time.now();
    }
  };

  // ── Public API ─────────────────────────────────────────────────────────────
  public func getMarketData() : async MarketData {
    let now = Time.now();
    switch (cachedMarket) {
      case (?cached) {
        if (now - cached.lastUpdated < CACHE_TTL_NS) return cached;
      };
      case null {};
    };
    let fresh = await fetchMarket();
    cachedMarket := ?fresh;
    fresh
  };

  public func getTokenomicsData() : async TokenomicsData {
    let now = Time.now();
    switch (cachedTokenomics) {
      case (?cached) {
        if (now - cached.lastUpdated < CACHE_TTL_NS) return cached;
      };
      case null {};
    };
    let fresh = await fetchTokenomicsData();
    cachedTokenomics := ?fresh;
    fresh
  };
};
