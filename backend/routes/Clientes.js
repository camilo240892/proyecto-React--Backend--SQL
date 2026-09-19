// ==============================================================================
// MÓDULO CRUD DE CLIENTES (conectado a MySQL)
// ==============================================================================
// Mismo comportamiento que la versión en memoria, pero ahora usando la tabla
// `clientes` real a través del pool de conexión (db.js).
// ==============================================================================

import express from 'express';
import pool from '../db.js';

const router = express.Router();

// ==============================================================================
// MIDDLEWARE DE VALIDACIÓN (igual que antes)
// ==============================================================================
const validarCliente = (req, res, next) => {
  const { nomCliente, contacto, departamento, ciudad } = req.body;

  if (!nomCliente || typeof nomCliente !== 'string' || nomCliente.trim() === '') {
    return res.status(400).json({ error: true, mensaje: 'El nombre del cliente es obligatorio' });
  }
  if (!contacto || typeof contacto !== 'string' || contacto.trim() === '') {
    return res.status(400).json({ error: true, mensaje: 'El contacto es obligatorio' });
  }
  if (!departamento || typeof departamento !== 'string' || departamento.trim() === '') {
    return res.status(400).json({ error: true, mensaje: 'El departamento es obligatorio' });
  }
  if (!ciudad || typeof ciudad !== 'string' || ciudad.trim() === '') {
    return res.status(400).json({ error: true, mensaje: 'La ciudad es obligatoria' });
  }

  next();
};

// ==============================================================================
// 1. GET / - OBTENER TODOS LOS CLIENTES (con filtros opcionales por query)
// ==============================================================================
// GET http://localhost:3000/clientes
// GET http://localhost:3000/clientes?ciudad=Bogota
router.get('/', async (req, res) => {
  try {
    let sql = 'SELECT * FROM clientes WHERE 1=1';
    const params = [];

    if (req.query.id_cliente) {
      sql += ' AND id_cliente = ?';
      params.push(req.query.id_cliente);
    }
    if (req.query.nomCliente) {
      sql += ' AND nomCliente LIKE ?';
      params.push(`%${req.query.nomCliente}%`);
    }
    if (req.query.ciudad) {
      sql += ' AND ciudad = ?';
      params.push(req.query.ciudad);
    }
    if (req.query.departamento) {
      sql += ' AND departamento = ?';
      params.push(req.query.departamento);
    }

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: true, mensaje: err.message });
  }
});

// ==============================================================================
// 2. GET /:id - OBTENER UN CLIENTE POR ID
// ==============================================================================
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM clientes WHERE id_cliente = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ mensaje: 'Cliente no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: true, mensaje: err.message });
  }
});

// ==============================================================================
// 3. POST / - CREAR UN NUEVO CLIENTE
// ==============================================================================
router.post('/', validarCliente, async (req, res) => {
  try {
    const { nomCliente, contacto, departamento, ciudad } = req.body;
    const [result] = await pool.query(
      'INSERT INTO clientes (nomCliente, contacto, departamento, ciudad) VALUES (?, ?, ?, ?)',
      [nomCliente, contacto, departamento, ciudad]
    );

    res.status(201).json({
      mensaje: 'Cliente creado exitosamente',
      cliente: { id_cliente: result.insertId, nomCliente, contacto, departamento, ciudad }
    });
  } catch (err) {
    res.status(500).json({ error: true, mensaje: err.message });
  }
});

// ==============================================================================
// 4. PUT /:id - ACTUALIZAR UN CLIENTE EXISTENTE
// ==============================================================================
router.put('/:id', async (req, res) => {
  try {
    const [existe] = await pool.query('SELECT * FROM clientes WHERE id_cliente = ?', [req.params.id]);
    if (existe.length === 0) return res.status(404).json({ mensaje: 'Cliente no encontrado' });

    const actual = existe[0];
    const nomCliente = req.body.nomCliente ?? actual.nomCliente;
    const contacto = req.body.contacto ?? actual.contacto;
    const departamento = req.body.departamento ?? actual.departamento;
    const ciudad = req.body.ciudad ?? actual.ciudad;

    await pool.query(
      'UPDATE clientes SET nomCliente = ?, contacto = ?, departamento = ?, ciudad = ? WHERE id_cliente = ?',
      [nomCliente, contacto, departamento, ciudad, req.params.id]
    );

    res.json({
      mensaje: 'Cliente actualizado exitosamente',
      cliente: { id_cliente: Number(req.params.id), nomCliente, contacto, departamento, ciudad }
    });
  } catch (err) {
    res.status(500).json({ error: true, mensaje: err.message });
  }
});

// ==============================================================================
// 5. DELETE /:id - ELIMINAR UN CLIENTE
// ==============================================================================
router.delete('/:id', async (req, res) => {
  try {
    const [existe] = await pool.query('SELECT * FROM clientes WHERE id_cliente = ?', [req.params.id]);
    if (existe.length === 0) return res.status(404).json({ mensaje: 'Cliente no encontrado' });

    await pool.query('DELETE FROM clientes WHERE id_cliente = ?', [req.params.id]);
    res.json({ mensaje: 'Cliente eliminado exitosamente', cliente: existe[0] });
  } catch (err) {
    res.status(500).json({ error: true, mensaje: err.message });
  }
});

export default router;