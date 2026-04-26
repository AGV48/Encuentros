import { HttpInterceptorFn } from '@angular/common/http';

type RuntimeConfig = {
  apiBaseUrl?: string;
};

declare global {
  interface Window {
    __APP_CONFIG__?: RuntimeConfig;
  }
}

const API_PREFIXES = [
  '/auth',
  '/users',
  '/encuentro',
  '/chat',
  '/participantes-encuentro',
  '/presupuesto',
  '/bolsillo',
  '/aporte',
];

function isAbsoluteUrl(url: string) {
  return /^https?:\/\//i.test(url);
}

function normalizeBaseUrl(url?: string) {
  if (!url) return '';
  return url.trim().replace(/\/+$/, '');
}

function isApiPath(url: string) {
  return API_PREFIXES.some(
    (prefix) => url === prefix || url.startsWith(`${prefix}/`) || url.startsWith(`${prefix}?`),
  );
}

export const apiBaseUrlInterceptor: HttpInterceptorFn = (req, next) => {
  if (isAbsoluteUrl(req.url) || !isApiPath(req.url)) {
    return next(req);
  }

  const apiBaseUrl = normalizeBaseUrl(window.__APP_CONFIG__?.apiBaseUrl);
  if (!apiBaseUrl) {
    return next(req);
  }

  const urlPath = req.url.startsWith('/') ? req.url : `/${req.url}`;
  return next(req.clone({ url: `${apiBaseUrl}${urlPath}` }));
};
