# Yandex Cloud Function — приём формы → Telegram

Бесплатный тариф YC покрывает форму с запасом (1 млн вызовов/мес).
Открывается из РФ без VPN — в отличие от Vercel.

## Создание

1. [console.cloud.yandex.ru](https://console.cloud.yandex.ru) → войти, создать платёжный аккаунт (нужна карта, но в рамках free tier списаний нет).
2. **Cloud Functions** → **Создать функцию** → имя `kozflow-form`.
3. **Создать редактор** → среда выполнения **Node.js 18** (или новее).
4. Способ — **Редактор кода**. Вставь содержимое `index.js` (из этой папки) в файл `index.js`.
5. **Точка входа**: `index.handler`
6. **Переменные окружения**:
   - `TELEGRAM_BOT_TOKEN` = токен от @BotFather
   - `TELEGRAM_CHAT_ID` = твой chat id
7. Таймаут 10 сек, память 128 МБ — хватит.
8. **Создать версию**.

## Сделать публичной

Вкладка функции → **Обзор** → включить **«Публичная функция»** (публичный доступ без IAM).
Скопируй **URL для вызова** — вид:
`https://functions.yandexcloud.net/d4xxxxxxxxxxxxxxxxxx`

## Подключить к сайту

В `app.js` найди `FORM_ENDPOINT` и вставь этот URL вместо заглушки:

```js
const FORM_ENDPOINT = 'https://functions.yandexcloud.net/d4xxxxxxxxxxxxxxxxxx';
```

Закоммить и запушь — заработает и на `.ru` (GitHub Pages), и на `.com` (Vercel).

## Проверка

```bash
curl -X POST https://functions.yandexcloud.net/<ID> \
  -H "Content-Type: application/json" \
  -d '{"kind":"faq","question":"тест"}'
```
Должно прийти сообщение в Telegram и ответ `{"ok":true}`.
