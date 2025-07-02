const request = require('supertest');
const cheerio = require('cheerio');
const Koa = require('koa');
const session = require('koa-session');
const bodyParser = require('koa-bodyparser');
const views = require('koa-views');
const serve = require('koa-static');
const path = require('path');
const router = require('../routes');
const { initDB } = require('../db');
const CSRF = require('koa-csrf');

const app = new Koa();
initDB();
app.keys = ['test-secret'];
app.use(session(app));
app.use(bodyParser());
app.use(serve(path.join(__dirname, '../public')));
app.use(views(path.join(__dirname, '../views'), { extension: 'pug' }));
app.use(new CSRF());
app.use(async (ctx, next) => {
  ctx.state.session = ctx.session;
  ctx.state.csrf = ctx.csrf;
  await next();
});
app.use(router.routes());
app.use(router.allowedMethods());

const server = app.listen();

describe('0black basic flow', () => {
  let agent;
  beforeAll(() => {
    agent = request.agent(server);
  });
  afterAll(() => server.close());

  function getCsrfToken(html) {
    const $ = cheerio.load(html);
    return $('input[name="_csrf"]').val();
  }

  it('should register a new user', async () => {
    const getRes = await agent.get('/');
    const csrfToken = getCsrfToken(getRes.text);
    const uniqueUsername = 'testuser_' + Date.now();
    const res = await agent
      .post('/register')
      .type('form')
      .send({ username: uniqueUsername, password: 'testpass123', email: uniqueUsername + '@example.com', _csrf: csrfToken });
    if (res.status !== 302) {
      console.log('Register response:', res.text);
    }
    expect(res.status).toBe(302);
  });

  it('should not register with invalid data', async () => {
    const getRes = await agent.get('/');
    const csrfToken = getCsrfToken(getRes.text);
    const res = await agent
      .post('/register')
      .type('form')
      .send({ username: '', password: '', email: 'bad', _csrf: csrfToken });
    expect(res.status).toBe(400);
  });

  it('should login with correct credentials', async () => {
    // Register first
    let getRes = await agent.get('/');
    let csrfToken = getCsrfToken(getRes.text);
    await agent
      .post('/register')
      .type('form')
      .send({ username: 'testuser2', password: 'testpass123', email: 'test2@example.com', _csrf: csrfToken });
    // Login
    getRes = await agent.get('/');
    csrfToken = getCsrfToken(getRes.text);
    const res = await agent
      .post('/login')
      .type('form')
      .send({ username: 'testuser2', password: 'testpass123', _csrf: csrfToken });
    expect(res.status).toBe(302);
  });

  it('should not login with wrong credentials', async () => {
    const getRes = await agent.get('/');
    const csrfToken = getCsrfToken(getRes.text);
    const res = await agent
      .post('/login')
      .type('form')
      .send({ username: 'testuser2', password: 'wrongpass', _csrf: csrfToken });
    expect(res.status).toBe(200);
    expect(res.text).toContain('Invalid credentials');
  });
}); 