-- =========================================================
-- 010 — Realinha as sequences após os inserts com ids fixos
--       (as migrations 002..009 inseriram ids explícitos)
-- =========================================================

SELECT setval(pg_get_serial_sequence('usuarios', 'id'),     COALESCE((SELECT MAX(id) FROM usuarios), 1));
SELECT setval(pg_get_serial_sequence('turmas', 'id'),       COALESCE((SELECT MAX(id) FROM turmas), 1));
SELECT setval(pg_get_serial_sequence('aulas', 'id'),        COALESCE((SELECT MAX(id) FROM aulas), 1));
SELECT setval(pg_get_serial_sequence('provas', 'id'),       COALESCE((SELECT MAX(id) FROM provas), 1));
SELECT setval(pg_get_serial_sequence('atividades', 'id'),   COALESCE((SELECT MAX(id) FROM atividades), 1));
