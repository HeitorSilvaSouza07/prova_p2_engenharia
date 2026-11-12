export const MENU = [
  {
    key: 'painel',
    label: 'Painel',
    url: '/dashboard',
    roles: ['admin', 'professor', 'aluno'],
    icon: 'M4 13h7V4H4v9Zm0 7h7v-5H4v5Zm9 0h7V11h-7v9Zm0-16v5h7V4h-7Z',
  },
  {
    key: 'turmas',
    label: 'Turmas',
    url: '/dashboard/turmas',
    roles: ['admin', 'professor', 'aluno'],
    icon: 'M3 7h18v13H3V7Zm5-4h8l2 4H6l2-4Zm5 9v6',
  },
  {
    key: 'alunos',
    label: 'Alunos',
    url: '/dashboard/alunos',
    roles: ['admin', 'professor'],
    icon: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-8 9a8 8 0 0 1 16 0',
  },
  {
    key: 'professores',
    label: 'Professores',
    url: '/dashboard/professores',
    roles: ['admin', 'professor'],
    icon: 'M4 20v-9a8 8 0 0 1 16 0v9M4 20h16M8 12h8',
  },
  {
    key: 'vinculos',
    label: 'Vínculos',
    url: '/dashboard/vinculos',
    roles: ['admin', 'professor'],
    icon: 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm8 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM2 21a7 7 0 0 1 14 0m2-7a6 6 0 0 1 6 6',
  },
  {
    key: 'aulas',
    label: 'Aulas',
    url: '/dashboard/aulas',
    roles: ['admin', 'professor', 'aluno'],
    icon: 'M4 6h16v14H4V6Zm0 5h16M8 3v5m8-5v5',
  },
  {
    key: 'provas',
    label: 'Provas',
    url: '/dashboard/provas',
    roles: ['admin', 'professor', 'aluno'],
    icon: 'M6 3h9l4 4v14H6V3Zm9 0v4h4M9 13h7M9 17h5',
  },
  {
    key: 'atividades',
    label: 'Atividades',
    url: '/dashboard/atividades',
    roles: ['admin', 'professor', 'aluno'],
    icon: 'M5 4h14v17H5V4Zm4 5h6M9 13h6M9 17h4',
  },
];

export function podeGerenciar(user) {
  return !!user && ['admin', 'professor'].includes(user.tipo);
}
