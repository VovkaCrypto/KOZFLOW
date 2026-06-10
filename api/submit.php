<?php
// PHP-версия Telegram-форвардера для shared-хостинга (Timeweb).
// Зеркало api/submit.js. Фронт шлёт JSON на /api/submit (см. .htaccess rewrite).
//
// Токен/чат берём из переменных окружения, иначе из api/config.php
//   TELEGRAM_BOT_TOKEN — токен бота от @BotFather
//   TELEGRAM_CHAT_ID   — id чата (твой user id или @channel, если бот админ)

header('Cache-Control: no-store');
header('Content-Type: application/json; charset=utf-8');

function out($code, $arr) {
  http_response_code($code);
  echo json_encode($arr, JSON_UNESCAPED_UNICODE);
  exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  out(405, ['ok' => false, 'error' => 'Method not allowed']);
}

$token  = getenv('TELEGRAM_BOT_TOKEN');
$chatId = getenv('TELEGRAM_CHAT_ID');
if ((!$token || !$chatId) && is_file(__DIR__ . '/config.php')) {
  $cfg = require __DIR__ . '/config.php';
  $token  = $token  ?: ($cfg['TELEGRAM_BOT_TOKEN'] ?? '');
  $chatId = $chatId ?: ($cfg['TELEGRAM_CHAT_ID'] ?? '');
}
if (!$token || !$chatId) {
  out(500, ['ok' => false, 'error' => 'Telegram not configured on server']);
}

$raw  = file_get_contents('php://input');
$body = json_decode($raw, true);
if (!is_array($body)) $body = [];

// Honeypot — молча принимаем, если заполнено
if (!empty($body['website'])) {
  out(200, ['ok' => true]);
}

$cut = function ($k, $n) use ($body) {
  $v = isset($body[$k]) ? trim((string)$body[$k]) : '—';
  if ($v === '') $v = '—';
  return mb_substr($v, 0, $n);
};

$stamp = (new DateTime('now', new DateTimeZone('Europe/Moscow')))->format('d.m.Y, H:i:s') . ' MSK';
$kind  = isset($body['kind']) ? (string)$body['kind'] : 'form';

if ($kind === 'faq') {
  $q = mb_substr(trim((string)($body['question'] ?? '')), 0, 1000);
  if ($q === '') out(400, ['ok' => false, 'error' => 'Empty question']);
  $text = "❓ Вопрос с сайта (FAQ)\n\n{$q}\n\n— {$stamp}";
} else {
  $ch = ($body['channel'] ?? '') === 'tg' ? 'Telegram'
      : (($body['channel'] ?? '') === 'email' ? 'Email'
      : (($body['channel'] ?? '') === 'phone' ? 'Телефон' : '—'));
  $text = "🔥 Новая заявка с kozflow.ru\n\n"
        . 'Имя: ' . $cut('name', 1500) . "\n"
        . 'Контакт (' . $ch . '): ' . $cut('contact', 1500) . "\n"
        . 'Тип задачи: ' . $cut('type', 1500) . "\n"
        . 'Бюджет: ' . $cut('budget', 1500) . "\n"
        . 'Сроки: ' . $cut('urgency', 1500) . "\n\n"
        . "Описание:\n" . $cut('task', 1500) . "\n\n"
        . '— ' . $stamp;
}

$payload = json_encode([
  'chat_id' => $chatId,
  'text' => $text,
  'disable_web_page_preview' => true,
], JSON_UNESCAPED_UNICODE);

$ch = curl_init("https://api.telegram.org/bot{$token}/sendMessage");
curl_setopt_array($ch, [
  CURLOPT_POST => true,
  CURLOPT_POSTFIELDS => $payload,
  CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_TIMEOUT => 15,
]);
$res = curl_exec($ch);
$err = curl_error($ch);
curl_close($ch);

if ($res === false) {
  out(500, ['ok' => false, 'error' => 'Network error: ' . $err]);
}
$data = json_decode($res, true);
if (empty($data['ok'])) {
  out(502, ['ok' => false, 'error' => $data['description'] ?? 'Telegram rejected message']);
}
out(200, ['ok' => true]);
