-- =========================================================
-- 004 — Inserts: turmas
-- =========================================================
INSERT INTO turmas (id, nome, disciplina, codigo, semestre, sala, capacidade, criado_por) VALUES
  (1, '1º Ano A',   'Matemática',              'MAT-1A-01', '2026.1', 'Bloco A - 101', 40, 2),
  (2, '2º Ano B',   'Linguagem Portuguesa',    'POR-2B-01', '2026.1', 'Bloco B - 205', 35, 1),
  (3, '3º Ano A',   'Física',                  'FIS-3A-01', '2026.1', 'Lab. Física 2', 30, 2),
  (4, '1º Ano B',   'História',                'HIS-1B-01', '2026.1', 'Bloco C - 110', 40, 1),
  (5, '2º Ano A',   'Química',                 'QUI-2A-01', '2026.1', 'Lab. Química 1', 28, 6),
  (6, '3º Ano B',   'Programação Avançada',    'PRO-3B-01', '2026.1', 'Lab. Informática 3', 32, 7)
ON CONFLICT (id) DO UPDATE SET nome = EXCLUDED.nome;
