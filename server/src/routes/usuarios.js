import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { one, query, run } from '../db.js';
import { requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', requireRole(['admin', 'professor']), async (req, res, next) => {
  try {
    const tipo = req.query.tipo === 'professor' ? 'professor' : 'aluno';
    const rows = await query(
      `SELECT u.id, u.nome, u.email, u.matricula, u.setor, u.tipo, u.ativo, u.criado_em,
              (SELECT COUNT(*) FROM turma_alunos ta WHERE ta.aluno_id = u.id)        AS total_turmas_aluno,
              (SELECT COUNT(*) FROM turma_professores tp WHERE tp.professor_id = u.id) AS total_turmas_professor
         FROM usuarios u
        WHERE u.tipo = $1
        ORDER BY u.ativo DESC, u.nome ASC`,
      [tipo]
    );

    res.json(
      rows.map((row) => ({
        ...row,
        total_turmas: tipo === 'aluno' ? row.total_turmas_aluno : row.total_turmas_professor,
      }))
    );
  } catch (error) {
    next(error);
  }
});

router.post('/', requireRole(['admin', 'professor']), async (req, res, next) => {
  try {
    const { tipo = 'aluno', nome = '', email = '', matricula = '', setor = '', senha = '' } =
      req.body || {};
    const tipoConta = tipo === 'professor' ? 'professor' : 'aluno';
    const rotulo = tipoConta === 'professor' ? 'professor' : 'aluno';

    const erros = [];
    if (nome.trim().length < 3) erros.push(`Informe o nome completo do ${rotulo}.`);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) erros.push('Informe um e-mail válido.');
    if (!matricula.trim()) {
      erros.push(tipoConta === 'professor' ? 'Informe o registro funcional.' : 'Informe a matrícula.');
    }
    if (senha.length < 8) erros.push('A senha precisa ter no mínimo 8 caracteres.');
    if (erros.length) return res.status(400).json({ error: erros.join(' ') });

    const existente = await one(
      'SELECT id FROM usuarios WHERE email = $1 OR matricula = $2 LIMIT 1',
      [email.trim(), matricula.trim()]
    );
    if (existente) {
      return res.status(409).json({
        error:
          tipoConta === 'professor'
            ? 'Já existe um usuário com este e-mail ou registro.'
            : 'Já existe um usuário com este e-mail ou matrícula.',
      });
    }

    const hash = await bcrypt.hash(senha, 10);
    await run(
      `INSERT INTO usuarios (nome, email, senha, tipo, matricula, setor)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [nome.trim(), email.trim(), hash, tipoConta, matricula.trim(), setor.trim() || null]
    );

    const rotuloCapitalizado = rotulo[0].toUpperCase() + rotulo.slice(1);
    res.status(201).json({
      message: `${rotuloCapitalizado} "${nome.trim()}" cadastrado com sucesso.`,
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Já existe um usuário com este e-mail ou matrícula.' });
    }
    next(error);
  }
});

router.patch('/:id/toggle', requireRole(['admin']), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (id === Number(req.user.id)) {
      return res.status(400).json({ error: 'Você não pode desativar o próprio usuário.' });
    }

    const result = await run(
      `UPDATE usuarios SET ativo = NOT ativo
        WHERE id = $1 AND tipo IN ('aluno', 'professor') AND id <> $2`,
      [id, req.user.id]
    );

    if (!result.rowCount) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    res.json({ message: 'Status do usuário atualizado.' });
  } catch (error) {
    next(error);
  }
});

export default router;
