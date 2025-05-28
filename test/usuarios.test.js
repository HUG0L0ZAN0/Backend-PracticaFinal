const request = require('supertest');
const express = require('express');
const usuariosRouter = require('../routes/usuarios');

const app = express();
app.use(express.json());
app.use('/api/usuarios', usuariosRouter);

describe('Usuarios Endpoints', () => {
  it('should create a new user', async () => {
    const res = await request(app)
      .post('/api/usuarios')
      .send({
        username: 'testuser',
        password: 'testpass',
        email: 'test@test.com'
      });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('username', 'testuser');
  });

  it('should return 401 for protected routes without token', async () => {
    const res = await request(app)
      .get('/api/usuarios');
    expect(res.statusCode).toBe(401);
  });
}); 