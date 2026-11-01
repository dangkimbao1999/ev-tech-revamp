'use server'
import { db } from '@/lib/data'
import { CONTACT_RULES, PARTNER_RULES, validate } from '@/lib/validate'

export type LeadResult = { ok: true } | { ok: false; errors: Record<string, string> }

// ponytail: no rate limiting / captcha; add (e.g. Cloudflare Turnstile) if spam shows up.
export async function submitLead(kind: 'contact' | 'partner', input: Record<string, string>): Promise<LeadResult> {
  const rules = kind === 'contact' ? CONTACT_RULES : PARTNER_RULES
  const data = Object.fromEntries(Object.keys(rules).map((k) => [k, String(input[k] ?? '').trim()]))
  const errors = validate(rules, data)
  if (Object.keys(errors).length) return { ok: false, errors }
  await (await db()).create({ collection: 'leads', data: { kind, ...data, email: data.email || undefined } as never })
  return { ok: true }
}
