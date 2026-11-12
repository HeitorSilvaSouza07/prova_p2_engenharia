import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { one, run } from '../db.js';
import { publicUser } from '../helpers.js';
import {
  createRememberToken,
  clearRememberToken,
  ensureCsrf,
  requireAuth,
} from '../middleware/auth.js';

const router = Router();

router.get('/session', (req, res) => {
  res.json({ user: publicUser(req.user), csrf: ensureCsrf(req) });
});

router.post('/login', async (req, res, next) => {
  try {
    const { identifier = '', senha = '', lembrar } = req.body || {};

    if (!identifier.trim() || !senha) {
      return res.status(400).json({ error: 'Preencha seu e-mail ou matrícula e sua senha.' });
    }

    const user = await one(
      'SELECT * FROM usuarios WHERE (email = $1 OR matricula = $1) AND ativo = TRUE LIMIT 1',
      [identifier.trim()]
    );

    if (!user || !(await bcrypt.compare(senha, user.senha))) {
      return res.status(401).json({ error: 'E-mail, matrícula ou senha inválidos.' });
    }

    req.session.regenerate(async (error) => {
      if (error) return next(error);
      req.session.userId = user.id;
      ensureCsrf(req);

      try {
        if (lembrar) {
          await createRememberToken(res, user.id);
        }
        res.json({ user: publicUser(user), csrf: req.session.csrf });
      } catch (err) {
        next(err);
      }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/cadastro', async (req, res, next) => {
  try {
    const {
      nome = '',
      email = '',
      identificador = '',
      curso = '',
      senha = '',
      confirmar_senha: confirmarSenha = '',
      tipo = 'aluno',
    } = req.body || {};

    const erros = [];
    const tipoConta = tipo === 'professor' ? 'professor' : 'aluno';

    if (nome.trim().length < 3) erros.push('Informe seu nome completo.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) erros.push('Informe um e-mail válido.');
    if (!identificador.trim()) {
      erros.push(tipoConta === 'professor' ? 'Informe o registro funcional.' : 'Informe a matrícula.');
    }
    if (senha.length < 8) erros.push('A senha precisa ter no mínimo 8 caracteres.');
    if (senha !== confirmarSenha) erros.push('As senhas precisam ser iguais.');

    if (erros.length) {
      return res.status(400).json({ error: erros.join(' ') });
    }

    const emailExiste = await one('SELECT id FROM usuarios WHERE email = $1 LIMIT 1', [
      email.trim(),
    ]);
    if (emailExiste) {
      return res.status(409).json({ error: 'Já existe uma conta com este e-mail.' });
    }

    const matriculaExiste = await one('SELECT id FROM usuarios WHERE matricula = $1 LIMIT 1', [
      identificador.trim(),
    ]);
    if (matriculaExiste) {
      return res.status(409).json({ error: 'Já existe uma conta com esta matrícula/registro.' });
    }

    const hash = await bcrypt.hash(senha, 10);
    const result = await run(
      `INSERT INTO usuarios (nome, email, senha, tipo, matricula, setor)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [nome.trim(), email.trim(), hash, tipoConta, identificador.trim(), curso.trim() || null]
    );

    const user = await one('SELECT * FROM usuarios WHERE id = $1', [result.insertId]);

    req.session.regenerate(async (error) => {
      if (error) return next(error);
      req.session.userId = user.id;
      ensureCsrf(req);
      res.status(201).json({ user: publicUser(user), csrf: req.session.csrf });
    });
  } catch (error) {
    if (error.code === '23505') {
      return res
        .status(409)
        .json({ error: 'Já existe uma conta com este e-mail ou matrícula.' });
    }
    next(error);
  }
});

router.post('/logout', requireAuth, async (req, res, next) => {
  try {
    await clearRememberToken(req, res);
    req.session.destroy(() => {
      res.clearCookie('prosiga.sid', { path: '/' });
      res.json({ ok: true });
    });
  } catch (error) {
    next(error);
  }
});

export default router;
