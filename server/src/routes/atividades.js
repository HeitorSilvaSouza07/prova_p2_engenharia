import { Router } from 'express';
import { query, run } from '../db.js';
import { formatarData, podeGerenciar, turmasVisiveis } from '../helpers.js';

const router = Router();

const TIPOS = ['tarefa', 'trabalho', 'exercicio', 'projeto', 'outro'];

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
                 FROM atividades a
                 INNER JOIN turmas t ON t.id = a.turma_id
                 LEFT JOIN usuarios u ON u.id = a.professor_id
                WHERE a.turma_id = ANY($1)`;

    if (ids.includes(filtroTurma)) {
      params.push(filtroTurma);
      sql += ` AND a.turma_id = $${params.length}`;
    }
    if (busca) {
      params.push(`%${busca}%`, `%${busca}%`);
      sql += ` AND (a.titulo LIKE $${params.length - 1} OR t.nome LIKE $${params.length})`;
    }
    sql += ' ORDER BY a.data_entrega ASC, a.hora_entrega ASC';

    const itens = await query(sql, params);
    res.json({ turmas, itens });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    if (!podeGerenciar(req.user)) {
      return res.status(403).json({ error: 'Somente professores podem cadastrar atividades.' });
    }

    const ids = (await turmasVisiveis(req.user)).map((turma) => Number(turma.id));
    const {
      turma_id: turmaId,
      titulo = '',
      tipo = 'tarefa',
      data_entrega: dataEntrega = '',
      hora_entrega: horaEntrega = '',
      valor = 10,
      descricao = '',
      professor_id: professorId = 0,
    } = req.body || {};

    const erros = [];
    const valorNum = Number(String(valor).replace(',', '.'));
    const tipoAtividade = TIPOS.includes(tipo) ? tipo : 'tarefa';
    if (!titulo.trim()) erros.push('Informe o título da atividade.');
    if (!dataEntrega) erros.push('Informe uma data de entrega válida.');
    if (!Number.isFinite(valorNum)) erros.push('Informe um valor numérico para a atividade.');
    if (!ids.includes(Number(turmaId))) erros.push('Selecione uma turma válida.');
    if (erros.length) return res.status(400).json({ error: erros.join(' ') });

    await run(
      `INSERT INTO atividades (turma_id, professor_id, titulo, tipo, data_entrega, hora_entrega, valor, descricao, criado_por)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        Number(turmaId),
        Number(professorId) > 0 ? Number(professorId) : null,
        titulo.trim(),
        tipoAtividade,
        dataEntrega,
        horaEntrega || null,
        valorNum,
        descricao.trim() || null,
        req.user.id,
      ]
    );

    res.status(201).json({
      message: `Atividade cadastrada com entrega em ${formatarData(dataEntrega)}.`,
    });
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
    const result = await run('DELETE FROM atividades WHERE id = $1 AND turma_id = ANY($2)', [
      Number(req.params.id),
      ids.length ? ids : [0],
    ]);

    if (!result.rowCount) {
      return res.status(404).json({ error: 'Atividade não encontrada.' });
    }
    res.json({ message: 'Atividade removida.' });
  } catch (error) {
    next(error);
  }
});

export default router;
