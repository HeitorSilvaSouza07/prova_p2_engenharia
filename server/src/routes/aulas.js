import { Router } from 'express';
import { query, run } from '../db.js';
import { formatarData, podeGerenciar, turmasVisiveis } from '../helpers.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const turmas = await turmasVisiveis(req.user);
    const ids = turmas.map((turma) => Number(turma.id));
    const filtroTurma = Number(req.query.turma || 0);
    const busca = String(req.query.q || '').trim();

    if (!ids.length) {
      return res.json({ turmas, itens: [] });
    }

    const params = [ids];
    let sql = `SELECT a.*, t.nome AS turma_nome, t.codigo AS turma_codigo, u.nome AS professor_nome
                 FROM aulas a
                 INNER JOIN turmas t ON t.id = a.turma_id
                 LEFT JOIN usuarios u ON u.id = a.professor_id
                WHERE a.turma_id = ANY($1)`;

    if (ids.includes(filtroTurma)) {
      params.push(filtroTurma);
      sql += ` AND a.turma_id = $${params.length}`;
    }
    if (busca) {
      params.push(`%${busca}%`, `%${busca}%`, `%${busca}%`);
      sql += ` AND (a.titulo LIKE $${params.length - 2}
                     OR t.nome LIKE $${params.length - 1}
                     OR a.local LIKE $${params.length})`;
    }
    sql += ' ORDER BY a.data_aula ASC, a.hora_inicio ASC';

    const itens = await query(sql, params);
    res.json({ turmas, itens });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    if (!podeGerenciar(req.user)) {
      return res.status(403).json({ error: 'Somente professores podem agendar aulas.' });
    }

    const ids = (await turmasVisiveis(req.user)).map((turma) => Number(turma.id));
    const {
      turma_id: turmaId,
      titulo = '',
      data_aula: dataAula = '',
      hora_inicio: horaInicio = '',
      hora_fim: horaFim = '',
      local = '',
      descricao = '',
      professor_id: professorId = 0,
    } = req.body || {};

    const erros = [];
    if (!titulo.trim()) erros.push('Informe o título da aula.');
    if (!dataAula) erros.push('Informe uma data válida.');
    if (!horaInicio || !horaFim) erros.push('Informe o horário de início e término.');
    else if (horaFim <= horaInicio) erros.push('O horário final deve ser depois do inicial.');
    if (!ids.includes(Number(turmaId))) erros.push('Selecione uma turma válida.');
    if (erros.length) return res.status(400).json({ error: erros.join(' ') });

    await run(
      `INSERT INTO aulas (turma_id, professor_id, titulo, data_aula, hora_inicio, hora_fim, local, descricao, criado_por)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        Number(turmaId),
        Number(professorId) > 0 ? Number(professorId) : null,
        titulo.trim(),
        dataAula,
        horaInicio,
        horaFim,
        local.trim() || null,
        descricao.trim() || null,
        req.user.id,
      ]
    );

    res.status(201).json({ message: `Aula agendada para ${formatarData(dataAula)}.` });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    if (!podeGerenciar(req.user)) {
      return res.status(403).json({ error: 'Operação não permitida.' });
    }

    const ids = (await turmasVisiveis(req.user)).map((turma) => Number(turma.id));
    const result = await run(
      'DELETE FROM aulas WHERE id = $1 AND turma_id = ANY($2)',
      [Number(req.params.id), ids.length ? ids : [0]]
    );

    if (!result.rowCount) {
      return res.status(404).json({ error: 'Aula não encontrada.' });
    }
    res.json({ message: 'Aula removida.' });
  } catch (error) {
    next(error);
  }
});

export default router;
