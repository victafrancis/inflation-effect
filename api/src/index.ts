// src/index.ts
import { Hono } from 'hono'
import { neon } from '@neondatabase/serverless'
import { cors } from 'hono/cors'

type Env = { DATABASE_URL: string }

const app = new Hono();

app.use('/*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization']
}))


// --------------------------- utils ------------------------------------------

/** Coerce Postgres NUMERIC/INTEGER fields (often strings) to number or null */
function asNum(v: unknown): number | null {
  if (v === null || v === undefined) return null
  const n = typeof v === 'number' ? v : parseFloat(String(v))
  return Number.isFinite(n) ? n : null
}

function asInt(v: unknown): number | null {
  if (v === null || v === undefined) return null
  const n = typeof v === 'number' ? Math.trunc(v) : parseInt(String(v), 10)
  return Number.isFinite(n) ? n : null
}

type Row = {
  id: number | string
  name: string
  unit: string
  category: string
  image_url: string | null
  source_method: string | null

  y0_year: number | string | null
  y5_year: number | string | null
  y10_year: number | string | null

  y0_price: number | string | null
  y5_price: number | string | null
  y10_price: number | string | null

  y0_btc: number | string | null
  y5_btc: number | string | null
  y10_btc: number | string | null
}

function toSnapshot(
  yearRaw: unknown,
  priceRaw: unknown,
  btcRaw: unknown
) {
  const year = asInt(yearRaw)
  const priceCad = asNum(priceRaw)
  const btcPrice = asNum(btcRaw)

  if (year == null || priceCad == null) return null

  // If BTC price missing or non-positive, just zero out btc/sats so FE can hide BTC sections
  const btc = btcPrice && btcPrice > 0 ? priceCad / btcPrice : 0
  const sats = btcPrice && btcPrice > 0 ? Math.round(btc * 100_000_000) : 0

  // Simple heuristic for small items (lets your conditional section hide/show correctly)
  const unitsPer100 = priceCad > 0 ? +(100 / priceCad).toFixed(2) : null
  const small_item_metrics =
    unitsPer100 != null ? { unitsPer100, applicability: 'auto' as const } : undefined

  return {
    date: `${year}-01-01`, // year-level anchoring
    fiat: { value: +priceCad.toFixed(2) },
    btc: {
      btc: +btc.toFixed(8),
      sats
    },
    ...(small_item_metrics ? { small_item_metrics } : {})
  }
}

