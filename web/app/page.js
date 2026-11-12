import Link from 'next/link';
import Faq from '@/components/Faq';
import './styles/landing.css';

const testimonials = [
  {
    name: 'Heitor Silva',
    role: 'Diretor escolar',
    quote: 'Reduziu o retrabalho da secretaria em poucas semanas de uso.',
    initials: 'HS',
  },
  {
    name: 'Matheus Terra',
    role: 'Coordenador pedagógico',
    quote: 'A comunicação com as famílias ficou muito mais simples.',
    initials: 'MT',
  },
  {
    name: 'Arthur Souza',
    role: 'Professor de matemática',
    quote: 'Consigo acompanhar cada turma sem me perder em planilhas.',
    initials: 'AS',
  },
  {
    name: 'Leandro Abreu',
    role: 'Professor de computação',
    quote: 'Lançar as atividades nunca esteve tão fácil.',
    initials: 'LA',
  },
];

const features = [
  {
    icon: 'M5 5h22a2 2 0 0 1 2 2v18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z M9 13h14 M9 18h14 M9 23h9',
    title: 'Mural de recados',
    description: 'Compartilhe avisos importantes com toda a turma em segundos.',
  },
  {
    icon: 'M5 8a2 2 0 0 1 2-2h18a2 2 0 0 1 2 2v18a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8Z M5 13h22 M11 3v6 M21 3v6',
    title: 'Calendário acadêmico',
    description: 'Organize provas, entregas e eventos em um calendário único.',
  },
  {
    icon: 'M16 5c-5 0-8 4-8 9v4l-3 4h22l-3-4v-4c0-5-3-9-8-9Z M13 25a3 3 0 0 0 6 0',
    title: 'Notificações em tempo real',
    description: 'Alunos e responsáveis são avisados assim que você publica algo novo.',
  },
  {
    icon: 'M8 4h13l6 6v18a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z M21 4v6h6 M11 17h10 M11 22h10 M11 12h5',
    title: 'Boletim digital',
    description: 'Acompanhe notas e frequência sem depender de planilhas soltas.',
  },
  {
    icon: 'M5 6h22a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H14l-6 6v-6H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z M9 13h14 M9 17h9',
    title: 'Mensagens diretas',
    description: 'Fale com professores ou com a turma inteira sem sair da plataforma.',
  },
  {
    icon: 'M5 27V6 M5 27h22 M10 27V17 M17 27V11 M24 27V15',
    title: 'Relatórios de desempenho',
    description: 'Veja o progresso da turma em gráficos simples de entender.',
  },
];

const steps = [
  {
    title: 'Crie a turma',
    description: 'Cadastre alunos e professores em poucos minutos, sem planilhas.',
  },
  {
    title: 'Compartilhe o dia a dia',
    description: 'Publique aulas, provas e atividades em um só lugar.',
  },
  {
    title: 'Acompanhe tudo',
    description: 'Veja a agenda da turma inteira e o que ainda precisa de atenção.',
  },
];

const faqItems = [
  {
    id: 'celular',
    question: 'O ProSiga funciona no celular?',
    answer:
      'Sim. A plataforma se adapta a qualquer tela, e alunos, professores e responsáveis recebem notificações direto no celular.',
  },
  {
    id: 'instalacao',
    question: 'Preciso instalar algum programa?',
    answer:
      'Não. O ProSiga funciona pelo navegador, sem instalação e sem ocupar espaço no aparelho.',
  },
  {
    id: 'tamanho',
    question: 'Dá para usar em qualquer escola?',
    answer:
      'Sim. Funciona para escolas de qualquer porte, de uma turma única a redes com várias unidades.',
  },
  {
    id: 'comecar',
    question: 'Como faço para começar?',
    answer:
      'Clique em <a class="pro-siga__inline-link" href="/criar-conta">Criar conta</a> e configure sua primeira turma em poucos minutos.',
  },
];

