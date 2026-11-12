'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import Flash from '@/components/Flash';
import PageHeader from '@/components/PageHeader';
import RequireRole from '@/components/RequireRole';
import { api } from '@/lib/api';

function VinculosInterno() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const turmaParam = Number(searchParams.get('turma') || 0);

  const [dados, setDados] = useState(null);
  const [professoresSel, setProfessoresSel] = useState([]);
  const [alunosSel, setAlunosSel] = useState([]);
  const [flash, setFlash] = useState(null);
  const [salvando, setSalvando] = useState(false);

  const carregar = useCallback(async () => {
    try {
      const resultado = await api.get(`/api/vinculos?turma=${turmaParam || ''}`);
      setDados(resultado);
      setProfessoresSel(resultado.vinculados.professores);
      setAlunosSel(resultado.vinculados.alunos);
      setFlash(null);
    } catch (error) {
      setFlash({ type: 'error', message: error.message });
    }
  }, [turmaParam]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  function alternar(lista, setLista, id) {
    setLista((atual) =>
      atual.includes(id) ? atual.filter((item) => item !== id) : [...atual, id]
    );
  }

  async function salvar(event) {
    event.preventDefault();
    if (!dados?.turma_atual) return;

    setSalvando(true);
    try {
      const resultado = await api.post('/api/vinculos', {
        turma_id: dados.turma_atual.id,
        professores: professoresSel,
        alunos: alunosSel,
      });
      setFlash({ type: 'success', message: resultado.message });
      await carregar();
    } catch (error) {
      setFlash({ type: 'error', message: error.message });
    } finally {
      setSalvando(false);
    }
  }

  const turmaAtual = dados?.turma_atual || null;

  return (
    <>
      <PageHeader
        title="Vínculos"
        sub="Associe professores e alunos às turmas. Desmarque para remover um vínculo."
      />

      <Flash flash={flash} onClear={() => setFlash(null)} />

      <section className="card">
        <div className="card__head">
          <div>
            <h2 className="card__title">Selecionar turma</h2>
            <p className="card__sub">
              Escolha a turma para gerenciar os vínculos de professores e alunos.
            </p>
          </div>
        </div>

        <div className="toolbar">
          <label className="field">
            <span>Turma</span>
            <select
              value={turmaParam || ''}
              onChange={(event) => {
                const valor = event.target.value;
                router.push(`/dashboard/vinculos${valor ? `?turma=${valor}` : ''}`);
              }}
            >
              <option value="">— Selecione —</option>
              {(dados?.turmas || []).map((turma) => (
                <option key={turma.id} value={turma.id}>
                  {`${turma.nome} — ${turma.disciplina} (${turma.codigo})`}
                </option>
              ))}
            </select>
          </label>
          <div className="toolbar__spacer" />
          <button className="btn btn--ghost" type="button" onClick={() => carregar()}>
            Abrir turma
          </button>
        </div>

        {dados && !dados.turmas.length ? (
          <div className="hint">
            Nenhuma turma cadastrada ainda.{' '}
            <Link href="/dashboard/turmas">Crie a primeira turma</Link> para começar a vincular.
          </div>
        ) : null}
      </section>

      {turmaAtual ? (
        <>
          <div className="hint">
            <strong>{turmaAtual.nome}</strong> · {turmaAtual.disciplina} · semestre{' '}
            {turmaAtual.semestre} · {professoresSel.length} professor(es) e {alunosSel.length}{' '}
            aluno(s) vinculado(s) · capacidade {Number(turmaAtual.capacidade)} ·{' '}
            {turmaAtual.sala || 'sem sala definida'}
          </div>

          <form onSubmit={salvar}>
            <div className="link-grid">
              <section className="card mb-0">
                <div className="card__head">
                  <div>
                    <h2 className="card__title">Professores</h2>
                    <p className="card__sub">Marque os professores desta turma.</p>
                  </div>
                  <span className="badge badge--green">{professoresSel.length} vinculado(s)</span>
                </div>

                <div className="check-list">
                  {!(dados.professores || []).length ? (
                    <p className="muted text-small">
                      Nenhum professor ativo.{' '}
                      <Link href="/dashboard/professores">Cadastre um professor</Link>.
                    </p>
                  ) : null}
                  {(dados.professores || []).map((prof) => {
                    const checked = professoresSel.includes(prof.id);
                    return (
                      <label
                        className={`check-item${checked ? ' check-item--linked' : ''}`}
                        key={prof.id}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => alternar(professoresSel, setProfessoresSel, prof.id)}
                        />
                        <span className="check-item__meta">
                          <strong>{prof.nome}</strong>
                          <small>{prof.setor || prof.email}</small>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </section>

              <section className="card mb-0">
                <div className="card__head">
                  <div>
                    <h2 className="card__title">Alunos</h2>
                    <p className="card__sub">Marque os alunos desta turma.</p>
                  </div>
                  <span className="badge badge--green">{alunosSel.length} vinculado(s)</span>
                </div>

                <div className="check-list">
                  {!(dados.alunos || []).length ? (
                    <p className="muted text-small">
                      Nenhum aluno ativo. Use o{' '}
                      <Link href="/dashboard/alunos">cadastro de alunos</Link>.
                    </p>
                  ) : null}
                  {(dados.alunos || []).map((aluno) => {
                    const checked = alunosSel.includes(aluno.id);
                    return (
                      <label
                        className={`check-item${checked ? ' check-item--linked' : ''}`}
                        key={aluno.id}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => alternar(alunosSel, setAlunosSel, aluno.id)}
                        />
                        <span className="check-item__meta">
                          <strong>{aluno.nome}</strong>
                          <small>{aluno.matricula || aluno.email}</small>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </section>
            </div>

            <div className="form-actions">
              <button className="btn btn--primary" type="submit" disabled={salvando}>
                <svg viewBox="0 0 24 24">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>{' '}
                {salvando ? 'Salvando...' : 'Salvar vínculos'}
              </button>
              <Link className="btn btn--ghost" href="/dashboard/vinculos">
                Limpar seleção
              </Link>
            </div>
          </form>
        </>
      ) : null}
    </>
  );
}

export default function VinculosPage() {
  return (
    <RequireRole roles={['admin', 'professor']}>
      <Suspense fallback={null}>
        <VinculosInterno />
      </Suspense>
    </RequireRole>
  );
}
