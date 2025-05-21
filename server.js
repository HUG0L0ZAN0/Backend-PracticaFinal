const authRouter = require('./routes/auth');
const express = require('express');
require('dotenv').config();
const app = express();
const cors = require('cors');

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());
app.use('/api/auth', authRouter);


// Importamos las rutas
const usuariosRouter = require('./routes/usuarios');
app.use('/api/usuarios', usuariosRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`API corriendo en http://localhost:${PORT}/api/usuarios`)
);
