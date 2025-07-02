require('dotenv').config();
const Koa = require('koa');
const session = require('koa-session');
const views = require('koa-views');
const serve = require('koa-static');
const bodyParser = require('koa-bodyparser');
const path = require('path');
const router = require('./routes');
const { initDB } = require('./db');
const CSRF = require('@koa/csrf');

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

const app = new Koa();

try {
  initDB();
  console.log('Database initialized successfully');
} catch (dbError) {
  console.error('Database initialization failed:', dbError);
}

app.keys = [process.env.SESSION_SECRET || 'your-secret-key'];
app.use(session({
  key: 'koa.sess',
  maxAge: 86400000,
  autoCommit: true,
  overwrite: true,
  httpOnly: true,
  signed: true,
  rolling: false,
  renew: false,
}, app));

app.use(bodyParser());
app.use(serve(path.join(__dirname, 'public')));
app.use(views(path.join(__dirname, 'views'), { extension: 'pug' }));

app.use(new CSRF());

app.use(async (ctx, next) => {
  ctx.state.session = ctx.session;
  ctx.state.csrf = ctx.csrf;
  await next();
});

app.use(async (ctx, next) => {
  const publicRoutes = ['/', '/login', '/register'];
  
  if (!publicRoutes.includes(ctx.path)) {
    if (!ctx.session.user) {
      return ctx.redirect('/');
    }
  }
  
  await next();
});

app.use(router.routes());
app.use(router.allowedMethods());

app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    console.error('Server error:', err);
    ctx.status = 500;
    await ctx.render('error', {
      message: 'Internal Server Error',
      session: ctx.session
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
