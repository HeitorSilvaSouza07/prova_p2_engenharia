'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import DataTable from '@/components/DataTable';
import Flash from '@/components/Flash';
import PageHeader from '@/components/PageHeader';
import RequireRole from '@/components/RequireRole';
import { api } from '@/lib/api';

const FORM_INICIAL = { nome: '', email: '', matricula: '', setor: '', senha: '' };

function ProfessoresInterno() {
  const { user } = useAuth();
  const [professores, setProfessores] = useState([]);
  const [form, setForm] = useState(FORM_INICIAL);
  const [flash, setFlash] = useState(null);
  const [salvando, setSalvando] = useState(false);

  const carregar = useCallback(async () => {
    try {
      const lista = await api.get('/api/usuarios?tipo=professor');
      setProfessores(lista);
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

  async function criarProfessor(event) {
    event.preventDefault();
    const erros = [];
    if (form.nome.trim().length < 3) erros.push('Informe o nome completo do professor.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) erros.push('Informe um e-mail válido.');
    if (!form.matricula.trim()) erros.push('Informe o registro funcional.');
    if (form.senha.length < 8) erros.push('A senha precisa ter no mínimo 8 caracteres.');
    if (erros.length) {
      setFlash({ type: 'error', message: erros.join(' ') });
      return;
    }

    setSalvando(true);
    try {
      const resultado = await api.post('/api/usuarios', { ...form, tipo: 'professor' });
      setFlash({ type: 'success', message: resultado.message });
      setForm(FORM_INICIAL);
      await carregar();
    } catch (error) {
      setFlash({ type: 'error', message: error.message });
    } finally {
      setSalvando(false);
    }
  }

  async function alternarStatus(professor) {
    const acao = professor.ativo ? 'Desativar' : 'Reativar';
    if (!window.confirm(`${acao} o professor ${professor.nome}?`)) return;
    try {
      const resultado = await api.patch(`/api/usuarios/${professor.id}/toggle`, {});
      setFlash({ type: 'success', message: resultado.message });
      await carregar();
    } catch (error) {
      setFlash({ type: 'error', message: error.message });
    }
  }

  const colunas = [
    {
      key: 'professor',
      label: 'Professor',
      render: (professor) => (
        <>
          <strong>{professor.nome}</strong>
          <br />
          <small className="muted">{professor.email}</small>
        </>
      ),
    },
    { key: 'registro', label: 'Registro', render: (professor) => professor.matricula || '—' },
    { key: 'departamento', label: 'Departamento', render: (professor) => professor.setor || '—' },
    {
      key: 'turmas',
      label: 'Turmas',
      render: (professor) => <span className="badge">{Number(professor.total_turmas)}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (professor) =>
        professor.ativo ? (
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
        title="Professores"
        sub="Cadastre professores e acompanhe em quais turmas cada um está vinculado."
        action={
          <button
            className="btn btn--primary"
            type="button"
            onClick={() =>
              document
                .getElementById('form-professor')
                ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
          >
            <svg viewBox="0 0 24 24">
              <path d="M12 5v14M5 12h14" />
            </svg>{' '}
            Novo professor
          </button>
        }
      />

      <Flash flash={flash} onClear={() => setFlash(null)} />

      <section className="card" id="form-professor">
        <div className="card__head">
          <div>
            <h2 className="card__title">Cadastrar professor</h2>
            <p className="card__sub">
              O professor recebe um acesso próprio e já pode gerenciar as suas turmas.
            </p>
          </div>
        </div>

        <form onSubmit={criarProfessor}>
          <div className="form-grid">
            <label className="field">
              <span>Nome completo *</span>
              <input
                type="text"
                value={form.nome}
                onChange={setCampo('nome')}
                placeholder="ex: Ana Beatriz Costa"
                required
              />
            </label>
            <label className="field">
              <span>E-mail institucional *</span>
              <input
                type="email"
                value={form.email}
                onChange={setCampo('email')}
                placeholder="ex: professor@prosiga.edu"
                required
              />
            </label>
            <label className="field">
              <span>Registro funcional *</span>
              <input
                type="text"
                value={form.matricula}
                onChange={setCampo('matricula')}
                placeholder="ex: 4521"
                required
              />
            </label>
            <label className="field">
              <span>Departamento</span>
              <input
                type="text"
                value={form.setor}
                onChange={setCampo('setor')}
                placeholder="ex: Ciência da Computação"
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
              {salvando ? 'Cadastrando...' : 'Cadastrar professor'}
            </button>
            <button className="btn btn--ghost" type="button" onClick={() => setForm(FORM_INICIAL)}>
              Limpar
            </button>
          </div>
        </form>
      </section>

      <DataTable
        title="Professores cadastrados"
        rows={professores}
        columns={colunas}
        searchPlaceholder="Nome, e-mail ou registro..."
        groupOf={(professor) => (professor.ativo ? 'ativos' : 'inativos')}
        filterOptions={[
          { value: 'ativos', label: 'Ativos' },
          { value: 'inativos', label: 'Inativos' },
        ]}
        emptyText="Nenhum professor cadastrado."
        actions={
          user.tipo === 'admin'
            ? (professor) => (
                <button
                  className="btn btn--ghost btn--sm"
                  type="button"
                  onClick={() => alternarStatus(professor)}
                >
                  {professor.ativo ? 'Desativar' : 'Reativar'}
                </button>
              )
            : undefined
        }
      />
    </>
  );
}

export default function ProfessoresPage() {
  return (
    <RequireRole roles={['admin', 'professor']}>
      <ProfessoresInterno />
    </RequireRole>
  );
}
