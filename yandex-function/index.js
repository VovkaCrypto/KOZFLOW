// Yandex Cloud Function — принимает заявки с формы и шлёт в Telegram.
// Зеркало api/submit.js, адаптировано под формат YC + CORS.
//
// Runtime: nodejs18 (или новее — есть глобальный fetch).
// Переменные окружения функции (Консоль YC → функция → Редактор → Переменные):
//   TELEGRAM_BOT_TOKEN — токен бота от @BotFather
//   TELEGRAM_CHAT_ID   — id чата (твой user id или @channel, если бот админ)

const ALLOWED_ORIGINS = [
  'https://kozflow.ru',
  'https://www.kozflow.ru',
  'https://kozflow.com',
  'https://www.kozflow.com',
];

function corsHeaders(origin) {
  const allow = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    'Cache-Control': 'no-store',
    'Content-Type': 'application/json; charset=utf-8',
  };
}

function reply(statusCode, origin, obj) {
  return {
    statusCode,
    headers: corsHeaders(origin),
    body: JSON.stringify(obj),
  };
}

module.exports.handler = async function (event) {
  const headers = event.headers || {};
  const origin = headers.Origin || headers.origin || '';
  const method = event.httpMethod || 'GET';

  // CORS preflight
  if (method === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders(origin), body: '' };
  }
  if (method !== 'POST') {
    return reply(405, origin, { ok: false, error: 'Method not allowed' });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    return reply(500, origin, { ok: false, error: 'Telegram not configured on server' });
  }

  // Тело: YC может прислать base64
  let rawBody = event.body || '';
  if (event.isBase64Encoded) rawBody = Buffer.from(rawBody, 'base64').toString('utf8');
  let body;
  try { body = JSON.parse(rawBody); } catch { body = {}; }
  body = body || {};

  // Honeypot — молча принимаем
  if (body.website) return reply(200, origin, { ok: true });

  const kind = String(body.kind || 'form');
  const stamp = new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' }) + ' MSK';
  let text = '';

  if (kind === 'faq') {
    const q = String(body.question || '').trim().slice(0, 1000);
    if (!q) return reply(400, origin, { ok: false, error: 'Empty question' });
    text = ['❓ Вопрос с сайта (FAQ)', '', q, '', '— ' + stamp].join('\n');
  } else {
    const safe = (k) => String(body[k] || '—').trim().slice(0, 1500);
    const channelLabel = body.channel === 'tg' ? 'Telegram'
                       : body.channel === 'email' ? 'Email'
                       : body.channel === 'phone' ? 'Телефон' : '—';
    text = [
      '🔥 Новая заявка с kozflow.ru',
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
      body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
    });
    const data = await tgRes.json();
    if (!data.ok) return reply(502, origin, { ok: false, error: data.description || 'Telegram rejected' });
    return reply(200, origin, { ok: true });
  } catch (err) {
    return reply(500, origin, { ok: false, error: 'Network error' });
  }
};
