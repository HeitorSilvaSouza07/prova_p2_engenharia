import { query } from './db.js';

export function podeGerenciar(user) {
  return user && ['admin', 'professor'].includes(user.tipo);
}

export function tipoLabel(tipo) {
  return { admin: 'Administrador', professor: 'Professor', aluno: 'Aluno' }[tipo] || tipo;
}

export function publicUser(user) {
  if (!user) return null;
  const { senha, token, ...safe } = user;
  return { ...safe, tipo_label: tipoLabel(user.tipo) };
}

export async function turmasVisiveis(user) {
  if (user.tipo === 'aluno') {
    return query(
      `SELECT t.*,
              (SELECT COUNT(*) FROM turma_alunos ta WHERE ta.turma_id = t.id) AS total_alunos,
              (SELECT COUNT(*) FROM turma_professores tp WHERE tp.turma_id = t.id) AS total_professores
         FROM turmas t
         INNER JOIN turma_alunos ta ON ta.turma_id = t.id
        WHERE ta.aluno_id = $1
        ORDER BY t.nome`,
      [user.id]
    );
  }

  return query(
    `SELECT t.*,
            (SELECT COUNT(*) FROM turma_alunos ta WHERE ta.turma_id = t.id) AS total_alunos,
            (SELECT COUNT(*) FROM turma_professores tp WHERE tp.turma_id = t.id) AS total_professores
       FROM turmas t
      ORDER BY t.nome`
  );
}

export async function turmaIdsDoUsuario(user) {
  const turmas = await turmasVisiveis(user);
  return { turmas, ids: turmas.map((turma) => Number(turma.id)) };
}

export function formatarData(data) {
  if (!data) return '';
  const [ano, mes, dia] = String(data).slice(0, 10).split('-');
  return `${dia}/${mes}/${ano}`;
}

export function formatarHora(hora) {
  if (!hora) return '';
  return String(hora).slice(0, 5);
}

export function formatarPeso(valor) {
  const numero = Number(valor);
  return Number.isInteger(numero)
    ? String(numero)
    : numero.toFixed(2).replace('.', ',');
}
