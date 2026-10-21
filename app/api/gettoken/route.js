import { NextResponse } from 'next/server';
import { isAuthorized } from '../../../lib/auth';

export const runtime = 'nodejs';

export async function POST(request) {
  if (!isAuthorized(request)) return NextResponse.json({ error: 'Please log in.' }, { status: 401 });
  try {
    const { email, password } = await request.json();
    if (!email || !password) return NextResponse.json({ error: 'Email and password required.' }, { status: 400 });

    const r = await fetch('https://discord.com/api/v10/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'X-Super-Properties': Buffer.from(JSON.stringify({ os: 'Windows', browser: 'Chrome', device: '', system_locale: 'en-US', browser_version: '120.0.0.0' })).toString('base64'),
      },
      body: JSON.stringify({ login: email, password, undelete: false, login_source: null, gift_code_sku_id: null }),
    });

    const data = await r.json().catch(() => ({}));

    if (data.token) return NextResponse.json({ token: data.token });
    if (data.mfa) return NextResponse.json({ mfa: true, ticket: data.ticket });
    if (data.errors || data.message) return NextResponse.json({ error: data.message || 'Invalid credentials.' }, { status: 400 });

    return NextResponse.json({ error: 'Login failed. Check your credentials.' }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: e.message || 'Request failed.' }, { status: 500 });
  }
}
