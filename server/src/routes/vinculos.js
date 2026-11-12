import { Router } from 'express';
import { one, query, run, transaction } from '../db.js';
import { requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', requireRole(['admin', 'professor']), async (req, res, next) => {
  try {
    const turmaId = Number(req.query.turma || 0);

    const turmas = await query(
      `SELECT t.*,
              (SELECT COUNT(*) FROM turma_alunos ta WHERE ta.turma_id = t.id) AS total_alunos,
              (SELECT COUNT(*) FROM turma_professores tp WHERE tp.turma_id = t.id) AS total_professores
         FROM turmas t
        ORDER BY t.nome`
    );

    const professores = await query(
      `SELECT id, nome, email, matricula, setor FROM usuarios
        WHERE tipo = 'professor' AND ativo = TRUE ORDER BY nome`
    );

    const alunos = await query(
      `SELECT id, nome, email, matricula, setor FROM usuarios
        WHERE tipo = 'aluno' AND ativo = TRUE ORDER BY nome`
    );

    let vinculadosProfessores = [];
    let vinculadosAlunos = [];
    const turmaAtual = turmas.find((turma) => Number(turma.id) === turmaId) || null;

    if (turmaAtual) {
      vinculadosProfessores = (
        await query('SELECT professor_id FROM turma_professores WHERE turma_id = $1', [
          turmaAtual.id,
        ])
      ).map((row) => Number(row.professor_id));

      vinculadosAlunos = (
        await query('SELECT aluno_id FROM turma_alunos WHERE turma_id = $1', [turmaAtual.id])
      ).map((row) => Number(row.aluno_id));
    }

    res.json({
      turmas,
      professores,
      alunos,
      turma_atual: turmaAtual,
      vinculados: { professores: vinculadosProfessores, alunos: vinculadosAlunos },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/', requireRole(['admin', 'professor']), async (req, res, next) => {
  try {
    const { turma_id: turmaId, professores = [], alunos = [] } = req.body || {};
    const id = Number(turmaId);

    const turma = await one('SELECT id, capacidade FROM turmas WHERE id = $1', [id]);
    if (!turma) {
      return res.status(400).json({ error: 'Selecione uma turma válida.' });
    }

    const listaProfessores = [...new Set(professores.map(Number).filter(Boolean))];
    const listaAlunos = [...new Set(alunos.map(Number).filter(Boolean))];

    if (listaAlunos.length > Number(turma.capacidade)) {
      return res.status(400).json({
        error: `A quantidade de alunos selecionados excede a capacidade da turma (${turma.capacidade}).`,
      });
    }

    await transaction(async (client) => {
      await client.query('DELETE FROM turma_professores WHERE turma_id = $1', [id]);
      await client.query('DELETE FROM turma_alunos WHERE turma_id = $1', [id]);

      if (listaProfessores.length) {
        const { rows: validos } = await client.query(
          `SELECT id FROM usuarios WHERE tipo = 'professor' AND ativo = TRUE AND id = ANY($1)`,
          [listaProfessores]
        );
        for (const row of validos) {
          await client.query(
            'INSERT INTO turma_professores (turma_id, professor_id) VALUES ($1, $2)',
            [id, row.id]
          );
        }
      }

      if (listaAlunos.length) {
        const { rows: validos } = await client.query(
          `SELECT id FROM usuarios WHERE tipo = 'aluno' AND ativo = TRUE AND id = ANY($1)`,
          [listaAlunos]
        );
        for (const row of validos) {
          await client.query('INSERT INTO turma_alunos (turma_id, aluno_id) VALUES ($1, $2)', [
            id,
            row.id,
          ]);
        }
      }
    });

    res.json({
      message: `Vínculos atualizados: ${listaProfessores.length} professor(es) e ${listaAlunos.length} aluno(s).`,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