async function getDeckById(sql: ReturnType<typeof neon>, id: number) {
  const rows = await sql<Row>`
    WITH
      anchor AS (SELECT EXTRACT(YEAR FROM CURRENT_DATE)::int AS y0),
      targets AS (SELECT y0, (y0 - 5) AS y5_target, (y0 - 10) AS y10_target FROM anchor),
      chosen AS (
        SELECT
          i.id, i.name, i.unit, i.category, i.image_url, i.source_method,
          (SELECT max(h.year) FROM item_historical_price h JOIN targets t ON true
           WHERE h.item_id = i.id AND h.year <= t.y0)        AS y0_year,
          (SELECT max(h.year) FROM item_historical_price h JOIN targets t ON true
           WHERE h.item_id = i.id AND h.year <= t.y5_target) AS y5_year,
          (SELECT max(h.year) FROM item_historical_price h JOIN targets t ON true
           WHERE h.item_id = i.id AND h.year <= t.y10_target) AS y10_year
        FROM item i
        WHERE i.id = ${id}
      ),
      priced AS (
        SELECT
          c.*,
          (SELECT h.price FROM item_historical_price h WHERE h.item_id = c.id AND h.year = c.y0_year)  AS y0_price,
          (SELECT h.price FROM item_historical_price h WHERE h.item_id = c.id AND h.year = c.y5_year)  AS y5_price,
          (SELECT h.price FROM item_historical_price h WHERE h.item_id = c.id AND h.year = c.y10_year) AS y10_price
        FROM chosen c
      ),
      btc AS (
        -- pick latest month up to July within each resolved year (fallback earlier in-year)
        SELECT
          p.*,
          (
            SELECT b.price FROM btc_monthly_price b
            WHERE b.year = p.y0_year
              AND b.month = (SELECT max(b2.month) FROM btc_monthly_price b2 WHERE b2.year = p.y0_year AND b2.month <= 7)
          ) AS y0_btc,
          (
            SELECT b.price FROM btc_monthly_price b
            WHERE b.year = p.y5_year
              AND b.month = (SELECT max(b2.month) FROM btc_monthly_price b2 WHERE b2.year = p.y5_year AND b2.month <= 7)
          ) AS y5_btc,
          (
            SELECT b.price FROM btc_monthly_price b
            WHERE b.year = p.y10_year
              AND b.month = (SELECT max(b2.month) FROM btc_monthly_price b2 WHERE b2.year = p.y10_year AND b2.month <= 7)
          ) AS y10_btc
        FROM priced p
      )
    SELECT
      id, name, unit, category, image_url, source_method,
      y0_year, y5_year, y10_year,
      y0_price, y5_price, y10_price,
      y0_btc, y5_btc, y10_btc
    FROM btc
  `

  if (!rows.length) return null
  const r = rows[0]

  const y0 = toSnapshot(r.y0_year, r.y0_price, r.y0_btc)
  const y5 = toSnapshot(r.y5_year, r.y5_price, r.y5_btc)
  const y10 = toSnapshot(r.y10_year, r.y10_price, r.y10_btc)

  // Hard requirement: all three snapshots must exist
  if (!y0 || !y5 || !y10) return null

  // ---------- computations for projections & changes ----------

  const year = (iso: string) => parseInt(iso.slice(0, 4), 10)
  const yearsBetween = (aIso: string, bIso: string) => Math.max(1, Math.abs(year(aIso) - year(bIso)))

  const yrs5  = yearsBetween(y0.date, y5.date)
  const yrs10 = yearsBetween(y0.date, y10.date)

  const cagr = (now: number, then: number, yrs: number) => (then > 0 && yrs > 0) ? Math.pow(now / then, 1 / yrs) - 1 : 0

  // Fiat CAGRs from snapshots
  const cagr5  = cagr(y0.fiat.value,  y5.fiat.value,  yrs5)
  const cagr10 = cagr(y0.fiat.value, y10.fiat.value, yrs10)

  // Fiat projections
  const fiat_y5  = +(y0.fiat.value * Math.pow(1 + cagr5,  5)).toFixed(2)
  const fiat_y10 = +(y0.fiat.value * Math.pow(1 + cagr10, 10)).toFixed(2)

  // BTC price at y0 in CAD (derive from snapshot)
  const btcCad0 = y0.btc.btc > 0 ? +(y0.fiat.value / y0.btc.btc).toFixed(2) : null
  const btcProj = (fiatValue: number, yrs: number) => {
    if (!btcCad0) return { btc: 0, sats: 0 }
    const futureBtcPrice = btcCad0 * Math.pow(1.3, yrs) // +30% CAGR assumption
    const btcAmt = fiatValue / futureBtcPrice
    return { btc: +btcAmt.toFixed(8), sats: Math.round(btcAmt * 100_000_000) }
  }

  const projY5  = { fiat: fiat_y5,  ...btcProj(fiat_y5,  5) }
  const projY10 = { fiat: fiat_y10, ...btcProj(fiat_y10, 10) }

  // Five-year changes (abs % and CAGR %)
  const pctAbs = (now: number, then: number) => then === 0 ? 0 : ((now - then) / then) * 100
  const pair = (nowFiat: number, thenFiat: number, nowBtc: number, thenBtc: number, yrs: number) => ({
    fiat:       { abs_pct: +pctAbs(nowFiat, thenFiat).toFixed(2), cagr_pct: +(cagr(nowFiat, thenFiat, yrs) * 100).toFixed(2) },
    btc_amount: { abs_pct: +pctAbs(nowBtc,  thenBtc ).toFixed(2), cagr_pct: +(cagr(nowBtc,  thenBtc,  yrs) * 100).toFixed(2) },
  })

  const ch_10_5 = pair(y5.fiat.value, y10.fiat.value, y5.btc.btc, y10.btc.btc, yrs5)
  const ch_5_0  = pair(y0.fiat.value, y5.fiat.value,  y0.btc.btc, y5.btc.btc,  yrs5)
  const ch_10_0 = pair(y0.fiat.value, y10.fiat.value, y0.btc.btc, y10.btc.btc, yrs10)

  // ---------- final payload ----------

  return {
    item: {
      id: asInt(r.id)!,
      name: r.name,
      unit: r.unit,
      category: r.category,
      image_url: r.image_url ?? undefined,
      source_method: r.source_method ?? undefined,
    },
    snapshots: { y10, y5, y0 },
    projections: { y5: projY5, y10: projY10 },
    five_year_changes: {
      fiat: {
        y10_to_y5: ch_10_5.fiat,
        y5_to_y0:  ch_5_0.fiat,
        y10_to_y0: ch_10_0.fiat,
      },
      btc_amount: {
        y10_to_y5: ch_10_5.btc_amount,
        y5_to_y0:  ch_5_0.btc_amount,
        y10_to_y0: ch_10_0.btc_amount,
      }
    }
  }
}

// --------------------------- routes -----------------------------------------

app.get('/v1/health', c => c.text('ok'))

app.get('/v1/deck/random', async c => {
  const sql = neon(c.env.DATABASE_URL)
  const ids = await sql<{ id: number | string }>`SELECT id FROM item WHERE is_deleted IS FALSE ORDER BY random() LIMIT 1`
  const id = asInt(ids[0]?.id)
  if (!id) return c.json({ error: 'no items' }, 404)

  const deck = await getDeckById(sql, id)
  if (!deck) return c.json({ error: 'random item had no usable data' }, 404)
  return c.json(deck)
})

app.get('/v1/deck/:id', async c => {
  const id = Number(c.req.param('id'))
  if (!Number.isFinite(id)) return c.json({ error: 'invalid id' }, 400)

  const sql = neon(c.env.DATABASE_URL)
  const deck = await getDeckById(sql, id)
  if (!deck) return c.json({ error: 'item not found or no data' }, 404)
  return c.json(deck)
})

export default app
