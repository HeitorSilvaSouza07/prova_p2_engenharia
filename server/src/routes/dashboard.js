import { Router } from 'express';
import { query } from '../db.js';
import { podeGerenciar, turmasVisiveis } from '../helpers.js';

const router = Router();

function hoje() {
  const data = new Date();
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

router.get('/', async (req, res, next) => {
  try {
    const user = req.user;
    const gerenciar = podeGerenciar(user);
    const turmas = await turmasVisiveis(req.user);
    const ids = turmas.map((turma) => Number(turma.id));
    const placeholder = ids.length ? ids : [0];
    const dataHoje = hoje();

    let stats;
    if (gerenciar) {
      const [turmasRow, alunosRow, professoresRow] = await Promise.all([
        query('SELECT COUNT(*)::int AS total FROM turmas'),
        query(`SELECT COUNT(*)::int AS total FROM usuarios WHERE tipo = 'aluno' AND ativo = TRUE`),
        query(`SELECT COUNT(*)::int AS total FROM usuarios WHERE tipo = 'professor' AND ativo = TRUE`),
      ]);
      stats = {
        turmas: turmasRow[0].total,
        alunos: alunosRow[0].total,
        professores: professoresRow[0].total,
      };
    } else {
      const [alunosRow, professoresRow] = await Promise.all([
        query(
          'SELECT COUNT(DISTINCT aluno_id)::int AS total FROM turma_alunos WHERE turma_id = ANY($1)',
          [placeholder]
        ),
        query(
          'SELECT COUNT(DISTINCT professor_id)::int AS total FROM turma_professores WHERE turma_id = ANY($1)',
          [placeholder]
        ),
      ]);
      stats = {
        turmas: turmas.length,
        alunos: alunosRow[0].total,
        professores: professoresRow[0].total,
      };
    }

    const [aulasRow, provasRow, atividadesRow, aulasAgenda, provasAgenda, atividadesAgenda] =
      await Promise.all([
        query(
          'SELECT COUNT(*)::int AS total FROM aulas WHERE data_aula >= $1 AND turma_id = ANY($2)',
          [dataHoje, placeholder]
        ),
        query(
          'SELECT COUNT(*)::int AS total FROM provas WHERE data_prova >= $1 AND turma_id = ANY($2)',
          [dataHoje, placeholder]
        ),
        query(
          'SELECT COUNT(*)::int AS total FROM atividades WHERE data_entrega >= $1 AND turma_id = ANY($2)',
          [dataHoje, placeholder]
        ),
        query(
          `SELECT a.data_aula AS data, a.hora_inicio AS hora, a.titulo, a.local, t.nome AS turma, 'aula' AS tipo
             FROM aulas a INNER JOIN turmas t ON t.id = a.turma_id
            WHERE a.data_aula >= $1 AND a.turma_id = ANY($2)
            ORDER BY a.data_aula ASC, a.hora_inicio ASC LIMIT 8`,
          [dataHoje, placeholder]
        ),
        query(
          `SELECT p.data_prova AS data, p.hora, p.titulo, p.local, t.nome AS turma, 'prova' AS tipo
             FROM provas p INNER JOIN turmas t ON t.id = p.turma_id
            WHERE p.data_prova >= $1 AND p.turma_id = ANY($2)
            ORDER BY p.data_prova ASC, p.hora ASC LIMIT 8`,
          [dataHoje, placeholder]
        ),
        query(
          `SELECT at.data_entrega AS data, at.hora_entrega AS hora, at.titulo, NULL AS local,
                  t.nome AS turma, 'atividade' AS tipo
             FROM atividades at INNER JOIN turmas t ON t.id = at.turma_id
            WHERE at.data_entrega >= $1 AND at.turma_id = ANY($2)
            ORDER BY at.data_entrega ASC, at.hora_entrega ASC LIMIT 8`,
          [dataHoje, placeholder]
        ),
      ]);

    const agenda = [...aulasAgenda, ...provasAgenda, ...atividadesAgenda]
      .sort((a, b) => {
        const cmp = String(a.data).localeCompare(String(b.data));
        if (cmp !== 0) return cmp;
        return String(a.hora || '').localeCompare(String(b.hora || ''));
      })
      .slice(0, 8);

    res.json({
      gerenciar,
      stats: {
        ...stats,
        aulas: aulasRow[0].total,
        provas: provasRow[0].total,
        atividades: atividadesRow[0].total,
      },
      agenda,
      turmas,
      data_hoje: dataHoje,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
