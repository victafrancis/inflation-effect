import type { DeckCore } from "../types/deck";

export type Display = {
  item: {
    name: string;
    unit: string;
    category: string;
    source_method?: string;
    image_url?: string;
  };
  snapshots: {
    y10: { year: number; fiat: string; btc: string; sats: string; unitsPer100: string };
    y5:  { year: number; fiat: string; btc: string; sats: string; unitsPer100: string };
    y0:  { year: number; fiat: string; btc: string; sats: string; unitsPer100: string };
  };
  projections: {
    y5:  { fiat: string; btc: string; sats: string };
    y10: { fiat: string; btc: string; sats: string };
  };
  deltas: {
    fiat_10y: string; // e.g., "54.47%"
    sats_10y: string; // e.g., "-99.62%"
  };
  metrics: {
    years5: number;
    years10: number;
    pctChange5: number;       // e.g. 23.4
    pctChange10: number;      // e.g. 51.2
    cagr5: number;            // e.g. 0.031 (3.1%)
    cagr10: number;           // e.g. 0.047 (4.7%)
    pctChange5Text: string;   // e.g. "+23.4%"
    pctChange10Text: string;  // e.g. "+51.2%"
    cagr5Text: string;        // e.g. "3.1%"
    cagr10Text: string;       // e.g. "4.7%"
    y0Plus5: number;          // label convenience
    y0Plus10: number;
    snapshotTrendPoints: { label: string; value: number }[];
  };
};

// formatting helpers live here (UI-only)
const fmt$   = (n: number) => `$${n.toFixed(2)}`;
const fmtBTC = (n: number) => `${n.toFixed(5)} BTC`;
const fmtInt = (n: number) => n.toLocaleString("en-CA");
const yearOf = (iso: string) => Number(iso.slice(0, 4));

/** Build a display-friendly overlay from any superset of DeckCore. */
export function buildDisplay<T extends DeckCore>(d: T): Display {
  const snap = (s: DeckCore["snapshots"]["y0"]) => ({
    year: yearOf(s.date),
    fiat: fmt$(s.fiat.value),
    btc:  fmtBTC(s.btc.btc),
    sats: fmtInt(s.btc.sats),
    unitsPer100: s.small_item_metrics
      ? Math.floor(s.small_item_metrics.unitsPer100).toString()
      : "—",
  });

  const y0Year  = parseInt(d.snapshots.y0.date.slice(0,4), 10);
  const y5Year  = parseInt(d.snapshots.y5.date.slice(0,4), 10);
  const y10Year = parseInt(d.snapshots.y10.date.slice(0,4), 10);

  const y0Fiat  = d.snapshots.y0.fiat.value;
  const y5Fiat  = d.snapshots.y5.fiat.value;
  const y10Fiat = d.snapshots.y10.fiat.value;

  const years5  = Math.max(1, Math.abs(y0Year - y5Year));
  const years10 = Math.max(1, Math.abs(y0Year - y10Year));

  const pctChange5  = ((y0Fiat - y5Fiat) / y5Fiat) * 100;
  const pctChange10 = ((y0Fiat - y10Fiat) / y10Fiat) * 100;

  const cagr5  = Math.pow(y0Fiat / y5Fiat,  1 / years5)  - 1;
  const cagr10 = Math.pow(y0Fiat / y10Fiat, 1 / years10) - 1;

  const snapshotTrendPoints = [
    { label: String(y10Year), value: y10Fiat },
    { label: String(y5Year),  value: y5Fiat  },
    { label: String(y0Year),  value: y0Fiat  },
  ];

  return {
    item: {
      name: d.item.name,
      unit: d.item.unit,
      category: d.item.category,
      source_method: d.item.source_method,
      image_url: d.item.image_url,
    },
    snapshots: {
      y10: snap(d.snapshots.y10),
      y5:  snap(d.snapshots.y5),
      y0:  snap(d.snapshots.y0),
    },
    projections: {
      y5:  { fiat: fmt$(d.projections.y5.fiat),  btc: fmtBTC(d.projections.y5.btc),  sats: fmtInt(d.projections.y5.sats) },
      y10: { fiat: fmt$(d.projections.y10.fiat), btc: fmtBTC(d.projections.y10.btc), sats: fmtInt(d.projections.y10.sats) },
    },
    deltas: {
      fiat_10y: `${d.five_year_changes.fiat.y10_to_y0.abs_pct.toFixed(2)}%`,
      sats_10y: `${d.five_year_changes.btc_amount.y10_to_y0.abs_pct.toFixed(2)}%`,
    },
    metrics: {
      years5, years10,
      pctChange5, pctChange10,
      cagr5, cagr10,
      pctChange5Text:  `${pctChange5  >= 0 ? "+" : ""}${pctChange5.toFixed(1)}%`,
      pctChange10Text: `${pctChange10 >= 0 ? "+" : ""}${pctChange10.toFixed(1)}%`,
      cagr5Text:  `${(cagr5  * 100).toFixed(1)}%`,
      cagr10Text: `${(cagr10 * 100).toFixed(1)}%`,
      y0Plus5:  y0Year + 5,
      y0Plus10: y0Year + 10,
      snapshotTrendPoints
    },
  };
}
