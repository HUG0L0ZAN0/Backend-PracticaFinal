const express = require('express');
const router = express.Router();
const { sql, pool, poolConnect } = require('../dbconfig');

// GET /api/usuarios
router.get('/', async (req, res) => {
  await poolConnect;
  try {
    const result = await pool.request().query('SELECT * FROM UsuariosHugo');
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al obtener usuarios');
  }
});

// GET /api/usuarios/:id
router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  await poolConnect;
  try {
    const result = await pool
      .request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM UsuariosHugo WHERE id = @id');
    if (!result.recordset.length) return res.status(404).send('Usuario no encontrado');
    res.json(result.recordset[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al obtener usuario');
  }
});

// POST /api/usuarios
router.post('/', async (req, res) => {
  const { username, password, email } = req.body;
  await poolConnect;
  try {
    const result = await pool
      .request()
      .input('username', sql.NVarChar(50), username)
      .input('password', sql.NVarChar(255), password)
      .input('email', sql.NVarChar(100), email)
      .query(`
        INSERT INTO UsuariosHugo (username, password, email)
        OUTPUT INSERTED.*
        VALUES (@username, @password, @email)
      `);
    res.status(201).json(result.recordset[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al crear usuario');
  }
});

// PUT /api/usuarios/:id
router.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { username, password, email } = req.body;
  await poolConnect;
  try {
    const result = await pool
      .request()
      .input('id', sql.Int, id)
      .input('username', sql.NVarChar(50), username)
      .input('password', sql.NVarChar(255), password)
      .input('email', sql.NVarChar(100), email)
      .query(`
        UPDATE UsuariosHugo
        SET username = @username,
            password = @password,
            email    = @email
        OUTPUT INSERTED.*
        WHERE id = @id
      `);
    if (!result.recordset.length) return res.status(404).send('Usuario no encontrado');
    res.json(result.recordset[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al actualizar usuario');
  }
});

// DELETE /api/usuarios/:id
router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  await poolConnect;
  try {
    const result = await pool
      .request()
      .input('id', sql.Int, id)
      .query(`
        DELETE FROM UsuariosHugo
        OUTPUT DELETED.*
        WHERE id = @id
      `);
    if (!result.recordset.length) return res.status(404).send('Usuario no encontrado');
    res.json({ eliminado: result.recordset[0] });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al eliminar usuario');
  }
});

module.exports = router;
