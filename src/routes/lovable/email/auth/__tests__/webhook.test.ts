import { beforeEach, describe, expect, it, vi } from 'vitest'

import { processAuthWebhook } from '@/routes/lovable/email/auth/webhook'

/**
 * End-to-end webhook test.
 *
 * We drive the real handler body (`processAuthWebhook`) through the same
 * signature verification path production uses (`@lovable.dev/webhooks-js`),
 * injecting a Supabase client stub so we can assert exactly what would be
 * inserted into `email_send_log` and enqueued into pgmq.
 */

const SECRET = 'test-secret-key'

const enc = new TextEncoder()

async function sign(body: string, timestampMs: number): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(`${timestampMs}.${body}`))
  return (
    'sha256=' +
    Array.from(new Uint8Array(sig))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
  )
}

type LogRow = { message_id: string; status: string; [k: string]: any }

function makeSupabaseStub(existingRows: LogRow[] = []) {
  const inserts: LogRow[] = []
  const rpcs: Array<{ name: string; args: any }> = []
  let existingMatchesMessageId: string | null = null

  const supabase: any = {
    from: (_table: string) => ({
      select: (_cols: string) => ({
        eq: (_col: string, value: string) => ({
          limit: async (_n: number) => {
            existingMatchesMessageId = value
            const rows = existingRows.filter((r) => r.message_id === value)
            return { data: rows, error: null }
          },
        }),
      }),
      insert: async (row: LogRow) => {
        inserts.push(row)
        return { data: null, error: null }
      },
    }),
    rpc: async (name: string, args: any) => {
      rpcs.push({ name, args })
      return { data: null, error: null }
    },
  }
  return { supabase, inserts, rpcs, get lastCheckedMessageId() { return existingMatchesMessageId } }
}

function makePayload(overrides: Partial<any> = {}) {
  return {
    version: '1',
    type: 'auth',
    run_id: 'run-abc-123',
    data: {
      action_type: 'recovery',
      email: 'alice@example.com',
      url: 'https://weddings.io/auth/callback?token=xyz',
      token: 'xyz',
      token_hash: 'xyzhash',
      redirect_to: 'https://weddings.io/',
      email_action_type: 'recovery',
      user: {},
    },
    ...overrides,
  }
}

async function makeSignedRequest(payload: unknown, opts: { skewMs?: number } = {}) {
  const body = JSON.stringify(payload)
  const now = Date.now() + (opts.skewMs ?? 0)
  const signature = await sign(body, now)
  return new Request('http://local.test/lovable/email/auth/webhook', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-lovable-signature': signature,
      'x-lovable-timestamp': String(now),
    },
    body,
  })
}

beforeEach(() => {
  vi.stubEnv('VITE_SUPABASE_URL', 'http://localhost:54321')
  vi.stubEnv('SUPABASE_URL', 'http://localhost:54321')
  vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'srv-role-test')
})

describe('auth webhook — signature verification', () => {
  it('rejects requests with an invalid signature', async () => {
    const body = JSON.stringify(makePayload())
    const req = new Request('http://local.test/lovable/email/auth/webhook', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-lovable-signature': 'sha256=deadbeef',
        'x-lovable-timestamp': String(Date.now()),
      },
      body,
    })
    const stub = makeSupabaseStub()
    const res = await processAuthWebhook(req, { apiKey: SECRET, supabase: stub.supabase })
    expect(res.status).toBe(401)
    expect(stub.inserts).toHaveLength(0)
    expect(stub.rpcs).toHaveLength(0)
  })

  it('rejects requests missing the timestamp header', async () => {
    const body = JSON.stringify(makePayload())
    const req = new Request('http://local.test/lovable/email/auth/webhook', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-lovable-signature': 'sha256=whatever',
      },
      body,
    })
    const stub = makeSupabaseStub()
    const res = await processAuthWebhook(req, { apiKey: SECRET, supabase: stub.supabase })
    expect(res.status).toBe(401)
    expect(stub.inserts).toHaveLength(0)
  })

  it('rejects requests with a stale timestamp (outside tolerance)', async () => {
    const req = await makeSignedRequest(makePayload(), { skewMs: -10 * 60 * 1000 })
    const stub = makeSupabaseStub()
    const res = await processAuthWebhook(req, { apiKey: SECRET, supabase: stub.supabase })
    expect(res.status).toBe(401)
    expect(stub.inserts).toHaveLength(0)
  })

  it('accepts a properly signed and time-fresh request', async () => {
    const req = await makeSignedRequest(makePayload())
    const stub = makeSupabaseStub()
    const res = await processAuthWebhook(req, { apiKey: SECRET, supabase: stub.supabase })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.queued).toBe(true)
  })
})

