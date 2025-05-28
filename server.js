const authRouter = require('./routes/auth');
const express = require('express');
require('dotenv').config();
const app = express();
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());
app.use('/api/auth', authRouter);


// Importamos las rutas
const usuariosRouter = require('./routes/usuarios');
app.use('/api/usuarios', usuariosRouter);

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Usuarios y Auth',
      version: '1.0.0',
      description: 'Documentación de la API para gestión de usuarios y autenticación',
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Servidor local',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./routes/usuarios.js', './routes/auth.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const PORT = process.env.PORT || 3000;

// Solo iniciamos el servidor si no estamos en modo test
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () =>
    console.log(`API corriendo en http://localhost:${PORT}/api/usuarios`)
  );
}

module.exports = app;