export default function LandingPage() {
  const ano = new Date().getFullYear();

  return (
    <div className="pro-siga">
      <header className="pro-siga__header">
        <Link className="pro-siga__brand" href="/">
          <img src="/assets/img/logo-mark.png" alt="ProSiga" className="pro-siga__logo-mark" />
          <span className="pro-siga__wordmark">ProSiga</span>
        </Link>
        <nav className="pro-siga__nav" aria-label="Navegação principal">
          <div className="pro-siga__nav-links">
            <a className="pro-siga__nav-link" href="#recursos">Recursos</a>
            <a className="pro-siga__nav-link" href="#como-funciona">Como funciona</a>
            <a className="pro-siga__nav-link" href="#depoimentos">Depoimentos</a>
            <a className="pro-siga__nav-link" href="#faq">Dúvidas</a>
          </div>
          <div className="pro-siga__nav-actions">
            <Link className="pro-siga__btn pro-siga__btn--ghost" href="/entrar">Entrar</Link>
            <Link className="pro-siga__btn pro-siga__btn--primary" href="/criar-conta">
              Criar conta
            </Link>
          </div>
        </nav>
      </header>

      <main>
        <section className="pro-siga__hero">
          <div className="pro-siga__hero-art">
            <img
              className="pro-siga__mascot"
              src="/assets/img/mascot-confused.svg"
              alt="Mascote do ProSiga cercado por interrogações, representando dúvidas do dia a dia acadêmico"
            />
          </div>
          <div className="pro-siga__hero-copy">
            <h1 className="pro-siga__eyebrow-free-heading">
              Feito para <em>o aluno</em> e para <em>o professor</em>
            </h1>
            <p>
              O ProSiga organiza turmas, aulas, provas, atividades e recados da rotina acadêmica em
              um único lugar, com acesso simples para quem ensina e para quem aprende.
            </p>
            <Link className="pro-siga__btn pro-siga__btn--primary" href="/criar-conta">
              Experimente já
            </Link>
          </div>
        </section>

        <section
          className="pro-siga__trust"
          id="depoimentos"
          aria-labelledby="pro-siga-trust-heading"
        >
          <div className="pro-siga__trust-intro">
            <h2 id="pro-siga-trust-heading" className="pro-siga__trust-heading">
              Aprovado por quem ensina e por quem aprende
            </h2>
            <p className="pro-siga__trust-sub">
              Escolas de todos os tamanhos usam o ProSiga para simplificar a rotina de professores,
              alunos e famílias.
            </p>
          </div>
          <ul className="pro-siga__testimonials">
            {testimonials.map((person, index) => (
              <li
                className={`pro-siga__testimonial${
                  index === testimonials.length - 1 ? ' pro-siga__testimonial--last' : ''
                }`}
                key={person.name}
              >
                <div className="pro-siga__testimonial-person">
                  <span className="pro-siga__avatar" aria-hidden="true">
                    {person.initials}
                  </span>
                  <div>
                    <p className="pro-siga__testimonial-name">{person.name}</p>
                    <p className="pro-siga__testimonial-role">{person.role}</p>
                  </div>
                </div>
                <p className="pro-siga__testimonial-quote">&ldquo;{person.quote}&rdquo;</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="pro-siga__section" id="recursos" aria-labelledby="pro-siga-features-title">
          <h2 id="pro-siga-features-title" className="pro-siga__section-heading">
            Tudo o que a rotina escolar precisa, em um só lugar
          </h2>
          <p className="pro-siga__section-sub">
            Recursos pensados para simplificar a comunicação entre escola, professores, alunos e
            famílias.
          </p>
          <div className="pro-siga__feature-grid">
            {features.map((feature) => (
              <div className="pro-siga__feature" key={feature.title}>
                <svg
                  className="pro-siga__feature-icon"
                  viewBox="0 0 32 32"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d={feature.icon}
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section
          className="pro-siga__steps"
          id="como-funciona"
          aria-labelledby="pro-siga-steps-title"
        >
          <h2 id="pro-siga-steps-title" className="pro-siga__section-heading">
            Como funciona
          </h2>
          <p className="pro-siga__section-sub">Três passos para colocar a sua turma no ProSiga.</p>
          <ol className="pro-siga__steps-list">
            {steps.map((step, index) => (
              <li className="pro-siga__step" key={step.title}>
                <span className="pro-siga__step-index" aria-hidden="true">
                  {index + 1}
                </span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="pro-siga__features" aria-labelledby="pro-siga-features-heading">
          <h2 id="pro-siga-features-heading" className="pro-siga__features-heading">
            Pensado em <em>agilidade e facilidade</em> no caminho da informação
          </h2>
          <p className="pro-siga__features-sub">
            Centralize aulas, provas, atividades e recados em um só lugar, com acesso simples para
            professores e alunos.
          </p>

          <div className="pro-siga__cards">
            <article className="pro-siga__card">
              <img
                className="pro-siga__mascot"
                src="/assets/img/mascot-teacher.svg"
                alt="Mascote do ProSiga na versão do professor, segurando anotações"
              />
              <h3>O professor</h3>
              <p>
                Organiza conteúdos, agenda aulas e provas, acompanha a turma e simplifica a rotina
                acadêmica.
              </p>
            </article>
            <article className="pro-siga__card">
              <img
                className="pro-siga__mascot"
                src="/assets/img/mascot-happy.svg"
                alt="Mascote do ProSiga na versão do aluno, com uma notificação no celular"
              />
              <h3>O aluno</h3>
              <p>Recebe avisos, acompanha a agenda das disciplinas e se mantém conectado.</p>
            </article>
          </div>

          <div className="pro-siga__features-cta">
            <Link className="pro-siga__btn pro-siga__btn--primary" href="/criar-conta">
              Quero conhecer a plataforma
            </Link>
          </div>
        </section>

        <section className="pro-siga__faq" id="faq" aria-labelledby="pro-siga-faq-title">
          <div className="pro-siga__faq-grid">
            <div className="pro-siga__faq-intro">
              <h2 id="pro-siga-faq-title" className="pro-siga__section-heading">
                Perguntas frequentes
              </h2>
              <p className="pro-siga__section-sub">
                Não encontrou o que procurava?{' '}
                <a className="pro-siga__inline-link" href="mailto:contato@prosiga.com.br">
                  Fale com a gente
                </a>
                .
              </p>
            </div>
            <Faq items={faqItems} />
          </div>
        </section>

        <section className="pro-siga__final-cta">
          <div className="pro-siga__final-cta-copy">
            <h2>Pronto para simplificar a rotina da sua escola?</h2>
            <p>Crie sua conta gratuita e configure a primeira turma em poucos minutos.</p>
            <Link className="pro-siga__btn pro-siga__btn--primary" href="/criar-conta">
              Criar conta gratuita
            </Link>
          </div>
          <img
            className="pro-siga__mascot pro-siga__final-cta-mascot"
            src="/assets/img/mascot-happy.svg"
            alt="Mascote do ProSiga acenando, convidando para criar uma conta"
          />
        </section>
      </main>

      <footer className="pro-siga__footer">
        <div className="pro-siga__footer-inner">
          <div className="pro-siga__footer-col pro-siga__footer-brand-col">
            <div className="pro-siga__footer-brand">
              <img
                src="/assets/img/logo-mark.png"
                alt="ProSiga"
                className="pro-siga__logo-mark pro-siga__logo-mark--light"
              />
              <span className="pro-siga__wordmark pro-siga__wordmark--light">ProSiga</span>
            </div>
            <p className="pro-siga__footer-tagline">
              A rotina acadêmica organizada para quem ensina e para quem aprende.
            </p>
          </div>
          <div className="pro-siga__footer-col">
            <h3>Produto</h3>
            <a href="#recursos">Recursos</a>
            <a href="#como-funciona">Como funciona</a>
            <a href="#depoimentos">Depoimentos</a>
          </div>
          <div className="pro-siga__footer-col">
            <h3>Suporte</h3>
            <a href="#faq">Perguntas frequentes</a>
            <a href="mailto:contato@prosiga.com.br">Fale com a gente</a>
          </div>
        </div>
        <p className="pro-siga__footer-copy">&copy; {ano} ProSiga. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
