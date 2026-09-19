// ==============================================================================
// MÓDULO CRUD DE VENTAS (conectado a MySQL)
// ==============================================================================
// Antes el nombre del cliente se "simulaba" buscando en el array de Clientes.js.
// Ahora se obtiene con un JOIN real entre `ventas` y `clientes`.
// ==============================================================================

import express from 'express';
import pool from '../db.js';

const router = express.Router();

// Consulta base reutilizada por GET /, GET /:id, POST y PUT, para siempre
// devolver la venta con el nombre del cliente incluido (equivalente al JOIN).
const SELECT_CON_CLIENTE = `
  SELECT v.*, c.nomCliente
  FROM ventas v
  JOIN clientes c ON v.id_cliente = c.id_cliente
`;

// ==============================================================================
// MIDDLEWARE DE VALIDACIÓN
// ==============================================================================
const validarVenta = async (req, res, next) => {
  const { id_cliente, fecha_venta, total, estado } = req.body;

  if (id_cliente === undefined || isNaN(Number(id_cliente))) {
    return res.status(400).json({ error: true, mensaje: 'El id_cliente es obligatorio y debe ser numérico' });
  }
  if (!fecha_venta) {
    return res.status(400).json({ error: true, mensaje: 'La fecha de venta es obligatoria' });
  }
  if (total === undefined || isNaN(Number(total))) {
    return res.status(400).json({ error: true, mensaje: 'El total debe ser un número válido' });
  }
  if (!estado || typeof estado !== 'string' || estado.trim() === '') {
    return res.status(400).json({ error: true, mensaje: 'El estado es obligatorio' });
  }

  try {
    const [cliente] = await pool.query('SELECT id_cliente FROM clientes WHERE id_cliente = ?', [id_cliente]);
    if (cliente.length === 0) {
      return res.status(400).json({ error: true, mensaje: 'El cliente indicado no existe' });
    }
    next();
  } catch (err) {
    res.status(500).json({ error: true, mensaje: err.message });
  }
};

// ==============================================================================
// 1. GET / - OBTENER TODAS LAS VENTAS (con filtros opcionales por query)
// ==============================================================================
// GET http://localhost:3000/ventas
// GET http://localhost:3000/ventas?estado=pendiente
router.get('/', async (req, res) => {
  try {
    let sql = SELECT_CON_CLIENTE + ' WHERE 1=1';
    const params = [];

    if (req.query.id_venta) {
      sql += ' AND v.id_venta = ?';
      params.push(req.query.id_venta);
    }
    if (req.query.id_cliente) {
      sql += ' AND v.id_cliente = ?';
      params.push(req.query.id_cliente);
    }
    if (req.query.estado) {
      sql += ' AND v.estado = ?';
      params.push(req.query.estado);
    }

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: true, mensaje: err.message });
  }
});

// ==============================================================================
// 2. GET /:id - OBTENER UNA VENTA POR ID
// ==============================================================================
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(SELECT_CON_CLIENTE + ' WHERE v.id_venta = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ mensaje: 'Venta no encontrada' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: true, mensaje: err.message });
  }
});

// ==============================================================================
// 3. POST / - CREAR UNA NUEVA VENTA
// ==============================================================================
router.post('/', validarVenta, async (req, res) => {
  try {
    const { id_cliente, fecha_venta, total, estado } = req.body;
    const [result] = await pool.query(
      'INSERT INTO ventas (id_cliente, fecha_venta, total, estado) VALUES (?, ?, ?, ?)',
      [id_cliente, fecha_venta, total, estado]
    );

    const [nueva] = await pool.query(SELECT_CON_CLIENTE + ' WHERE v.id_venta = ?', [result.insertId]);
    res.status(201).json({ mensaje: 'Venta creada exitosamente', venta: nueva[0] });
  } catch (err) {
    res.status(500).json({ error: true, mensaje: err.message });
  }
});

// ==============================================================================
// 4. PUT /:id - ACTUALIZAR UNA VENTA EXISTENTE
// ==============================================================================
router.put('/:id', async (req, res) => {
  try {
    const [existe] = await pool.query('SELECT * FROM ventas WHERE id_venta = ?', [req.params.id]);
    if (existe.length === 0) return res.status(404).json({ mensaje: 'Venta no encontrada' });

    const actual = existe[0];
    const id_cliente = req.body.id_cliente ?? actual.id_cliente;
    const fecha_venta = req.body.fecha_venta ?? actual.fecha_venta;
    const total = req.body.total ?? actual.total;
    const estado = req.body.estado ?? actual.estado;

    await pool.query(
      'UPDATE ventas SET id_cliente = ?, fecha_venta = ?, total = ?, estado = ? WHERE id_venta = ?',
      [id_cliente, fecha_venta, total, estado, req.params.id]
    );

    const [actualizada] = await pool.query(SELECT_CON_CLIENTE + ' WHERE v.id_venta = ?', [req.params.id]);
    res.json({ mensaje: 'Venta actualizada exitosamente', venta: actualizada[0] });
  } catch (err) {
    res.status(500).json({ error: true, mensaje: err.message });
  }
});

// ==============================================================================
// 5. DELETE /:id - ELIMINAR UNA VENTA
// ==============================================================================
router.delete('/:id', async (req, res) => {
  try {
    const [existe] = await pool.query('SELECT * FROM ventas WHERE id_venta = ?', [req.params.id]);
    if (existe.length === 0) return res.status(404).json({ mensaje: 'Venta no encontrada' });

    await pool.query('DELETE FROM ventas WHERE id_venta = ?', [req.params.id]);
    res.json({ mensaje: 'Venta eliminada exitosamente', venta: existe[0] });
  } catch (err) {
    res.status(500).json({ error: true, mensaje: err.message });
  }
});

export default router;