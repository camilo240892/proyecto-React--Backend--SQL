// ==============================================================================
// MÓDULO CRUD DE PRODUCTOS (conectado a MySQL)
// ==============================================================================
// Se conserva el middleware "validar" de tu proyecto anterior (demostración de
// middlewares con retraso), ahora leyendo/escribiendo la tabla `productos`.
// ==============================================================================

import express from 'express';
import pool from '../db.js';

const router = express.Router();

// ==============================================================================
// Middleware de ejemplo: simula una validación/consulta que toma tiempo
// ==============================================================================
const validar = (req, res, next) => {
  console.log('Validando petición de productos...');
  setTimeout(() => {
    next();
  }, 1000);
};

// ==============================================================================
// 1. GET / - OBTENER TODOS LOS PRODUCTOS (con filtros opcionales por query)
// ==============================================================================
// GET http://localhost:3000/productos
// GET http://localhost:3000/productos?nomProducto=mouse
router.get('/', validar, async (req, res) => {
  try {
    let sql = 'SELECT * FROM productos WHERE 1=1';
    const params = [];

    if (req.query.id_producto) {
      sql += ' AND id_producto = ?';
      params.push(req.query.id_producto);
    }
    if (req.query.nomProducto) {
      sql += ' AND nomProducto LIKE ?';
      params.push(`%${req.query.nomProducto}%`);
    }
    if (req.query.cantidad) {
      sql += ' AND cantidad = ?';
      params.push(req.query.cantidad);
    }
    if (req.query.precio) {
      sql += ' AND precio = ?';
      params.push(req.query.precio);
    }

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: true, mensaje: err.message });
  }
});

// ==============================================================================
// 2. GET /:id - OBTENER UN PRODUCTO POR ID
// ==============================================================================
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM productos WHERE id_producto = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ mensaje: 'Producto no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: true, mensaje: err.message });
  }
});

// ==============================================================================
// 3. POST / - CREAR UN NUEVO PRODUCTO
// ==============================================================================
router.post('/', async (req, res) => {
  try {
    const { nomProducto, cantidad, precio } = req.body;
    const [result] = await pool.query(
      'INSERT INTO productos (nomProducto, cantidad, precio) VALUES (?, ?, ?)',
      [nomProducto, cantidad, precio]
    );

    res.status(201).json({
      mensaje: 'Producto creado exitosamente',
      producto: { id_producto: result.insertId, nomProducto, cantidad, precio }
    });
  } catch (err) {
    res.status(500).json({ error: true, mensaje: err.message });
  }
});

// ==============================================================================
// 4. PUT /:id - ACTUALIZAR UN PRODUCTO EXISTENTE
// ==============================================================================
router.put('/:id', async (req, res) => {
  try {
    const [existe] = await pool.query('SELECT * FROM productos WHERE id_producto = ?', [req.params.id]);
    if (existe.length === 0) return res.status(404).json({ mensaje: 'Producto no encontrado' });

    const actual = existe[0];
    const nomProducto = req.body.nomProducto ?? actual.nomProducto;
    const cantidad = req.body.cantidad ?? actual.cantidad;
    const precio = req.body.precio ?? actual.precio;

    await pool.query(
      'UPDATE productos SET nomProducto = ?, cantidad = ?, precio = ? WHERE id_producto = ?',
      [nomProducto, cantidad, precio, req.params.id]
    );

    res.json({
      mensaje: 'Producto actualizado exitosamente',
      producto: { id_producto: Number(req.params.id), nomProducto, cantidad, precio }
    });
  } catch (err) {
    res.status(500).json({ error: true, mensaje: err.message });
  }
});

// ==============================================================================
// 5. DELETE /:id - ELIMINAR UN PRODUCTO
// ==============================================================================
router.delete('/:id', async (req, res) => {
  try {
    const [existe] = await pool.query('SELECT * FROM productos WHERE id_producto = ?', [req.params.id]);
    if (existe.length === 0) return res.status(404).json({ mensaje: 'Producto no encontrado' });

    await pool.query('DELETE FROM productos WHERE id_producto = ?', [req.params.id]);
    res.json({ mensaje: 'Producto eliminado exitosamente', producto: existe[0] });
  } catch (err) {
    res.status(500).json({ error: true, mensaje: err.message });
  }
});

export default router;