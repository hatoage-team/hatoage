const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GMAIL_API = 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send';

function encodeHeader(value: string) {
  return `=?UTF-8?B?${Buffer.from(value).toString('base64')}?=`;
}

function base64Url(value: string) {
  return Buffer.from(value)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

async function getAccessToken() {
  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const refreshToken = process.env.GMAIL_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Gmail OAuth environment variables are not configured');
  }

  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    }),
    cache: 'no-store'
  });

  if (!response.ok) throw new Error(`Google token request failed: ${response.status}`);
  const data = await response.json() as { access_token?: string };
  if (!data.access_token) throw new Error('Google did not return an access token');
  return data.access_token;
}

export async function sendHtmlMail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const fromAddress = process.env.GMAIL_FROM;
  if (!fromAddress) throw new Error('GMAIL_FROM is not configured');

  const raw = [
    `From: ${encodeHeader('はとあげマーケット')} <${fromAddress}>`,
    `To: ${to}`,
    `Subject: ${encodeHeader(subject)}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset="UTF-8"',
    '',
    html
  ].join('\r\n');

  const response = await fetch(GMAIL_API, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${await getAccessToken()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ raw: base64Url(raw) }),
    cache: 'no-store'
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Gmail send failed: ${response.status} ${message}`);
  }
}
