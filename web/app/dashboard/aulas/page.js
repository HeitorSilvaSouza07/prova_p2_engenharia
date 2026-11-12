'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import DataTable from '@/components/DataTable';
import Flash from '@/components/Flash';
import PageHeader from '@/components/PageHeader';
import { api } from '@/lib/api';
import { diaSemana, formatarData, formatarHora, truncar } from '@/lib/format';
import { podeGerenciar } from '@/lib/menu';

const FORM_INICIAL = {
  turma_id: '',
  titulo: '',
  data_aula: new Date().toISOString().slice(0, 10),
  hora_inicio: '08:00',
  hora_fim: '09:00',
  local: '',
  professor_id: '',
  descricao: '',
};

export default function AulasPage() {
  const { user } = useAuth();
  const [dados, setDados] = useState({ turmas: [], itens: [] });
  const [professores, setProfessores] = useState([]);
  const [form, setForm] = useState(FORM_INICIAL);
  const [flash, setFlash] = useState(null);
  const [salvando, setSalvando] = useState(false);

  const gerenciar = podeGerenciar(user);

  const carregar = useCallback(async () => {
    try {
      const resultado = await api.get('/api/aulas');
      setDados(resultado);
      if (podeGerenciar(user)) {
        try {
          const lista = await api.get('/api/usuarios?tipo=professor');
          setProfessores(lista.filter((prof) => prof.ativo));
        } catch {
          // lista de professores é opcional
        }
      }
    } catch (error) {
      setFlash({ type: 'error', message: error.message });
    }
  }, [user]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  function setCampo(campo) {
    return (event) => setForm((atual) => ({ ...atual, [campo]: event.target.value }));
  }

  async function criarAula(event) {
    event.preventDefault();
    const erros = [];
    if (!form.turma_id) erros.push('Selecione uma turma válida.');
    if (!form.titulo.trim()) erros.push('Informe o título da aula.');
    if (!form.data_aula) erros.push('Informe uma data válida.');
    if (!form.hora_inicio || !form.hora_fim) erros.push('Informe o horário de início e término.');
    else if (form.hora_fim <= form.hora_inicio) {
      erros.push('O horário final deve ser depois do inicial.');
    }
    if (erros.length) {
      setFlash({ type: 'error', message: erros.join(' ') });
      return;
    }

    setSalvando(true);
    try {
      const resultado = await api.post('/api/aulas', form);
      setFlash({ type: 'success', message: resultado.message });
      setForm({ ...FORM_INICIAL, data_aula: FORM_INICIAL.data_aula });
      await carregar();
    } catch (error) {
      setFlash({ type: 'error', message: error.message });
    } finally {
      setSalvando(false);
    }
  }

  async function excluirAula(aula) {
    if (!window.confirm(`Remover a aula ${aula.titulo}?`)) return;
    try {
      const resultado = await api.del(`/api/aulas/${aula.id}`);
      setFlash({ type: 'success', message: resultado.message });
      await carregar();
    } catch (error) {
      setFlash({ type: 'error', message: error.message });
    }
  }

  const colunas = [
    {
      key: 'data',
      label: 'Data',
      render: (aula) => (
        <>
          <strong>{formatarData(aula.data_aula)}</strong>
          <br />
          <small className="muted">{diaSemana(aula.data_aula)}</small>
        </>
      ),
    },
    {
      key: 'aula',
      label: 'Aula',
      render: (aula) => (
        <>
          <strong>{aula.titulo}</strong>
          {aula.descricao ? (
            <>
              <br />
              <small className="muted">{truncar(aula.descricao)}</small>
            </>
          ) : null}
        </>
      ),
    },
    {
      key: 'turma',
      label: 'Turma',
      render: (aula) => (
        <>
          {aula.turma_nome}
          <br />
          <small className="muted">{aula.turma_codigo}</small>
        </>
      ),
    },
    {
      key: 'horario',
      label: 'Horário',
      render: (aula) => (
        <span className="badge">{`${formatarHora(aula.hora_inicio)} – ${formatarHora(aula.hora_fim)}`}</span>
      ),
    },
    { key: 'local', label: 'Local', render: (aula) => aula.local || '—' },
    { key: 'professor', label: 'Professor', render: (aula) => aula.professor_nome || '—' },
  ];

  return (
    <>
      <PageHeader
        title="Aulas"
        sub={
          gerenciar
            ? 'Agende as aulas das turmas: data, horário, local e conteúdo.'
            : 'Confira as aulas agendadas das suas turmas.'
        }
        action={
          gerenciar ? (
            <button
              className="btn btn--primary"
              type="button"
              onClick={() =>
                document
                  .getElementById('form-aula')
                  ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }
            >
              <svg viewBox="0 0 24 24">
                <path d="M12 5v14M5 12h14" />
              </svg>{' '}
              Agendar aula
            </button>
          ) : null
        }
      />

      <Flash flash={flash} onClear={() => setFlash(null)} />

      {gerenciar ? (
        <section className="card" id="form-aula">
          <div className="card__head">
            <div>
              <h2 className="card__title">Agendar aula</h2>
              <p className="card__sub">
                A aula aparece automaticamente na agenda da turma e dos alunos vinculados.
              </p>
            </div>
          </div>

          <form onSubmit={criarAula}>
            <div className="form-grid">
              <label className="field">
                <span>Turma *</span>
                <select value={form.turma_id} onChange={setCampo('turma_id')} required>
                  <option value="">— Selecione —</option>
                  {(dados.turmas || []).map((turma) => (
                    <option key={turma.id} value={turma.id}>
                      {`${turma.nome} — ${turma.disciplina}`}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>Título da aula *</span>
                <input
                  type="text"
                  value={form.titulo}
                  onChange={setCampo('titulo')}
                  placeholder="ex: Funções do 2º grau"
                  required
                />
              </label>

              <label className="field">
                <span>Data *</span>
                <input type="date" value={form.data_aula} onChange={setCampo('data_aula')} required />
              </label>

              <label className="field">
                <span>Início *</span>
                <input type="time" value={form.hora_inicio} onChange={setCampo('hora_inicio')} required />
              </label>

              <label className="field">
                <span>Término *</span>
                <input type="time" value={form.hora_fim} onChange={setCampo('hora_fim')} required />
              </label>

              <label className="field">
                <span>Local</span>
                <input
                  type="text"
                  value={form.local}
                  onChange={setCampo('local')}
                  placeholder="ex: Sala 12"
                />
              </label>

              <label className="field">
                <span>Professor responsável</span>
                <select value={form.professor_id} onChange={setCampo('professor_id')}>
                  <option value="">— Sem professor definido —</option>
                  {professores.map((prof) => (
                    <option key={prof.id} value={prof.id}>
                      {prof.nome}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field field--span">
                <span>Descrição</span>
                <textarea
                  value={form.descricao}
                  onChange={setCampo('descricao')}
                  placeholder="Conteúdo, material necessário, observações..."
                />
              </label>
            </div>

            <div className="form-actions">
              <button className="btn btn--primary" type="submit" disabled={salvando}>
                <svg viewBox="0 0 24 24">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>{' '}
                {salvando ? 'Agendando...' : 'Agendar aula'}
              </button>
              <button
                className="btn btn--ghost"
                type="button"
                onClick={() => setForm({ ...FORM_INICIAL, turma_id: form.turma_id })}
              >
                Limpar
              </button>
            </div>
          </form>
        </section>
      ) : null}

      <DataTable
        title="Aulas agendadas"
        rows={dados.itens || []}
        columns={colunas}
        searchPlaceholder="Título, turma ou local..."
        filterLabel="Turma"
        filterOptions={(dados.turmas || []).map((turma) => ({
          value: String(turma.id),
          label: turma.nome,
        }))}
        groupOf={(aula) => String(aula.turma_id)}
        emptyText="Nenhuma aula agendada."
        actions={
          gerenciar
            ? (aula) => (
                <button
                  className="btn btn--danger btn--sm"
                  type="button"
                  onClick={() => excluirAula(aula)}
                >
                  Excluir
                </button>
              )
            : undefined
        }
      />
    </>
  );
}
