// Гео-редирект: RU-айпи → kozflow.ru, остальные → kozflow.com
// Работает как Vercel Edge Middleware (фреймворк не нужен).

export const config = {
  // Пропускаем api, статику и любые файлы с расширением
  matcher: ['/((?!api|assets|_next|favicon).*)'],
};

const RU_HOST = 'kozflow.ru';
const COM_HOST = 'kozflow.com';

export default function middleware(request) {
  const url = new URL(request.url);
  const host = (request.headers.get('host') || url.hostname).toLowerCase();
  const country = request.headers.get('x-vercel-ip-country') || '';

  // Не трогаем preview-домены vercel.app и localhost
  if (host.endsWith('.vercel.app') || host.startsWith('localhost')) return;

  const isRu = country === 'RU';
  const onRu = host.endsWith(RU_HOST);
  const onCom = host.endsWith(COM_HOST);

  // RU-посетитель на .com → кидаем на .ru
  if (isRu && onCom) {
    url.host = host.replace(COM_HOST, RU_HOST);
    return Response.redirect(url.toString(), 307);
  }

  // Не-RU посетитель на .ru → кидаем на .com
  if (!isRu && onRu) {
    url.host = host.replace(RU_HOST, COM_HOST);
    return Response.redirect(url.toString(), 307);
  }

  // Иначе пропускаем как есть
}
