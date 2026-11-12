import { Router } from 'express';
import { one, run } from '../db.js';
import { podeGerenciar, turmasVisiveis } from '../helpers.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const turmas = await turmasVisiveis(req.user);
    res.json(turmas);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    if (!podeGerenciar(req.user)) {
      return res.status(403).json({ error: 'Você não tem permissão para criar turmas.' });
    }

    const {
      nome = '',
      disciplina = '',
      codigo = '',
      semestre = '',
      sala = '',
      capacidade = 40,
    } = req.body || {};

    if (!nome.trim() || !disciplina.trim() || !codigo.trim()) {
      return res.status(400).json({ error: 'Preencha nome, disciplina e código da turma.' });
    }

    const capacidadeNum = Number(capacidade) > 0 ? Number(capacidade) : 40;

    await run(
      `INSERT INTO turmas (nome, disciplina, codigo, semestre, sala, capacidade, criado_por)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        nome.trim(),
        disciplina.trim(),
        codigo.trim().toUpperCase(),
        semestre.trim() || `${new Date().getFullYear()}.1`,
        sala.trim() || null,
        capacidadeNum,
        req.user.id,
      ]
    );

    res.status(201).json({ message: `Turma "${nome.trim()}" criada com sucesso.` });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Já existe uma turma com este código.' });
    }
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    if (!podeGerenciar(req.user)) {
      return res.status(403).json({ error: 'Operação não permitida.' });
    }

    const turma = await one('SELECT * FROM turmas WHERE id = $1', [Number(req.params.id)]);
    if (!turma) {
      return res.status(404).json({ error: 'Turma não encontrada.' });
    }

    if (req.user.tipo !== 'admin' && Number(turma.criado_por) !== Number(req.user.id)) {
      return res
        .status(403)
        .json({ error: 'Somente o administrador ou o criador da turma pode excluí-la.' });
    }

    await run('DELETE FROM turmas WHERE id = $1', [turma.id]);
    res.json({ message: 'Turma excluída com sucesso.' });
  } catch (error) {
    next(error);
  }
});

export default router;
