import express from 'express';
import session from 'express-session';
import cors from 'cors';
import { config } from './config.js';
import { attachUser, requireAuth, requireCsrf } from './middleware/auth.js';
import authRoutes from './routes/auth.js';
import usuariosRoutes from './routes/usuarios.js';
import turmasRoutes from './routes/turmas.js';
import vinculosRoutes from './routes/vinculos.js';
import aulasRoutes from './routes/aulas.js';
import provasRoutes from './routes/provas.js';
import atividadesRoutes from './routes/atividades.js';
import dashboardRoutes from './routes/dashboard.js';

const app = express();

app.use(express.json({ limit: '1mb' }));
app.use(
  cors({
    origin(origin, callback) {
      const permitida =
        !origin ||
        origin === config.webOrigin ||
        /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
      callback(null, permitida);
    },
    credentials: true,
  })
);
app.use(
  session({
    name: 'prosiga.sid',
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  })
);

app.use(attachUser);
app.use(requireCsrf);

app.get('/api/health', (req, res) => {
  res.json({ ok: true, user: req.user ? req.user.id : null });
});

app.use('/api', (req, res, next) => {
  if (req.path.startsWith('/auth')) return next();
  return requireAuth(req, res, next);
});

app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/turmas', turmasRoutes);
app.use('/api/vinculos', vinculosRoutes);
app.use('/api/aulas', aulasRoutes);
app.use('/api/provas', provasRoutes);
app.use('/api/atividades', atividadesRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada.' });
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ error: 'Erro interno no servidor.' });
});

app.listen(config.apiPort, () => {
  console.log(`API ProSiga escutando em http://localhost:${config.apiPort}`);
});
