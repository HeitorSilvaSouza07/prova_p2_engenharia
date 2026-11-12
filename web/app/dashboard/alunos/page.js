'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import DataTable from '@/components/DataTable';
import Flash from '@/components/Flash';
import PageHeader from '@/components/PageHeader';
import RequireRole from '@/components/RequireRole';
import { api } from '@/lib/api';

const FORM_INICIAL = { nome: '', email: '', matricula: '', curso: '', senha: '' };

function AlunosInterno() {
  const { user } = useAuth();
  const [alunos, setAlunos] = useState([]);
  const [form, setForm] = useState(FORM_INICIAL);
  const [flash, setFlash] = useState(null);
  const [salvando, setSalvando] = useState(false);

  const carregar = useCallback(async () => {
    try {
      const lista = await api.get('/api/usuarios?tipo=aluno');
      setAlunos(lista);
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

  async function criarAluno(event) {
    event.preventDefault();
    const erros = [];
    if (form.nome.trim().length < 3) erros.push('Informe o nome completo do aluno.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) erros.push('Informe um e-mail válido.');
    if (!form.matricula.trim()) erros.push('Informe a matrícula.');
    if (form.senha.length < 8) erros.push('A senha precisa ter no mínimo 8 caracteres.');
    if (erros.length) {
      setFlash({ type: 'error', message: erros.join(' ') });
      return;
    }

    setSalvando(true);
    try {
      const resultado = await api.post('/api/usuarios', {
        ...form,
        tipo: 'aluno',
        setor: form.curso,
      });
      setFlash({ type: 'success', message: resultado.message });
      setForm(FORM_INICIAL);
      await carregar();
    } catch (error) {
      setFlash({ type: 'error', message: error.message });
    } finally {
      setSalvando(false);
    }
  }

  async function alternarStatus(aluno) {
    const acao = aluno.ativo ? 'Desativar' : 'Reativar';
    if (!window.confirm(`${acao} o aluno ${aluno.nome}?`)) return;
    try {
      const resultado = await api.patch(`/api/usuarios/${aluno.id}/toggle`, {});
      setFlash({ type: 'success', message: resultado.message });
      await carregar();
    } catch (error) {
      setFlash({ type: 'error', message: error.message });
    }
  }

  const colunas = [
    {
      key: 'aluno',
      label: 'Aluno',
      render: (aluno) => (
        <>
          <strong>{aluno.nome}</strong>
          <br />
          <small className="muted">{aluno.email}</small>
        </>
      ),
    },
    { key: 'matricula', label: 'Matrícula', render: (aluno) => aluno.matricula || '—' },
    { key: 'curso', label: 'Curso', render: (aluno) => aluno.setor || '—' },
    {
      key: 'turmas',
      label: 'Turmas',
      render: (aluno) => <span className="badge">{Number(aluno.total_turmas)}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (aluno) =>
        aluno.ativo ? (
          <span className="badge badge--green">
            <span className="badge-dot" />
            Ativo
          </span>
        ) : (
          <span className="badge badge--red">
            <span className="badge-dot" />
            Inativo
          </span>
        ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Alunos"
        sub='Cadastre alunos diretamente no sistema e vincule-os às turmas em "Vínculos".'
        action={
          <button
            className="btn btn--primary"
            type="button"
            onClick={() =>
              document
                .getElementById('form-aluno')
                ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
          >
            <svg viewBox="0 0 24 24">
              <path d="M12 5v14M5 12h14" />
            </svg>{' '}
            Novo aluno
          </button>
        }
      />

      <Flash flash={flash} onClear={() => setFlash(null)} />

      <section className="card" id="form-aluno">
        <div className="card__head">
          <div>
            <h2 className="card__title">Cadastrar aluno</h2>
            <p className="card__sub">
              Depois do cadastro, use a área de <a href="/dashboard/vinculos">vínculos</a> para
              matriculá-lo nas turmas.
            </p>
          </div>
        </div>

        <form onSubmit={criarAluno}>
          <div className="form-grid">
            <label className="field">
              <span>Nome completo *</span>
              <input
                type="text"
                value={form.nome}
                onChange={setCampo('nome')}
                placeholder="ex: João Pedro Silva"
                required
              />
            </label>
            <label className="field">
              <span>E-mail *</span>
              <input
                type="email"
                value={form.email}
                onChange={setCampo('email')}
                placeholder="ex: aluno@prosiga.edu"
                required
              />
            </label>
            <label className="field">
              <span>Matrícula *</span>
              <input
                type="text"
                value={form.matricula}
                onChange={setCampo('matricula')}
                placeholder="ex: 20261002"
                required
              />
            </label>
            <label className="field">
              <span>Curso</span>
              <input
                type="text"
                value={form.curso}
                onChange={setCampo('curso')}
                placeholder="ex: Engenharia de Software"
              />
            </label>
            <label className="field">
              <span>Senha provisória *</span>
              <input
                type="password"
                value={form.senha}
                onChange={setCampo('senha')}
                minLength={8}
                placeholder="mínimo 8 caracteres"
                required
              />
            </label>
          </div>

          <div className="form-actions">
            <button className="btn btn--primary" type="submit" disabled={salvando}>
              <svg viewBox="0 0 24 24">
                <path d="M12 5v14M5 12h14" />
              </svg>{' '}
              {salvando ? 'Cadastrando...' : 'Cadastrar aluno'}
            </button>
            <button className="btn btn--ghost" type="button" onClick={() => setForm(FORM_INICIAL)}>
              Limpar
            </button>
          </div>
        </form>
      </section>

      <DataTable
        title="Alunos cadastrados"
        rows={alunos}
        columns={colunas}
        searchPlaceholder="Nome, e-mail ou matrícula..."
        groupOf={(aluno) => (aluno.ativo ? 'ativos' : 'inativos')}
        filterOptions={[
          { value: 'ativos', label: 'Ativos' },
          { value: 'inativos', label: 'Inativos' },
        ]}
        emptyText="Nenhum aluno cadastrado."
        actions={
          user.tipo === 'admin'
            ? (aluno) => (
                <button
                  className="btn btn--ghost btn--sm"
                  type="button"
                  onClick={() => alternarStatus(aluno)}
                >
                  {aluno.ativo ? 'Desativar' : 'Reativar'}
                </button>
              )
            : undefined
        }
      />
    </>
  );
}

export default function AlunosPage() {
  return (
    <RequireRole roles={['admin', 'professor']}>
      <AlunosInterno />
    </RequireRole>
  );
}
