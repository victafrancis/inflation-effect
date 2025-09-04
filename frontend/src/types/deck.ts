// --- Core pieces used by the UI/formatting utilities ---
export type Snapshot = {
  date: string; // ISO YYYY-MM-DD (use end-of-month)
  fiat: { value: number };
  btc:  { btc: number; sats: number };
  btc_usd_used: number;
  small_item_metrics?: { unitsPer100: number; applicability: string };
};

export type FiveYearChange = { abs_pct: number; cagr_pct?: number };

export type FiveYearChanges = {
  fiat: {
    y10_to_y5: FiveYearChange;
    y5_to_y0:  FiveYearChange;
    y10_to_y0: FiveYearChange;
  };
  btc_amount: {
    y10_to_y5: FiveYearChange;
    y5_to_y0:  FiveYearChange;
    y10_to_y0: FiveYearChange;
  };
};

// Minimal shape utilities/rendering depend on:
export type DeckCore = {
  item: {
    id: number;
    name: string;
    unit: string;
    category: string;
    source_method?: string;
    image_url?: string;
  };
  snapshots: { y10: Snapshot; y5: Snapshot; y0: Snapshot };
  projections: {
    y5:  { fiat: number; btc: number; sats: number };
    y10: { fiat: number; btc: number; sats: number };
  };
  five_year_changes: FiveYearChanges;
};

// --- Extra API fields (complete server response) ---
export type Params = {
  itemId: number;
  anchor_year: number;
  anchor_month: number;
  snap_offsets_years: number[];
};

export type Anchor = {
  requested: { year: number; month: number };
  used: { year: number; month: number; reason: string };
  fiat_currency: string;
  btc_quote_currency: string;
  fx: { usd_per_fiat_at_anchor: number | null };
  btc_price_at_anchor_quote: number;
};

export type Debug = {
  series_used?: { fiat_years: number[]; btc_months: string[] };
  rates?: Record<string, number>;
};

// Full server response (version your contract)
export type FullDeckV1 = DeckCore & {
  params: Params;
  anchor: Anchor;
  display?: { precision: { fiat: number; btc: number; sats: number } };
  debug?: Debug;
};
