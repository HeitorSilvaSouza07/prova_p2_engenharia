import './styles/base.css';
import { AuthProvider } from '@/components/AuthProvider';

export const metadata = {
  title: {
    default: 'ProSiga — Sistema Acadêmico Inteligente',
    template: '%s — ProSiga',
  },
  description:
    'O ProSiga organiza turmas, aulas, provas, atividades e a comunicação acadêmica em um só lugar.',
  icons: { icon: '/assets/img/logo-mark.png' },
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
