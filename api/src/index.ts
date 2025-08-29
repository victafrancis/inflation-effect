import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { neon } from '@neondatabase/serverless'

type Env = {
  DATABASE_URL: string
}

const app = new Hono<{ Bindings: Env }>()
app.use('*', cors({ origin: '*', allowMethods: ['GET'] }))

// Health check
app.get('/v1/health', c => c.json({ ok: true }))

// Deck endpoint (basic placeholder for now)
app.get('/v1/deck/:id', async c => {
  try {
    const id = Number(c.req.param('id'))
    if (!Number.isFinite(id)) return c.json({ error: 'invalid id' }, 400)

    const sql = neon(c.env.DATABASE_URL)

    const rows = await sql`
      SELECT id, name
      FROM item
      WHERE id = ${id}
    `

    // ✅ optionally type-assert AFTER the call
    const [item] = rows as { id: number; name: string }[]

    if (!item) return c.json({ error: 'item not found' }, 404)

    return c.json({
      item,
      message: 'TODO: implement full deck logic here'
    })
  } catch (err: any) {
    // see the actual cause during dev
    return c.json({ error: 'internal', detail: String(err?.message ?? err) }, 500)
  }
})


export default app
