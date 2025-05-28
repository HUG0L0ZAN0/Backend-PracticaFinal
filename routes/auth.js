// routes/auth.js
require('dotenv').config();
const express = require('express');
const jwt     = require('jsonwebtoken');
const bcrypt  = require('bcrypt');
const { pool, poolConnect, sql } = require('../dbconfig');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Operaciones de autenticación
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Inicia sesión y obtiene un token JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token JWT generado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       401:
 *         description: Usuario o contraseña incorrectos
 *       500:
 *         description: Error en el login
 */

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  await poolConnect;
  try {
    // 1) Buscar usuario
    const result = await pool
      .request()
      .input('username', sql.NVarChar(50), username)
      .query('SELECT * FROM UsuariosHugo WHERE username = @username');
    const user = result.recordset[0];

    // 2) Validar existencia
    if (!user) {
      return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
    }

    // 3) Comparar la contraseña con el hash
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
    }

    // 4) Generar token
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // 5) Devolver token
    res.json({ token });
  } catch (err) {
    console.error('Error en POST /api/auth/login:', err);
    res.status(500).json({ message: 'Error en el login' });
  }
});

module.exports = router;
