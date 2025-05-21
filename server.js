const express = require('express');
require('dotenv').config();
const app = express();

app.use(express.json());

// Importamos las rutas
const usuariosRouter = require('./routes/usuarios');
app.use('/api/usuarios', usuariosRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`API corriendo en http://localhost:${PORT}/api/usuarios`)
);
