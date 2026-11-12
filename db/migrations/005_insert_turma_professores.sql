-- =========================================================
-- 005 — Inserts: vínculos turma x professor
-- =========================================================
INSERT INTO turma_professores (turma_id, professor_id) VALUES
  (1, 4), (1, 2),
  (2, 5),
  (3, 6), (3, 4),
  (4, 8),
  (5, 6),
  (6, 7), (6, 2)
ON CONFLICT (turma_id, professor_id) DO UPDATE SET vinculo_em = CURRENT_TIMESTAMP;
