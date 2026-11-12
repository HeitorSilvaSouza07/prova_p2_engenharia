'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { api } from '@/lib/api';
import '../styles/signup.css';

function CadastroForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading, refresh } = useAuth();

  const tipo = searchParams.get('tipo') === 'professor' ? 'professor' : 'aluno';
  const isProfessor = tipo === 'professor';

  const [form, setForm] = useState({
    nome: '',
    email: '',
    identificador: '',
    curso: '',
    senha: '',
    confirmar_senha: '',
  });
  const [erros, setErros] = useState([]);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace('/dashboard');
  }, [loading, user, router]);

  function setCampo(campo) {
    return (event) => setForm((atual) => ({ ...atual, [campo]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const locais = [];

    if (form.nome.trim().length < 3) locais.push('Informe seu nome completo.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) locais.push('Informe um e-mail válido.');
    if (!form.identificador.trim()) {
      locais.push(isProfessor ? 'Informe o registro funcional.' : 'Informe a matrícula.');
    }
    if (form.senha.length < 8) locais.push('A senha precisa ter no mínimo 8 caracteres.');
    if (form.senha !== form.confirmar_senha) locais.push('As senhas precisam ser iguais.');

    if (locais.length) {
      setErros(locais);
      return;
    }

    setEnviando(true);
    setErros([]);
    try {
      await api.post('/api/auth/cadastro', { ...form, tipo });
      await refresh();
      router.replace('/dashboard');
    } catch (error) {
      setErros([error.message]);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="signup-page">
      <header className="signup-header">
        <Link href="/" className="signup-brand">
          <span className="signup-brand__mark">
            <img src="/assets/img/logo-mark.png" alt="" />
          </span>
          ProSiga
        </Link>
      </header>

      <main className="signup-main">
        <div className="signup-side">
          <Link className="signup-back" href="/criar-conta">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M19 12H5M11 6l-6 6 6 6" />
            </svg>
            Trocar tipo de conta
          </Link>
          <div className="signup-side-art">
            <img
              className="signup-side-mascot"
              src={
                isProfessor
                  ? '/assets/img/mascot-teacher.svg'
                  : '/assets/img/mascot-happy.svg'
              }
              alt={
                isProfessor ? 'Mascote professor do ProSiga' : 'Mascote aluno feliz do ProSiga'
              }
            />
          </div>
          <h2>
            {isProfessor ? (
              <>
                Organize sua rotina e inspire seus <strong>alunos</strong>
              </>
            ) : (
              <>
                Seu caminho acadêmico começa aqui, <em>aluno</em>
              </>
            )}
          </h2>
          <p>
            {isProfessor
              ? 'Crie suas turmas, vincule alunos, agende aulas, provas e atividades e mantenha toda a comunicação acadêmica em um só lugar.'
              : 'Tenha suas disciplinas, aulas, provas e atividades sempre ao alcance para estudar com mais tranquilidade.'}
          </p>
        </div>

        <section className="signup-card" aria-labelledby="signup-title">
          <div className="signup-card__bar" />
          <div className="signup-card__body">
            <span className="signup-badge">Cadastro de {isProfessor ? 'professor' : 'aluno'}</span>
            <h1 id="signup-title">Criar Conta</h1>
            <p className="signup-subtitle">
              Preencha os dados abaixo para{' '}
              {isProfessor ? 'organizar suas turmas' : 'acompanhar suas disciplinas'} no ProSiga.
            </p>

            {erros.length ? (
              <div className="signup-feedback" role="alert">
                {erros.map((mensagem) => (
                  <div key={mensagem}>{mensagem}</div>
                ))}
              </div>
            ) : null}

            <form className="signup-form" onSubmit={handleSubmit} noValidate>
              <label className="signup-field">
                <span>Nome completo</span>
                <div className="signup-input">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M20 21a8 8 0 0 0-16 0M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
                  </svg>
                  <input
                    type="text"
                    value={form.nome}
                    onChange={setCampo('nome')}
                    placeholder="ex: Maria Oliveira"
                    required
                  />
                </div>
              </label>

              <label className="signup-field">
                <span>{isProfessor ? 'E-mail institucional' : 'E-mail'}</span>
                <div className="signup-input">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M4 6h16v12H4V6Zm0 1 8 6 8-6" />
                  </svg>
                  <input
                    type="email"
                    value={form.email}
                    onChange={setCampo('email')}
                    placeholder={
                      isProfessor ? 'ex: professor@prosiga.edu' : 'ex: aluno@prosiga.edu'
                    }
                    required
                  />
                </div>
              </label>

              <label className="signup-field">
                <span>{isProfessor ? 'Registro funcional' : 'Matrícula'}</span>
                <div className="signup-input">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M7 3h10l3 4v13H4V7l3-4ZM9 12h6M9 16h6" />
                  </svg>
                  <input
                    type="text"
                    value={form.identificador}
                    onChange={setCampo('identificador')}
                    placeholder={isProfessor ? 'ex: 4521' : 'ex: 20261002'}
                    required
                  />
                </div>
              </label>

              <label className="signup-field">
                <span>{isProfessor ? 'Departamento' : 'Curso'}</span>
                <div className="signup-input">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M4 20V7l8-4 8 4v13M2 20h20M8 20v-5h8v5" />
                  </svg>
                  <input
                    type="text"
                    value={form.curso}
                    onChange={setCampo('curso')}
                    placeholder={
                      isProfessor ? 'ex: Ciência da Computação' : 'ex: Engenharia de Software'
                    }
                  />
                </div>
              </label>

              <div className="signup-field-row">
                <label className="signup-field">
                  <span>Senha</span>
                  <div className="signup-input">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <rect x="4" y="10" width="16" height="11" rx="2" />
                      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                    </svg>
                    <input
                      type="password"
                      minLength={8}
                      value={form.senha}
                      onChange={setCampo('senha')}
                      placeholder="Crie uma senha"
                      required
                    />
                  </div>
                </label>

                <label className="signup-field">
                  <span>Confirmar senha</span>
                  <div className="signup-input">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <rect x="4" y="10" width="16" height="11" rx="2" />
                      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                    </svg>
                    <input
                      type="password"
                      minLength={8}
                      value={form.confirmar_senha}
                      onChange={setCampo('confirmar_senha')}
                      placeholder="Repita a senha"
                      required
                    />
                  </div>
                </label>
              </div>

              <button type="submit" className="signup-submit" disabled={enviando}>
                {enviando ? 'Criando conta...' : 'Criar Conta'}
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </button>

              <p className="signup-login">
                Já possui acesso ao ProSiga? <Link href="/entrar">Entrar</Link>
              </p>
            </form>
          </div>
        </section>
      </main>

      <footer className="signup-footer" id="ajuda">
        <span className="signup-footer__brand">
          <img src="/assets/img/logo-mark.png" alt="" />
          <strong>ProSiga</strong> © {new Date().getFullYear()} Todos os direitos reservados.
        </span>
      </footer>
    </div>
  );
}

export default function CadastroPage() {
  return (
    <Suspense fallback={null}>
      <CadastroForm />
    </Suspense>
  );
}
