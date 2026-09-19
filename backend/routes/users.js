// ==============================================================================
// RUTA DE USUARIOS - USERS
// ==============================================================================
// Este módulo se conserva del taller anterior como demostración de los 5
// middlewares (verificar, datosPeticion, validación de body, validación de
// header y medición de tiempo). No es requerido por el enunciado del nuevo
// taller (clientes / productos / ventas), pero se deja disponible por si el
// profesor pregunta por el manejo de middlewares personalizados.
// ==============================================================================

import express from 'express';

const router = express.Router();

const users = [
  {
    nombre: 'admin',
    password: '1234'
  }
];

// ==============================================================================
// MIDDLEWARES
// ==============================================================================

const verificar = (req, res, next) => {
  console.log('Verificando Petición!!');
  setTimeout(() => {
    next();
  }, 3000);
};

function datosPeticion(req, res, next) {
  console.log(`${req.originalUrl} , ${JSON.stringify(req.body)}, ${req.method}`);
  next();
}

const VdatosLogin = (req, res, next) => {
  if (!req.body.nombre || req.body.nombre.trim() === '') {
    return res.status(400).json({ error: true, mensaje: 'El nombre es obligatorio' });
  }
  if (!req.body.password || req.body.password.trim() === '') {
    return res.status(400).json({ error: true, mensaje: 'La contraseña es obligatoria' });
  }
  next();
};

const verificarUsuario = (req, res, next) => {
  const usuario = req.headers.usuario;
  if (usuario == 'admin') {
    next();
  } else {
    res.status(401).send('Usuario no autorizado!!');
  }
};

const medirTiempo = (req, res, next) => {
  const inicio = Date.now();
  res.on('finish', () => {
    const tiempo = Date.now() - inicio;
    console.log(`${req.method} ${req.url} - ${tiempo}ms`);
  });
  next();
};

router.use(datosPeticion);
router.use(medirTiempo);

router.get('/', verificarUsuario, verificar, function(req, res, next) {
  res.json({
    mensaje: 'Ruta user del Framework',
    usuarios: users
  });
});

router.post('/', VdatosLogin, function ValidarUsuario(req, res) {
  const { nombre, password } = req.body;

  const usuarioEncontrado = users.find(
    (u) => u.nombre === nombre.trim() && u.password === password
  );

  if (usuarioEncontrado) {
    return res.status(200).json({
      error: false,
      mensaje: '¡Inicio de sesión exitoso en el backend!',
      usuario: { nombre: usuarioEncontrado.nombre }
    });
  } else {
    return res.status(401).json({
      error: true,
      mensaje: 'Nombre o contraseña incorrectos'
    });
  }
});

export default router;
