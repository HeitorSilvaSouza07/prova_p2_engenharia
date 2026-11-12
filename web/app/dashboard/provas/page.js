'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import DataTable from '@/components/DataTable';
import Flash from '@/components/Flash';
import PageHeader from '@/components/PageHeader';
import { api } from '@/lib/api';
import { diaSemana, formatarData, formatarHora, formatarPeso, truncar } from '@/lib/format';
import { podeGerenciar } from '@/lib/menu';

const FORM_INICIAL = {
  turma_id: '',
  titulo: '',
  data_prova: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
  hora: '08:00',
  local: '',
  peso: 1,
  professor_id: '',
  descricao: '',
};

export default function ProvasPage() {
  const { user } = useAuth();
  const [dados, setDados] = useState({ turmas: [], itens: [] });
  const [professores, setProfessores] = useState([]);
  const [form, setForm] = useState(FORM_INICIAL);
  const [flash, setFlash] = useState(null);
  const [salvando, setSalvando] = useState(false);

  const gerenciar = podeGerenciar(user);

  const carregar = useCallback(async () => {
    try {
      const resultado = await api.get('/api/provas');
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

  async function criarProva(event) {
    event.preventDefault();
    const erros = [];
    if (!form.turma_id) erros.push('Selecione uma turma válida.');
    if (!form.titulo.trim()) erros.push('Informe o título da prova.');
    if (!form.data_prova) erros.push('Informe uma data válida.');
    if (!(Number(String(form.peso).replace(',', '.')) > 0)) {
      erros.push('O peso da prova deve ser maior que zero.');
    }
    if (erros.length) {
      setFlash({ type: 'error', message: erros.join(' ') });
      return;
    }

    setSalvando(true);
    try {
      const resultado = await api.post('/api/provas', form);
      setFlash({ type: 'success', message: resultado.message });
      setForm({ ...FORM_INICIAL, turma_id: form.turma_id });
      await carregar();
    } catch (error) {
      setFlash({ type: 'error', message: error.message });
    } finally {
      setSalvando(false);
    }
  }

  async function excluirProva(prova) {
    if (!window.confirm(`Remover a prova ${prova.titulo}?`)) return;
    try {
      const resultado = await api.del(`/api/provas/${prova.id}`);
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
      render: (prova) => (
        <>
          <strong>{formatarData(prova.data_prova)}</strong>
          <br />
          <small className="muted">{diaSemana(prova.data_prova)}</small>
        </>
      ),
    },
    {
      key: 'prova',
      label: 'Prova',
      render: (prova) => (
        <>
          <strong>{prova.titulo}</strong>
          {prova.descricao ? (
            <>
              <br />
              <small className="muted">{truncar(prova.descricao)}</small>
            </>
          ) : null}
        </>
      ),
    },
    {
      key: 'turma',
      label: 'Turma',
      render: (prova) => (
        <>
          {prova.turma_nome}
          <br />
          <small className="muted">{prova.turma_codigo}</small>
        </>
      ),
    },
    {
      key: 'horario',
      label: 'Horário',
      render: (prova) => (
        <span className="badge">{formatarHora(prova.hora) || '—'}</span>
      ),
    },
    { key: 'local', label: 'Local', render: (prova) => prova.local || '—' },
    {
      key: 'peso',
      label: 'Peso',
      render: (prova) => (
        <span className="badge badge--amber">{formatarPeso(prova.peso)}</span>
      ),
    },
    { key: 'professor', label: 'Professor', render: (prova) => prova.professor_nome || '—' },
  ];

  return (
    <>
      <PageHeader
        title="Provas"
        sub={
          gerenciar
            ? 'Agende as provas, defina peso, local e horário para cada turma.'
            : 'Confira as provas agendadas das suas turmas.'
        }
        action={
          gerenciar ? (
            <button
              className="btn btn--primary"
              type="button"
              onClick={() =>
                document
                  .getElementById('form-prova')
                  ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }
            >
              <svg viewBox="0 0 24 24">
                <path d="M12 5v14M5 12h14" />
              </svg>{' '}
              Agendar prova
            </button>
          ) : null
        }
      />

      <Flash flash={flash} onClear={() => setFlash(null)} />

      {gerenciar ? (
        <section className="card" id="form-prova">
          <div className="card__head">
            <div>
              <h2 className="card__title">Agendar prova</h2>
              <p className="card__sub">O peso é usado no cálculo da média da turma.</p>
            </div>
          </div>

          <form onSubmit={criarProva}>
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
                <span>Título da prova *</span>
                <input
                  type="text"
                  value={form.titulo}
                  onChange={setCampo('titulo')}
                  placeholder="ex: Prova bimestral de matemática"
                  required
                />
              </label>

              <label className="field">
                <span>Data *</span>
                <input
                  type="date"
                  value={form.data_prova}
                  onChange={setCampo('data_prova')}
                  required
                />
              </label>

              <label className="field">
                <span>Horário</span>
                <input type="time" value={form.hora} onChange={setCampo('hora')} />
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
                <span>Peso</span>
                <input
                  type="number"
                  step="0.25"
                  min="0.25"
                  value={form.peso}
                  onChange={setCampo('peso')}
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
                <span>Conteúdo / observações</span>
                <textarea
                  value={form.descricao}
                  onChange={setCampo('descricao')}
                  placeholder="Capítulos, fórmulas permitidas, materiais..."
                />
              </label>
            </div>

            <div className="form-actions">
              <button className="btn btn--primary" type="submit" disabled={salvando}>
                <svg viewBox="0 0 24 24">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>{' '}
                {salvando ? 'Agendando...' : 'Agendar prova'}
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
        title="Provas agendadas"
        rows={dados.itens || []}
        columns={colunas}
        searchPlaceholder="Título, turma ou local..."
        filterLabel="Turma"
        filterOptions={(dados.turmas || []).map((turma) => ({
          value: String(turma.id),
          label: turma.nome,
        }))}
        groupOf={(prova) => String(prova.turma_id)}
        emptyText="Nenhuma prova agendada."
        actions={
          gerenciar
            ? (prova) => (
                <button
                  className="btn btn--danger btn--sm"
                  type="button"
                  onClick={() => excluirProva(prova)}
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
