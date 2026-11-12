import crypto from 'node:crypto';
import { one, run } from '../db.js';

export function sha256(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

export function parseCookies(header) {
  const cookies = {};
  if (!header) return cookies;
  for (const part of header.split(';')) {
    const index = part.indexOf('=');
    if (index === -1) continue;
    const key = part.slice(0, index).trim();
    const value = part.slice(index + 1).trim();
    if (key) cookies[key] = decodeURIComponent(value);
  }
  return cookies;
}

export function ensureCsrf(req) {
  if (!req.session.csrf) {
    req.session.csrf = crypto.randomBytes(32).toString('hex');
  }
  return req.session.csrf;
}

export async function attachUser(req, res, next) {
  try {
    ensureCsrf(req);

    if (!req.session.userId) {
      const cookies = parseCookies(req.headers.cookie);
      const token = cookies.prosiga_token;
      if (token) {
        const user = await one(
          'SELECT id FROM usuarios WHERE token = $1 AND ativo = TRUE LIMIT 1',
          [sha256(token)]
        );
        if (user) {
          req.session.userId = user.id;
        } else {
          res.clearCookie('prosiga_token', { path: '/' });
        }
      }
    }

    if (req.session.userId) {
      req.user = await one('SELECT * FROM usuarios WHERE id = $1 AND ativo = TRUE', [
        req.session.userId,
      ]);
      if (!req.user) {
        delete req.session.userId;
        req.session.destroy(() => {});
      }
    }

    next();
  } catch (error) {
    next(error);
  }
}

export function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Faça login para continuar.' });
  }
  next();
}

export function requireRole(roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Faça login para continuar.' });
    }
    if (!roles.includes(req.user.tipo)) {
      return res.status(403).json({ error: 'Você não tem permissão para acessar esta área.' });
    }
    next();
  };
}

export function requireCsrf(req, res, next) {
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    return next();
  }
  if (!req.user) {
    return next();
  }
  const sent = req.get('x-csrf-token') || '';
  if (!req.session.csrf || sent !== req.session.csrf) {
    return res.status(403).json({ error: 'Sessão expirada. Recarregue a página e tente novamente.' });
  }
  next();
}

export async function createRememberToken(res, userId) {
  const token = crypto.randomBytes(32).toString('hex');
  await run('UPDATE usuarios SET token = $1 WHERE id = $2', [sha256(token), userId]);
  res.cookie('prosiga_token', token, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: '/',
  });
}

export async function clearRememberToken(req, res) {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies.prosiga_token;
  if (token) {
    await run('UPDATE usuarios SET token = NULL WHERE token = $1', [sha256(token)]);
    res.clearCookie('prosiga_token', { path: '/' });
  }
}
