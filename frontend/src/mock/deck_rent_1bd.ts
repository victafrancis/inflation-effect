import type { FullDeckV1 } from "../types/deck";

export const deckRent1bd = {
  params: {
    itemId: 13,
    anchor_year: 2025,
    anchor_month: 7,
    snap_offsets_years: [-10, -5, 0, 5, 10],
  },

  item: {
    id: 13,
    name: "1-bedroom apartment rent",
    unit: "per month",
    category: "Housing",
    source_method:
      "The agent sourced annual prices from Numbeo’s Toronto “Apartment (1 bedroom) in City Centre” data (2015–2024), applied linear interpolation for gaps, and projected 2025 with a 5% increase.",
    image_url: "/items/rent_1bd.png"
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
      fiat: { value: 1513.10 },
      btc:  { btc: 5.24562316, sats: 524562316 },
      btc_usd_used: 288.45
    },
    y5: {
      date: "2020-07-01",
      fiat: { value: 2064.43 },
      btc:  { btc: 0.18695483, sats: 18695483 },
      btc_usd_used: 11042.40
    },
    y0: {
      date: "2025-07-01",
      fiat: { value: 2630.76 },
      btc:  { btc: 0.02272634, sats: 2272634 },
      btc_usd_used: 115758.20
    }
  },

  five_year_changes: {
    fiat: {
      y10_to_y5: { abs_pct: 36.44, cagr_pct: 6.41 },
      y5_to_y0:  { abs_pct: 27.43, cagr_pct: 4.97 },
      y10_to_y0: { abs_pct: 73.87, cagr_pct: 5.69 }
    },
    btc_amount: {
      y10_to_y5: { abs_pct: -96.44, cagr_pct: -48.67 },
      y5_to_y0:  { abs_pct: -87.84, cagr_pct: -34.39 },
      y10_to_y0: { abs_pct: -99.57, cagr_pct: -41.97 }
    }
  },

  projections: {
    // Fiat uses last-10y CAGR; BTC USD uses fixed +30% CAGR
    y5:  { fiat: 3468.87, btc: 0.00807085, sats: 807085 },
    y10: { fiat: 4573.99, btc: 0.00286622, sats: 286622 }
  },

  display: {
    precision: { fiat: 2, btc: 8, sats: 0 }
  },

  debug: {
    series_used: { fiat_years: [2015, 2020, 2025], btc_months: ["2015-07", "2020-07", "2025-07"] },
    rates: {
      fiat_cagr_2015_2020_pct: 6.41,
      fiat_cagr_2020_2025_pct: 4.97,
      fiat_cagr_2015_2025_pct: 5.69,
      btc_price_cagr_assumed_pct: 30
    }
  }
} as const satisfies FullDeckV1;