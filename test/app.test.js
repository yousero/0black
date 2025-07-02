const request = require('supertest');
const Koa = require('koa');
const session = require('koa-session');
const bodyParser = require('koa-bodyparser');
const views = require('koa-views');
const serve = require('koa-static');
const path = require('path');
const router = require('../routes');
const { initDB } = require('../db');

const app = new Koa();
initDB();
app.keys = ['test-secret'];
app.use(session(app));
app.use(bodyParser());
app.use(serve(path.join(__dirname, '../public')));
app.use(views(path.join(__dirname, '../views'), { extension: 'pug' }));
app.use(router.routes());
app.use(router.allowedMethods());

const server = app.listen();

describe('0black basic flow', () => {
  afterAll(() => server.close());

  it('should register a new user', async () => {
    const res = await request(server)
      .post('/register')
      .send({ username: 'testuser', password: 'testpass123', email: 'test@example.com' });
    expect(res.status).toBe(302);
  });

  it('should not register with invalid data', async () => {
    const res = await request(server)
      .post('/register')
      .send({ username: '', password: '', email: 'bad' });
    expect(res.status).toBe(400);
  });

  it('should login with correct credentials', async () => {
    await request(server)
      .post('/register')
      .send({ username: 'testuser2', password: 'testpass123', email: 'test2@example.com' });
    const res = await request(server)
      .post('/login')
      .send({ username: 'testuser2', password: 'testpass123' });
    expect(res.status).toBe(302);
  });

  it('should not login with wrong credentials', async () => {
    const res = await request(server)
      .post('/login')
      .send({ username: 'testuser2', password: 'wrongpass' });
    expect(res.status).toBe(200);
    expect(res.text).toContain('Invalid credentials');
  });
}); 