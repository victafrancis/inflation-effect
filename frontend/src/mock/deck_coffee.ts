import type { FullDeckV1 } from "../types/deck";

export const deckCoffee = {
  params: {
    itemId: 8,
    anchor_year: 2025,
    anchor_month: 7,
    snap_offsets_years: [-10, -5, 0, 5, 10],
  },

  item: {
    id: 8,
    name: "Coffee",
    unit: "per cup",
    category: "Drink",
    source_method:
      "The agent sourced annual prices from Numbeo’s Toronto “Cappuccino” data (2015–2024), used linear interpolation for intervening years, and estimated 2025 via a 3-5% increase.",
    image_url: "/items/coffee.png"
  },

  anchor: {
    requested: { year: 2025, month: 7 },
    used:      { year: 2025, month: 7, reason: "exact match" },
    fiat_currency: "CAD",
    btc_quote_currency: "USD",
    fx: { usd_per_fiat_at_anchor: null },
    btc_price_at_anchor_quote: 115758.20,
  },

  snapshots: {
    y10: {
      date: "2015-07-01",
      fiat: { value: 3.69 },
      btc:  { btc: 0.01279251, sats: 1279251 },
      btc_usd_used: 288.45,
      small_item_metrics: { unitsPer100: 27.10, applicability: "small_unit" }
    },
    y5: {
      date: "2020-07-01",
      fiat: { value: 4.68 },
      btc:  { btc: 0.00042382, sats: 42382 },
      btc_usd_used: 11042.40,
      small_item_metrics: { unitsPer100: 21.37, applicability: "small_unit" }
    },
    y0: {
      date: "2025-07-01",
      fiat: { value: 5.70 },
      btc:  { btc: 0.00004924, sats: 4924 },
      btc_usd_used: 115758.20,
      small_item_metrics: { unitsPer100: 17.54, applicability: "small_unit" }
    }
  },

  five_year_changes: {
    fiat: {
      y10_to_y5: { abs_pct: 26.83, cagr_pct: 4.87 },
      y5_to_y0:  { abs_pct: 21.79, cagr_pct: 4.02 },
      y10_to_y0: { abs_pct: 54.47, cagr_pct: 4.44 }
    },
    btc_amount: {
      y10_to_y5: { abs_pct: -96.69, cagr_pct: -49.41 },
      y5_to_y0:  { abs_pct: -88.38, cagr_pct: -34.98 },
      y10_to_y0: { abs_pct: -99.62, cagr_pct: -42.65 }
    }
  },

  projections: {
    // Fiat uses last-10y CAGR; BTC USD uses fixed +30% CAGR
    y5:  { fiat: 7.0843, btc: 0.00001648, sats: 1648 },
    y10: { fiat: 8.8049, btc: 0.00000552, sats: 552 }
  },

  display: {
    precision: { fiat: 2, btc: 8, sats: 0 }
  },

  debug: {
    series_used: { fiat_years: [2015, 2020, 2025], btc_months: ["2015-07", "2020-07", "2025-07"] },
    rates: {
      fiat_cagr_2015_2020_pct: 4.87,
      fiat_cagr_2020_2025_pct: 4.02,
      fiat_cagr_2015_2025_pct: 4.44,
      btc_price_cagr_assumed_pct: 30
    }
  }
} as const satisfies FullDeckV1;