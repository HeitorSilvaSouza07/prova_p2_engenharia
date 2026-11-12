'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import DataTable from '@/components/DataTable';
import Flash from '@/components/Flash';
import PageHeader from '@/components/PageHeader';
import { api } from '@/lib/api';
import { podeGerenciar } from '@/lib/menu';

const FORM_INICIAL = {
  nome: '',
  disciplina: '',
  codigo: '',
  semestre: `${new Date().getFullYear()}.1`,
  sala: '',
  capacidade: 40,
};

export default function TurmasPage() {
  const { user } = useAuth();
  const [turmas, setTurmas] = useState([]);
  const [form, setForm] = useState(FORM_INICIAL);
  const [flash, setFlash] = useState(null);
  const [salvando, setSalvando] = useState(false);

  const gerenciar = podeGerenciar(user);

  const carregar = useCallback(async () => {
    try {
      const lista = await api.get('/api/turmas');
      setTurmas(lista);
    } catch (error) {
      setFlash({ type: 'error', message: error.message });
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  function setCampo(campo) {
    return (event) => setForm((atual) => ({ ...atual, [campo]: event.target.value }));
  }

  async function criarTurma(event) {
    event.preventDefault();
    if (!form.nome.trim() || !form.disciplina.trim() || !form.codigo.trim()) {
      setFlash({ type: 'error', message: 'Preencha nome, disciplina e código da turma.' });
      return;
    }

    setSalvando(true);
    try {
      const resultado = await api.post('/api/turmas', form);
      setFlash({ type: 'success', message: resultado.message });
      setForm(FORM_INICIAL);
      await carregar();
    } catch (error) {
      setFlash({ type: 'error', message: error.message });
    } finally {
      setSalvando(false);
    }
  }

  async function excluirTurma(turma) {
    if (!window.confirm(`Excluir a turma ${turma.nome}? Todos os vínculos e agendamentos serão removidos.`)) {
      return;
    }
    try {
      const resultado = await api.del(`/api/turmas/${turma.id}`);
      setFlash({ type: 'success', message: resultado.message });
      await carregar();
    } catch (error) {
      setFlash({ type: 'error', message: error.message });
    }
  }

  const colunas = [
    {
      key: 'turma',
      label: 'Turma',
      render: (turma) => (
        <>
          <strong>{turma.nome}</strong>
          <br />
          <small className="muted">{turma.codigo}</small>
        </>
      ),
    },
    { key: 'disciplina', label: 'Disciplina' },
    {
      key: 'semestre',
      label: 'Semestre',
      render: (turma) => <span className="badge badge--muted">{turma.semestre}</span>,
    },
    { key: 'sala', label: 'Sala', render: (turma) => turma.sala || '—' },
    {
      key: 'alunos',
      label: 'Alunos',
      render: (turma) => (
        <span className="badge">
          {Number(turma.total_alunos)} / {Number(turma.capacidade)}
        </span>
      ),
    },
    {
      key: 'professores',
      label: 'Professores',
      render: (turma) => (
        <span className="badge badge--green">{Number(turma.total_professores)}</span>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Turmas"
        sub={
          gerenciar
            ? 'Crie turmas, acompanhe o quantitativo de alunos e professores vinculados.'
            : 'Relação de turmas às quais você está vinculado.'
        }
        action={
          gerenciar ? (
            <button
              className="btn btn--primary"
              type="button"
              onClick={() => document.getElementById('form-turma')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            >
              <svg viewBox="0 0 24 24">
                <path d="M12 5v14M5 12h14" />
              </svg>{' '}
              Nova turma
            </button>
          ) : null
        }
      />

      <Flash flash={flash} onClear={() => setFlash(null)} />

      {gerenciar ? (
        <section className="card" id="form-turma">
          <div className="card__head">
            <div>
              <h2 className="card__title">Criar turma</h2>
              <p className="card__sub">
                O código é usado para identificar rapidamente a turma em todo o sistema.
              </p>
            </div>
          </div>

          <form onSubmit={criarTurma}>
            <div className="form-grid">
              <label className="field">
                <span>Nome da turma *</span>
                <input
                  type="text"
                  value={form.nome}
                  onChange={setCampo('nome')}
                  placeholder="ex: 3º Ano A"
                  required
                />
              </label>

              <label className="field">
                <span>Disciplina *</span>
                <input
                  type="text"
                  value={form.disciplina}
                  onChange={setCampo('disciplina')}
                  placeholder="ex: Matemática"
                  required
                />
              </label>

              <label className="field">
                <span>Código *</span>
                <input
                  type="text"
                  value={form.codigo}
                  onChange={setCampo('codigo')}
                  placeholder="ex: MAT-3A-01"
                  required
                />
              </label>

              <label className="field">
                <span>Semestre</span>
                <input
                  type="text"
                  value={form.semestre}
                  onChange={setCampo('semestre')}
                  placeholder="ex: 2026.1"
                />
              </label>

              <label className="field">
                <span>Sala</span>
                <input
                  type="text"
                  value={form.sala}
                  onChange={setCampo('sala')}
                  placeholder="ex: Bloco B - 12"
                />
              </label>

              <label className="field">
                <span>Capacidade</span>
                <input
                  type="number"
                  min="1"
                  max="200"
                  value={form.capacidade}
                  onChange={setCampo('capacidade')}
                />
              </label>
            </div>

            <div className="form-actions">
              <button className="btn btn--primary" type="submit" disabled={salvando}>
                <svg viewBox="0 0 24 24">
                  <path d="M12 5v14M5 12h14" />
                </svg>{' '}
                {salvando ? 'Criando...' : 'Criar turma'}
              </button>
              <button
                className="btn btn--ghost"
                type="button"
                onClick={() => setForm(FORM_INICIAL)}
              >
                Limpar
              </button>
            </div>
          </form>
        </section>
      ) : null}

      <DataTable
        title={gerenciar ? 'Turmas cadastradas' : 'Minhas turmas'}
        rows={turmas}
        columns={colunas}
        searchPlaceholder="Nome, disciplina ou código..."
        emptyText="Nenhuma turma encontrada."
        actions={
          gerenciar
            ? (turma) => (
                <>
                  <Link
                    className="btn btn--ghost btn--sm"
                    href={`/dashboard/vinculos?turma=${turma.id}`}
                  >
                    Vincular
                  </Link>
                  {user.tipo === 'admin' || Number(turma.criado_por) === Number(user.id) ? (
                    <button
                      className="btn btn--danger btn--sm"
                      type="button"
                      onClick={() => excluirTurma(turma)}
                    >
                      Excluir
                    </button>
                  ) : null}
                </>
              )
            : undefined
        }
      />
    </>
  );
}