describe('auth webhook — idempotency', () => {
  it('does not enqueue a second time for a duplicate delivery (same run_id)', async () => {
    const payload = makePayload({ run_id: 'run-dup-1' })

    // First delivery — nothing in the log yet.
    const req1 = await makeSignedRequest(payload)
    const stub1 = makeSupabaseStub([])
    const res1 = await processAuthWebhook(req1, { apiKey: SECRET, supabase: stub1.supabase })
    expect(res1.status).toBe(200)
    const body1 = await res1.json()
    expect(body1.messageId).toBe('run-dup-1')
    expect(stub1.rpcs).toHaveLength(1)
    expect(stub1.inserts).toHaveLength(1)
    expect(stub1.inserts[0].status).toBe('pending')

    // Simulate the same message_id already present (from the first delivery).
    const req2 = await makeSignedRequest(payload)
    const stub2 = makeSupabaseStub([{ message_id: 'run-dup-1', status: 'pending' }])
    const res2 = await processAuthWebhook(req2, { apiKey: SECRET, supabase: stub2.supabase })
    expect(res2.status).toBe(200)
    const body2 = await res2.json()
    expect(body2.deduplicated).toBe(true)
    expect(body2.messageId).toBe('run-dup-1')
    // Critically: no enqueue and no new insert for the duplicate.
    expect(stub2.rpcs).toHaveLength(0)
    expect(stub2.inserts).toHaveLength(0)
  })

  it('dedupes even if the prior attempt already reached "sent"', async () => {
    const payload = makePayload({ run_id: 'run-already-sent' })
    const req = await makeSignedRequest(payload)
    const stub = makeSupabaseStub([{ message_id: 'run-already-sent', status: 'sent' }])
    const res = await processAuthWebhook(req, { apiKey: SECRET, supabase: stub.supabase })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.deduplicated).toBe(true)
    expect(body.priorStatus).toBe('sent')
    expect(stub.rpcs).toHaveLength(0)
  })
})

describe('auth webhook — recipient & template mapping', () => {
  const actions = [
    { action: 'signup', email: 'signup@example.com' },
    { action: 'magiclink', email: 'magic@example.com' },
    { action: 'recovery', email: 'reset@example.com' },
    { action: 'invite', email: 'invite@example.com' },
    { action: 'reauthentication', email: 'reauth@example.com' },
  ] as const

  it.each(actions)(
    'routes $action to the right template and preserves the recipient + message_id',
    async ({ action, email }) => {
      const runId = `run-${action}-1`
      const payload = makePayload({
        run_id: runId,
        data: {
          action_type: action,
          email,
          url: 'https://weddings.io/auth/callback?token=t',
          token: 't',
          token_hash: 'th',
          redirect_to: 'https://weddings.io/',
          email_action_type: action,
          user: {},
        },
      })
      const req = await makeSignedRequest(payload)
      const stub = makeSupabaseStub()

      const res = await processAuthWebhook(req, { apiKey: SECRET, supabase: stub.supabase })
      expect(res.status).toBe(200)
      const body = await res.json()

      // Response mapping
      expect(body.messageId).toBe(runId)
      expect(body.emailType).toBe(action)

      // Log insert mapping
      expect(stub.inserts).toHaveLength(1)
      const logRow = stub.inserts[0]
      expect(logRow.message_id).toBe(runId)
      expect(logRow.template_name).toBe(action)
      expect(logRow.recipient_email).toBe(email)
      expect(logRow.status).toBe('pending')
      expect(logRow.metadata.email_action_type).toBe(action)
      expect(logRow.metadata.run_id).toBe(runId)

      // Queue mapping
      expect(stub.rpcs).toHaveLength(1)
      expect(stub.rpcs[0].name).toBe('enqueue_email')
      expect(stub.rpcs[0].args.queue_name).toBe('auth_emails')
      const q = stub.rpcs[0].args.payload
      expect(q.to).toBe(email)
      expect(q.message_id).toBe(runId)
      expect(q.run_id).toBe(runId)
      expect(q.label).toBe(action)
      expect(q.html).toContain('Weddings.io')
    },
  )

  it('rejects an unknown action_type without touching the queue', async () => {
    const payload = makePayload({ data: { ...makePayload().data, action_type: 'bogus' } })
    const req = await makeSignedRequest(payload)
    const stub = makeSupabaseStub()
    const res = await processAuthWebhook(req, { apiKey: SECRET, supabase: stub.supabase })
    expect(res.status).toBe(400)
    expect(stub.inserts).toHaveLength(0)
    expect(stub.rpcs).toHaveLength(0)
  })
})
