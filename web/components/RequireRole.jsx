'use client';

import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';

export default function RequireRole({ roles, children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <p className="muted">Carregando...</p>;
  }

  if (!user) return null;

  if (!roles.includes(user.tipo)) {
    return (
      <div className="flash flash--error" role="status">
        <span aria-hidden="true">!</span>
        <span>
          Você não tem permissão para acessar esta área.{' '}
          <Link href="/dashboard">Voltar ao painel</Link>
        </span>
      </div>
    );
  }

  return children;
}
