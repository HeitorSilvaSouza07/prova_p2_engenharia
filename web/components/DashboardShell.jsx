'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { MENU } from '@/lib/menu';

export default function DashboardShell({ children }) {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/entrar');
    }
  }, [loading, user, router]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (loading || !user) {
    return (
      <div className="app-body">
        <div className="app">
          <main className="app-main" style={{ padding: 32 }}>
            <p className="muted">Carregando...</p>
          </main>
        </div>
      </div>
    );
  }

  const menu = MENU.filter((item) => item.roles.includes(user.tipo));
  const firstName = String(user.nome || '').trim().split(' ')[0];

  async function handleLogout() {
    await logout();
    router.replace('/entrar');
  }

  return (
    <div className="app">
      <header className="app-topbar">
        <button
          className="app-burger"
          type="button"
          onClick={() => setSidebarOpen((open) => !open)}
          aria-label="Abrir menu"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>

        <Link className="app-brand" href="/">
          <img src="/assets/img/logo-mark.png" alt="" className="app-brand__logo" />
          <span className="app-brand__name">ProSiga</span>
        </Link>

        <div className="app-topbar__spacer" />

        <div className="app-user">
          <span className="app-user__avatar" aria-hidden="true">
            {String(firstName).charAt(0).toUpperCase()}
          </span>
          <span className="app-user__meta">
            <strong>{user.nome}</strong>
            <small>{user.tipo_label}</small>
          </span>
          <button className="app-logout" type="button" onClick={handleLogout} title="Sair do sistema">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M15 17l5-5-5-5M20 12H9M12 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h6" />
            </svg>
            <span>Sair</span>
          </button>
        </div>
      </header>

      <div className="app-shell">
        <div
          className={`app-overlay${sidebarOpen ? ' is-visible' : ''}`}
          onClick={() => setSidebarOpen(false)}
        />

        <aside className={`app-sidebar${sidebarOpen ? ' is-open' : ''}`} data-sidebar>
          <nav className="app-nav" aria-label="Menu do painel">
            <p className="app-nav__title">Navegação</p>
            <ul>
              {menu.map((item) => (
                <li key={item.key}>
                  <Link
                    className={`app-nav__link${pathname === item.url ? ' is-active' : ''}`}
                    href={item.url}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d={item.icon} />
                    </svg>
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>

            <div className="app-sidebar__card">
              <img
                src="/assets/img/mascot-happy.svg"
                alt=""
                className="app-sidebar__mascot"
              />
              <p>
                <strong>Dúvidas?</strong> Fale com a secretaria da sua escola.
              </p>
            </div>
          </nav>
        </aside>

        <main className="app-main">{children}</main>
      </div>
    </div>
  );
}
