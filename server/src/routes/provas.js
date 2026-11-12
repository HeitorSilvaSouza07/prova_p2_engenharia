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
    let sql = `SELECT p.*, t.nome AS turma_nome, t.codigo AS turma_codigo, u.nome AS professor_nome
                 FROM provas p
                 INNER JOIN turmas t ON t.id = p.turma_id
                 LEFT JOIN usuarios u ON u.id = p.professor_id
                WHERE p.turma_id = ANY($1)`;

    if (ids.includes(filtroTurma)) {
      params.push(filtroTurma);
      sql += ` AND p.turma_id = $${params.length}`;
    }
    if (busca) {
      params.push(`%${busca}%`, `%${busca}%`, `%${busca}%`);
      sql += ` AND (p.titulo LIKE $${params.length - 2}
                     OR t.nome LIKE $${params.length - 1}
                     OR p.local LIKE $${params.length})`;
    }
    sql += ' ORDER BY p.data_prova ASC, p.hora ASC';

    const itens = await query(sql, params);
    res.json({ turmas, itens });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    if (!podeGerenciar(req.user)) {
      return res.status(403).json({ error: 'Somente professores podem agendar provas.' });
    }

    const ids = (await turmasVisiveis(req.user)).map((turma) => Number(turma.id));
    const {
      turma_id: turmaId,
      titulo = '',
      data_prova: dataProva = '',
      hora = '',
      local = '',
      peso = 1,
      descricao = '',
      professor_id: professorId = 0,
    } = req.body || {};

    const erros = [];
    const pesoNum = Number(String(peso).replace(',', '.'));
    if (!titulo.trim()) erros.push('Informe o título da prova.');
    if (!dataProva) erros.push('Informe uma data válida.');
    if (!Number.isFinite(pesoNum) || pesoNum <= 0) {
      erros.push('O peso da prova deve ser maior que zero.');
    }
    if (!ids.includes(Number(turmaId))) erros.push('Selecione uma turma válida.');
    if (erros.length) return res.status(400).json({ error: erros.join(' ') });

    await run(
      `INSERT INTO provas (turma_id, professor_id, titulo, data_prova, hora, local, peso, descricao, criado_por)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        Number(turmaId),
        Number(professorId) > 0 ? Number(professorId) : null,
        titulo.trim(),
        dataProva,
        hora || null,
        local.trim() || null,
        pesoNum,
        descricao.trim() || null,
        req.user.id,
      ]
    );

    res.status(201).json({ message: `Prova agendada para ${formatarData(dataProva)}.` });
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
    const result = await run('DELETE FROM provas WHERE id = $1 AND turma_id = ANY($2)', [
      Number(req.params.id),
      ids.length ? ids : [0],
    ]);

    if (!result.rowCount) {
      return res.status(404).json({ error: 'Prova não encontrada.' });
    }
    res.json({ message: 'Prova removida.' });
  } catch (error) {
    next(error);
  }
});

export default router;
