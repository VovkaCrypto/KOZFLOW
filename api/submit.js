// Vercel serverless function — receives form/FAQ submissions and forwards to Telegram.
//
// Required env vars (set in Vercel dashboard or `vercel env add`):
//   TELEGRAM_BOT_TOKEN  — bot token from @BotFather
//   TELEGRAM_CHAT_ID    — target chat id (e.g. user id, or @channelusername if bot is admin)

export default async function handler(req, res) {
  // CORS — allow same-origin only by default; override with VERCEL env if needed
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    return res.status(500).json({ ok: false, error: 'Telegram not configured on server' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  body = body || {};

  // Honeypot — silent reject if filled
  if (body.website) {
    return res.status(200).json({ ok: true });
  }

  const kind = String(body.kind || 'form');
  let text = '';

  const stamp = new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' }) + ' MSK';

  if (kind === 'faq') {
    const q = String(body.question || '').trim().slice(0, 1000);
    if (!q) return res.status(400).json({ ok: false, error: 'Empty question' });
    text = [
      '❓ Вопрос с сайта (FAQ)',
      '',
      q,
      '',
      '— ' + stamp,
    ].join('\n');
  } else {
    const safe = (k) => String(body[k] || '—').trim().slice(0, 1500);
    const channelLabel = body.channel === 'tg' ? 'Telegram'
                       : body.channel === 'email' ? 'Email'
                       : body.channel === 'phone' ? 'Телефон'
                       : '—';
    text = [
      '🔥 Новая заявка с kozflow.vercel.app',
      '',
      'Имя: ' + safe('name'),
      'Контакт (' + channelLabel + '): ' + safe('contact'),
      'Тип задачи: ' + safe('type'),
      'Бюджет: ' + safe('budget'),
      'Сроки: ' + safe('urgency'),
      '',
      'Описание:',
      safe('task'),
      '',
      '— ' + stamp,
    ].join('\n');
  }

  try {
    const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        disable_web_page_preview: true,
      }),
    });
    const data = await tgRes.json();
    if (!data.ok) {
      console.error('Telegram error:', data);
      return res.status(502).json({ ok: false, error: data.description || 'Telegram rejected message' });
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Network error:', err);
    return res.status(500).json({ ok: false, error: 'Network error' });
  }
}

