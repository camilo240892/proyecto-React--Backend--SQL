// ==============================================================================
// RUTA RAÍZ - PÁGINA DE INICIO
// ==============================================================================
// Esta ruta maneja peticiones GET a http://localhost:3000/
// Renderiza una página HTML usando el motor de vistas Jade
// Utiliza ES modules (import/export)
// ==============================================================================

import express from 'express';

const router = express.Router();

/**
 * GET / - Renderiza la página de inicio
 *
 * Método: GET
 * URL: http://localhost:3000/
 * Respuesta: HTML renderizado desde la vista 'index.jade' (si existe)
 *
 * Parámetros:
 *   - title: 'Express' - Título enviado a la vista para personalizar la página
 */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

export default router;
