const express = require('express');
const router = express.Router();
const auth    = require('../middleware/auth');
const { sql, pool, poolConnect } = require('../dbconfig');

/**
 * @swagger
 * tags:
 *   name: Usuarios
 *   description: Operaciones sobre usuarios
 */

/**
 * @swagger
 * /api/usuarios:
 *   post:
 *     summary: Crea un nuevo usuario
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *               - email
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario creado
 *       500:
 *         description: Error al crear usuario
 */
// POST /api/usuarios
router.post('/', async (req, res) => {
  const { username, password, email } = req.body;
  await poolConnect;
  try {
    // 1) Hashear la contraseña
    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    // 2) Guardar el hash en lugar del texto plano
    const result = await pool
      .request()
      .input('username', sql.NVarChar(50), username)
      .input('password', sql.NVarChar(255), password_hash)
      .input('email',    sql.NVarChar(100), email)
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


router.use(auth);

/**
 * @swagger
 * /api/usuarios:
 *   get:
 *     summary: Obtiene todos los usuarios
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *       500:
 *         description: Error al obtener usuarios
 */
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

/**
 * @swagger
 * /api/usuarios/{id}:
 *   get:
 *     summary: Obtiene un usuario por ID
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Usuario encontrado
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error al obtener usuario
 */
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

const bcrypt = require('bcrypt');
const SALT_ROUNDS = 10;



/**
 * @swagger
 * /api/usuarios/{id}:
 *   put:
 *     summary: Actualiza un usuario por ID
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Usuario actualizado
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error al actualizar usuario
 */
// PUT /api/usuarios/:id
router.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  let { username, password, email } = req.body;
  await poolConnect;
  try {
    // Si el cliente envió nueva contraseña, la hasheamos
    let password_hash = null;
    if (password) {
      password_hash = await bcrypt.hash(password, SALT_ROUNDS);
    }

    // Construimos dinámicamente la query
    const query = `
      UPDATE UsuariosHugo
      SET username = @username,
          ${password_hash ? 'password = @password,' : ''}
          email    = @email
      OUTPUT INSERTED.*
      WHERE id = @id
    `;
    const request = pool.request()
      .input('id',       sql.Int,         id)
      .input('username', sql.NVarChar(50), username)
      .input('email',    sql.NVarChar(100), email);

    if (password_hash) {
      request.input('password', sql.NVarChar(255), password_hash);
    }

    const result = await request.query(query);
    if (!result.recordset.length) return res.status(404).send('Usuario no encontrado');
    res.json(result.recordset[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al actualizar usuario');
  }
});


/**
 * @swagger
 * /api/usuarios/{id}:
 *   delete:
 *     summary: Elimina un usuario por ID
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Usuario eliminado
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error al eliminar usuario
 */
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
