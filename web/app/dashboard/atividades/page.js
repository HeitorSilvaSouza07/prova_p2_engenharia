'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import DataTable from '@/components/DataTable';
import Flash from '@/components/Flash';
import PageHeader from '@/components/PageHeader';
import { api } from '@/lib/api';
import { formatarData, formatarHora, formatarPeso, truncar } from '@/lib/format';
import { podeGerenciar } from '@/lib/menu';

const TIPOS = {
  tarefa: 'Tarefa',
  trabalho: 'Trabalho',
  exercicio: 'Exercício',
  projeto: 'Projeto',
  outro: 'Outro',
};

const FORM_INICIAL = {
  turma_id: '',
  titulo: '',
  tipo: 'tarefa',
  data_entrega: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
  hora_entrega: '23:59',
  valor: 10,
  professor_id: '',
  descricao: '',
};

export default function AtividadesPage() {
  const { user } = useAuth();
  const [dados, setDados] = useState({ turmas: [], itens: [] });
  const [professores, setProfessores] = useState([]);
  const [form, setForm] = useState(FORM_INICIAL);
  const [flash, setFlash] = useState(null);
  const [salvando, setSalvando] = useState(false);

  const gerenciar = podeGerenciar(user);
  const hoje = new Date().toISOString().slice(0, 10);

  const carregar = useCallback(async () => {
    try {
      const resultado = await api.get('/api/atividades');
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

  async function criarAtividade(event) {
    event.preventDefault();
    const erros = [];
    if (!form.turma_id) erros.push('Selecione uma turma válida.');
    if (!form.titulo.trim()) erros.push('Informe o título da atividade.');
    if (!form.data_entrega) erros.push('Informe uma data de entrega válida.');
    if (!Number.isFinite(Number(String(form.valor).replace(',', '.')))) {
      erros.push('Informe um valor numérico para a atividade.');
    }
    if (erros.length) {
      setFlash({ type: 'error', message: erros.join(' ') });
      return;
    }

    setSalvando(true);
    try {
      const resultado = await api.post('/api/atividades', form);
      setFlash({ type: 'success', message: resultado.message });
      setForm({ ...FORM_INICIAL, turma_id: form.turma_id });
      await carregar();
    } catch (error) {
      setFlash({ type: 'error', message: error.message });
    } finally {
      setSalvando(false);
    }
  }

  async function excluirAtividade(atividade) {
    if (!window.confirm(`Remover a atividade ${atividade.titulo}?`)) return;
    try {
      const resultado = await api.del(`/api/atividades/${atividade.id}`);
      setFlash({ type: 'success', message: resultado.message });
      await carregar();
    } catch (error) {
      setFlash({ type: 'error', message: error.message });
    }
  }

  const colunas = [
    {
      key: 'entrega',
      label: 'Entrega',
      render: (atividade) => (
        <>
          <strong>{formatarData(atividade.data_entrega)}</strong>
          <br />
          <small className="muted">{formatarHora(atividade.hora_entrega) || 'sem horário'}</small>
        </>
      ),
    },
    {
      key: 'atividade',
      label: 'Atividade',
      render: (atividade) => (
        <>
          <strong>{atividade.titulo}</strong>
          {atividade.descricao ? (
            <>
              <br />
              <small className="muted">{truncar(atividade.descricao)}</small>
            </>
          ) : null}
        </>
      ),
    },
    {
      key: 'turma',
      label: 'Turma',
      render: (atividade) => (
        <>
          {atividade.turma_nome}
          <br />
          <small className="muted">{atividade.turma_codigo}</small>
        </>
      ),
    },
    {
      key: 'tipo',
      label: 'Tipo',
      render: (atividade) => (
        <span className="badge badge--muted">{TIPOS[atividade.tipo] || atividade.tipo}</span>
      ),
    },
    {
      key: 'valor',
      label: 'Valor',
      render: (atividade) => formatarPeso(atividade.valor),
    },
    { key: 'professor', label: 'Professor', render: (atividade) => atividade.professor_nome || '—' },
    {
      key: 'situacao',
      label: 'Situação',
      render: (atividade) =>
        String(atividade.data_entrega).slice(0, 10) < hoje ? (
          <span className="badge badge--red">
            <span className="badge-dot" />
            Encerrada
          </span>
        ) : (
          <span className="badge badge--green">
            <span className="badge-dot" />
            Aberta
          </span>
        ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Atividades"
        sub={
          gerenciar
            ? 'Cadastre tarefas, trabalhos e projetos com data de entrega e valor.'
            : 'Confira as atividades e prazos das suas turmas.'
        }
        action={
          gerenciar ? (
            <button
              className="btn btn--primary"
              type="button"
              onClick={() =>
                document
                  .getElementById('form-atividade')
                  ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }
            >
              <svg viewBox="0 0 24 24">
                <path d="M12 5v14M5 12h14" />
              </svg>{' '}
              Nova atividade
            </button>
          ) : null
        }
      />

      <Flash flash={flash} onClear={() => setFlash(null)} />

      {gerenciar ? (
        <section className="card" id="form-atividade">
          <div className="card__head">
            <div>
              <h2 className="card__title">Nova atividade</h2>
              <p className="card__sub">
                Defina o prazo de entrega; os alunos recebem a atividade na agenda.
              </p>
            </div>
          </div>

          <form onSubmit={criarAtividade}>
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
                <span>Título *</span>
                <input
                  type="text"
                  value={form.titulo}
                  onChange={setCampo('titulo')}
                  placeholder="ex: Lista de exercícios 03"
                  required
                />
              </label>

              <label className="field">
                <span>Tipo</span>
                <select value={form.tipo} onChange={setCampo('tipo')}>
                  {Object.entries(TIPOS).map(([chave, rotulo]) => (
                    <option key={chave} value={chave}>
                      {rotulo}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>Data de entrega *</span>
                <input
                  type="date"
                  value={form.data_entrega}
                  onChange={setCampo('data_entrega')}
                  required
                />
              </label>

              <label className="field">
                <span>Horário limite</span>
                <input
                  type="time"
                  value={form.hora_entrega}
                  onChange={setCampo('hora_entrega')}
                />
              </label>

              <label className="field">
                <span>Valor (nota)</span>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={form.valor}
                  onChange={setCampo('valor')}
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
                  placeholder="Enunciado, formato de entrega, critérios de avaliação..."
                />
              </label>
            </div>

            <div className="form-actions">
              <button className="btn btn--primary" type="submit" disabled={salvando}>
                <svg viewBox="0 0 24 24">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>{' '}
                {salvando ? 'Cadastrando...' : 'Cadastrar atividade'}
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
        title="Atividades cadastradas"
        rows={dados.itens || []}
        columns={colunas}
        searchPlaceholder="Título ou turma..."
        filterLabel="Turma"
        filterOptions={(dados.turmas || []).map((turma) => ({
          value: String(turma.id),
          label: turma.nome,
        }))}
        groupOf={(atividade) => String(atividade.turma_id)}
        emptyText="Nenhuma atividade cadastrada."
        actions={
          gerenciar
            ? (atividade) => (
                <button
                  className="btn btn--danger btn--sm"
                  type="button"
                  onClick={() => excluirAtividade(atividade)}
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
