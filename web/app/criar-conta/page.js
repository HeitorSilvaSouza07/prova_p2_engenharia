import Link from 'next/link';
import '../styles/account.css';

export const metadata = {
  title: 'Criar conta',
};

export default function CriarContaPage() {
  return (
    <div className="account-page">
      <header className="account-header">
        <Link href="/" className="account-brand" aria-label="ProSiga - página inicial">
          <span className="account-brand__mark" aria-hidden="true">
            <img src="/assets/img/logo-mark.png" alt="" />
          </span>
          <span>ProSiga</span>
        </Link>
      </header>

      <main className="account-main">
        <div className="account-heading">
          <span className="account-eyebrow">Primeiro passo</span>
          <h1>
            Como você vai usar o <span className="account-heading__accent">ProSiga</span>?
          </h1>
          <p>
            Escolha o seu perfil para continuarmos com o cadastro. As informações da próxima etapa
            mudam de acordo com essa escolha.
          </p>
        </div>

        <div className="account-options">
          <Link href="/cadastro?tipo=professor" className="account-option">
            <span className="account-option__icon">
              <img src="/assets/img/mascot-teacher.svg" alt="" width="46" height="46" />
            </span>
            <span className="account-option__content">
              <strong>Sou professor</strong>
              <span>
                Crio turmas, vinculo alunos, agendo aulas, provas e atividades e envio avisos à
                turma.
              </span>
            </span>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>

          <Link href="/cadastro?tipo=aluno" className="account-option">
            <span className="account-option__icon account-option__icon--student">
              <img src="/assets/img/mascot-happy.svg" alt="" width="46" height="46" />
            </span>
            <span className="account-option__content">
              <strong>Sou aluno</strong>
              <span>
                Acompanho a agenda das minhas disciplinas: aulas, provas, atividades e avisos.
              </span>
            </span>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
        </div>

        <p className="account-login">
          Já possui acesso ao ProSiga? <Link href="/entrar">Entrar no sistema</Link>
        </p>
      </main>

      <footer className="account-footer" id="ajuda">
        <span className="account-footer__brand">
          <img src="/assets/img/logo-mark.png" alt="" />
          <strong>ProSiga</strong> © {new Date().getFullYear()} Todos os direitos reservados.
        </span>
        <span className="account-footer__links">
          <a href="#termos">Termos de Uso</a>
          <a href="#privacidade">Política de Privacidade</a>
          <a href="#suporte">Suporte Técnico</a>
        </span>
      </footer>
    </div>
  );
}
