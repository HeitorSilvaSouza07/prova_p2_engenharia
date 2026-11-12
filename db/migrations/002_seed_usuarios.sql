-- =========================================================
-- 002 — Usuários de exemplo (seed inicial)
--   admin@prosiga.edu  -> senha: admin123
--   prof@prosiga.edu   -> senha: prof1234
--   aluno@prosiga.edu  -> senha: aluno1234
-- =========================================================

INSERT INTO usuarios (id, nome, email, senha, tipo, matricula, setor) VALUES
  (1, 'Secretaria Geral', 'admin@prosiga.edu',
   '$2b$10$Pqnp27lFnfWUmWnoudyYAuLQIp8kSurH.rmlZZSYowdXp45cJzSgi', 'admin', 'ADM001', 'Secretaria'),
  (2, 'Ana Beatriz Costa', 'prof@prosiga.edu',
   '$2b$10$HTKEjbxGwem.PN7nyt6DZ..1zSRcLUD1WKRo24mET824U5lA1gDo2', 'professor', '4521', 'Ciência da Computação'),
  (3, 'João Pedro Silva', 'aluno@prosiga.edu',
   '$2b$10$0ag.8HR/GOw7EoI7KmKQZ.2T8b02vbgq6p1ByOMyMYj93KDCWkwWS', 'aluno', '20261002', 'Engenharia de Software')
ON CONFLICT (id) DO UPDATE SET nome = EXCLUDED.nome;
