'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import Flash from '@/components/Flash';
import PageHeader from '@/components/PageHeader';
import { api } from '@/lib/api';
import { formatarHora, partesData } from '@/lib/format';
import { podeGerenciar } from '@/lib/menu';

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [erro, setErro] = useState('');

  const carregar = useCallback(async () => {
    try {
      const resultado = await api.get('/api/dashboard');
      setData(resultado);
      setErro('');
    } catch (error) {
      setErro(error.message);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  if (!user) return null;

  const gerenciar = podeGerenciar(user);
  const firstName = String(user.nome || '').trim().split(' ')[0];
  const hoje = new Date().toLocaleDateString('pt-BR');

  const stats = data?.stats;
  const agenda = data?.agenda || [];
  const turmas = data?.turmas || [];

  return (
    <>
      <PageHeader
        title={`Olá, ${firstName}`}
        sub={
          gerenciar
            ? `Aqui está o resumo das turmas e da agenda acadêmica hoje, ${hoje}.`
            : 'Acompanhe as aulas, provas e atividades das suas turmas.'
        }
      />

      <Flash flash={erro ? { type: 'error', message: erro } : null} onClear={() => setErro('')} />

      {gerenciar ? (
        <div className="stat-grid">
          <div className="stat stat--dark">
            <span className="stat__label">Turmas</span>
            <span className="stat__value">{stats?.turmas ?? '—'}</span>
            <span className="stat__hint">cadastradas no sistema</span>
          </div>
          <div className="stat">
            <span className="stat__label">Alunos</span>
            <span className="stat__value">{stats?.alunos ?? '—'}</span>
            <span className="stat__hint">matriculados</span>
          </div>
          <div className="stat">
            <span className="stat__label">Professores</span>
            <span className="stat__value">{stats?.professores ?? '—'}</span>
            <span className="stat__hint">ativos na plataforma</span>
          </div>
          <div className="stat">
            <span className="stat__label">Aulas futuras</span>
            <span className="stat__value">{stats?.aulas ?? '—'}</span>
            <span className="stat__hint">já agendadas</span>
          </div>
        </div>
      ) : (
        <div className="stat-grid">
          <div className="stat stat--dark">
            <span className="stat__label">Minhas turmas</span>
            <span className="stat__value">{stats?.turmas ?? '—'}</span>
            <span className="stat__hint">vinculadas ao seu perfil</span>
          </div>
          <div className="stat">
            <span className="stat__label">Aulas</span>
            <span className="stat__value">{stats?.aulas ?? '—'}</span>
            <span className="stat__hint">agendadas</span>
          </div>
          <div className="stat">
            <span className="stat__label">Provas</span>
            <span className="stat__value">{stats?.provas ?? '—'}</span>
            <span className="stat__hint">a acontecer</span>
          </div>
          <div className="stat">
            <span className="stat__label">Atividades</span>
            <span className="stat__value">{stats?.atividades ?? '—'}</span>
            <span className="stat__hint">com entrega aberta</span>
          </div>
        </div>
      )}

      <div className="grid-2">
        <section className="card">
          <div className="card__head">
            <div>
              <h2 className="card__title">Próximos compromissos</h2>
              <p className="card__sub">Aulas, provas e atividades ordenadas por data.</p>
            </div>
          </div>

          {!agenda.length && data ? (
            <div className="table-empty">
              <img src="/assets/img/mascot-confused.svg" alt="" />
              <p className="mb-0">Nada agendado para os próximos dias.</p>
            </div>
          ) : (
            <ul className="timeline">
              {agenda.map((item, index) => {
                const partes = partesData(item.data);
                const rotulo =
                  item.tipo === 'aula' ? 'Aula' : item.tipo === 'prova' ? 'Prova' : 'Entrega';
                const css =
                  item.tipo === 'aula' ? 'aula' : item.tipo === 'prova' ? 'prova' : 'atividade';
                const badge =
                  item.tipo === 'prova'
                    ? 'badge--amber'
                    : item.tipo === 'atividade'
                      ? 'badge--green'
                      : '';
                return (
                  <li className={`timeline__item timeline--${css}`} key={`${item.tipo}-${index}`}>
                    <span className="timeline__date">
                      <strong>{partes.dia}</strong>
                      <small>{partes.mes}</small>
                    </span>
                    <div className="timeline__body">
                      <h4>{item.titulo}</h4>
                      <p>
                        {item.turma}
                        {item.hora ? <> · {formatarHora(item.hora)}</> : null}
                        {item.local ? <> · {item.local}</> : null}
                      </p>
                      <div className="timeline__tags">
                        <span className={`badge ${badge}`}>{rotulo}</span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="card">
          <div className="card__head">
            <div>
              <h2 className="card__title">{gerenciar ? 'Minhas turmas' : 'Turmas vinculadas'}</h2>
              <p className="card__sub">
                {turmas.length} turma(s) visível(is) para o seu perfil.
              </p>
            </div>
            <Link className="btn btn--ghost btn--sm" href="/dashboard/turmas">
              Ver todas
            </Link>
          </div>

          {!turmas.length && data ? (
            <div className="table-empty">
              <img src="/assets/img/mascot-confused.svg" alt="" />
              <p className="mb-0">
                {gerenciar
                  ? 'Crie sua primeira turma para começar.'
                  : 'Você ainda não está vinculado a nenhuma turma.'}
              </p>
              {gerenciar ? (
                <p>
                  <Link className="btn btn--primary btn--sm" href="/dashboard/turmas">
                    Criar turma
                  </Link>
                </p>
              ) : null}
            </div>
          ) : (
            <div className="table-wrap">
              <table className="data">
                <thead>
                  <tr>
                    <th>Turma</th>
                    <th>Disciplina</th>
                    <th>Semestre</th>
                    <th>Alunos</th>
                    <th>Prof.</th>
                  </tr>
                </thead>
                <tbody>
                  {turmas.map((turma) => (
                    <tr key={turma.id}>
                      <td>
                        <strong>{turma.nome}</strong>
                        <br />
                        <small className="muted">{turma.codigo}</small>
                      </td>
                      <td>{turma.disciplina}</td>
                      <td>
                        <span className="badge badge--muted">{turma.semestre}</span>
                      </td>
                      <td>{Number(turma.total_alunos)}</td>
                      <td>{Number(turma.total_professores)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
