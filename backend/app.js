// ==============================================================================
// ARCHIVO PRINCIPAL - CONFIGURACIÓN Y SERVIDOR EXPRESS
// ==============================================================================
// Este archivo configura la aplicación Express, middlewares, rutas y manejo
// de errores. También inicia el servidor en el puerto 3000.
// Utiliza ES modules (import/export) en lugar de CommonJS (require).
// ==============================================================================

import createError from 'http-errors';
import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import cors from 'cors';
import { fileURLToPath } from 'url';

// Importación de las rutas de la aplicación desde la carpeta 'routes'
import indexRouter from './routes/index.js';
import usersRouter from './routes/users.js';
import productosRouter from './routes/Producto.js';   // CRUD de Productos (/productos)
import clientesRouter from './routes/Clientes.js';     // CRUD de Clientes (/clientes)
import ventasRouter from './routes/Ventas.js';         // CRUD de Ventas (/ventas)

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ==============================================================================
// CONFIGURACIÓN DEL MOTOR DE VISTAS (VIEW ENGINE)
// ==============================================================================
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// ==============================================================================
// MIDDLEWARES GENERALES DE LA APLICACIÓN
// ==============================================================================
app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// ==============================================================================
// REGISTRO DE RUTAS (ROUTING)
// ==============================================================================
app.use('/', indexRouter);                    // http://localhost:3000/
app.use('/users', usersRouter);               // http://localhost:3000/users
app.use('/productos', productosRouter);       // http://localhost:3000/productos (CRUD)
app.use('/clientes', clientesRouter);         // http://localhost:3000/clientes (CRUD)
app.use('/ventas', ventasRouter);             // http://localhost:3000/ventas (CRUD)

// ==============================================================================
// MANEJO DE ERRORES
// ==============================================================================
app.use(function(req, res, next) {
  next(createError(404));
});

app.use(function(err, req, res, next) {
  const status = err.status || 500;
  res.status(status).json({
    error: true,
    mensaje: err.message,
    estado: status,
    ambiente: req.app.get('env') === 'development' ? err : {}
  });
});

export default app;

// ==============================================================================
// INICIO DEL SERVIDOR
// ==============================================================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✓ Servidor escuchando en puerto ${PORT}`);
  console.log(`✓ Accede a: http://localhost:${PORT}`);
});
