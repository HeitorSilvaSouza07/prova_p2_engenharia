'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { api } from '@/lib/api';
import '../styles/login.css';

export default function EntrarPage() {
  const router = useRouter();
  const { user, loading, refresh } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [senha, setSenha] = useState('');
  const [lembrar, setLembrar] = useState(false);
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace('/dashboard');
  }, [loading, user, router]);

  async function handleSubmit(event) {
    event.preventDefault();
    setErro('');

    if (!identifier.trim() || !senha) {
      setErro('Preencha seu e-mail ou matrícula e sua senha.');
      return;
    }

    setEnviando(true);
    try {
      await api.post('/api/auth/login', { identifier, senha, lembrar });
      await refresh();
      router.replace('/dashboard');
    } catch (error) {
      setErro(error.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="login-page">
      <header className="login-header">
        <Link href="/" className="login-brand" aria-label="ProSiga - página inicial">
          <img src="/assets/img/logo-mark.png" alt="" className="login-brand__logo" />
          <span>ProSiga</span>
        </Link>
        <nav className="login-nav" aria-label="Navegação principal" />
      </header>

      <main className="login-main">
        <section className="login-intro" id="sobre">
          <div className="login-mascot-wrap">
            <img
              className="login-mascot"
              src="/assets/img/mascot-teacher.svg"
              alt="Mascote ProSiga usando um capelo de formatura"
            />
          </div>
          <div className="login-intro__copy">
            <h1>
              Feito para o <em>aluno</em> e para o <strong>professor</strong>
            </h1>
            <p>
              O ProSiga reúne turmas, aulas, provas, atividades e comunicação acadêmica em uma
              plataforma moderna, intuitiva e acessível.
            </p>
          </div>
        </section>

        <section className="login-card" aria-labelledby="login-title">
          <div className="login-card__accent" />
          <div className="login-card__heading">
            <h2 id="login-title">Acessar o Portal</h2>
            <p>Insira suas credenciais para continuar no sistema</p>
          </div>

          {erro ? (
            <div className="login-feedback login-feedback--error" role="status">
              <span aria-hidden="true">!</span>
              {erro}
            </div>
          ) : null}

          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <label className="login-field">
              <span>E-mail ou Matrícula</span>
              <div className="login-input-wrap">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20 21a8 8 0 0 0-16 0M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
                </svg>
                <input
                  type="text"
                  name="identifier"
                  value={identifier}
                  onChange={(event) => setIdentifier(event.target.value)}
                  placeholder="ex: aluno@prosiga.edu ou 20261002"
                  autoComplete="username"
                  required
                />
              </div>
            </label>

            <label className="login-field">
              <span className="login-field__label-row">
                Senha
                <Link href="/criar-conta">Criar conta</Link>
              </span>
              <div className="login-input-wrap">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="4" y="10" width="16" height="11" rx="2" />
                  <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                </svg>
                <input
                  type="password"
                  name="senha"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  value={senha}
                  onChange={(event) => setSenha(event.target.value)}
                  required
                />
              </div>
            </label>

            <label className="login-remember">
              <input
                type="checkbox"
                checked={lembrar}
                onChange={(event) => setLembrar(event.target.checked)}
              />
              <span>Mantenha-me conectado neste dispositivo</span>
            </label>

            <button type="submit" className="login-submit" disabled={enviando}>
              <span>{enviando ? 'Entrando...' : 'Entrar no Sistema'}</span>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </button>
          </form>

          <div className="login-divider">
            <span>acesso de demonstração</span>
          </div>
          <p className="login-signup">
            Admin: <strong>admin@prosiga.edu</strong> / <strong>admin123</strong>
            <br />
            Professor: <strong>prof@prosiga.edu</strong> / <strong>prof1234</strong>
            <br />
            Aluno: <strong>aluno@prosiga.edu</strong> / <strong>aluno1234</strong>
          </p>

          <p className="login-signup">
            Ainda não possui acesso ao ProSiga? <Link href="/criar-conta">Solicite seu cadastro</Link>
          </p>
        </section>
      </main>

      <footer className="login-footer" id="ajuda">
        <span className="login-footer__brand">
          <img src="/assets/img/logo-mark.png" alt="" />
          <strong>ProSiga</strong> © {new Date().getFullYear()} Todos os direitos reservados.
        </span>
        <span className="login-footer__links">
          <a href="#termos">Termos de Uso</a>
          <a href="#privacidade">Política de Privacidade</a>
          <a href="#suporte">Suporte Técnico</a>
        </span>
      </footer>
    </div>
  );
}
