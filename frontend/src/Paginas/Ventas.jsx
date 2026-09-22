import { useEffect, useState } from 'react';
import api from '../services/api';

const FORM_VACIO = { id_cliente: '', fecha_venta: '', total: '', estado: 'pendiente' };

const formatoMoneda = (valor) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(valor);

const formatoFecha = (fecha) => {
  if (!fecha) return '—';
  const soloFecha = String(fecha).slice(0, 10);
  const [anio, mes, dia] = soloFecha.split('-');
  return `${dia}/${mes}/${anio}`;
};

function claseBadge(estado) {
  const valor = (estado || '').toLowerCase();
  if (valor === 'completada') return 'badge-estado badge-completada';
  if (valor === 'cancelada') return 'badge-estado badge-cancelada';
  return 'badge-estado badge-pendiente';
}

function Ventas() {
  const [ventas, setVentas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const [form, setForm] = useState(FORM_VACIO);
  const [editandoId, setEditandoId] = useState(null);
  const [errorForm, setErrorForm] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const cargarDatos = () => {
    setCargando(true);
    Promise.all([api.get('/ventas'), api.get('/clientes')])
      .then(([resVentas, resClientes]) => {
        setVentas(resVentas.data);
        setClientes(resClientes.data);
        setCargando(false);
      })
      .catch(err => {
        setError('No se pudo cargar la lista de ventas');
        setCargando(false);
        console.error(err);
      });
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const manejarCambio = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const iniciarEdicion = (venta) => {
    setEditandoId(venta.id_venta);
    setForm({
      id_cliente: venta.id_cliente,
      fecha_venta: String(venta.fecha_venta).slice(0, 10),
      total: venta.total,
      estado: venta.estado
    });
    setErrorForm(null);
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setForm(FORM_VACIO);
    setErrorForm(null);
  };

  const enviarFormulario = async (e) => {
    e.preventDefault();
    setErrorForm(null);
    setGuardando(true);

    const payload = {
      id_cliente: Number(form.id_cliente),
      fecha_venta: form.fecha_venta,
      total: Number(form.total),
      estado: form.estado
    };

    try {
      if (editandoId) {
        await api.put(`/ventas/${editandoId}`, payload);
      } else {
        await api.post('/ventas', payload);
      }
      setForm(FORM_VACIO);
      setEditandoId(null);
      cargarDatos();
    } catch (err) {
      const mensaje = err.response?.data?.mensaje || 'No se pudo guardar la venta';
      setErrorForm(mensaje);
    } finally {
      setGuardando(false);
    }
  };

  const eliminarVenta = async (id) => {
    const confirmar = window.confirm(`¿Eliminar la venta #${id}? Esta acción no se puede deshacer.`);
    if (!confirmar) return;

    try {
      await api.delete(`/ventas/${id}`);
      cargarDatos();
    } catch (err) {
      alert(err.response?.data?.mensaje || 'No se pudo eliminar la venta');
    }
  };

  return (
    <section className="seccion">
      <div className="seccion-encabezado">
        <span className="seccion-icono">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 19V5a1 1 0 0 1 1-1h9l6 6v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/>
            <path d="M14 4v5a1 1 0 0 0 1 1h5" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/>
            <path d="M8 13h8M8 16h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </span>
        <h1>Listado de Ventas</h1>
      </div>
      <p>Consulta, agrega, edita y elimina ventas — todo conectado a MySQL</p>

      <form className="form-crud" onSubmit={enviarFormulario}>
        <p className="form-crud-titulo">
          {editandoId ? `Editando venta #${editandoId}` : 'Agregar nueva venta'}
        </p>
        <div className="form-crud-grid">
          <div>
            <label htmlFor="id_cliente">Cliente</label>
            <select id="id_cliente" name="id_cliente" value={form.id_cliente} onChange={manejarCambio} required>
              <option value="">Selecciona un cliente</option>
              {clientes.map(c => (
                <option key={c.id_cliente} value={c.id_cliente}>{c.nomCliente}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="fecha_venta">Fecha</label>
            <input id="fecha_venta" name="fecha_venta" type="date" value={form.fecha_venta} onChange={manejarCambio} required />
          </div>
          <div>
            <label htmlFor="total">Total</label>
            <input id="total" name="total" type="number" min="0" value={form.total} onChange={manejarCambio} required />
          </div>
          <div>
            <label htmlFor="estado">Estado</label>
            <select id="estado" name="estado" value={form.estado} onChange={manejarCambio}>
              <option value="pendiente">Pendiente</option>
              <option value="completada">Completada</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>
        </div>

        {errorForm && <p className="form-crud-error">{errorForm}</p>}

        <div className="form-crud-acciones">
          <button type="submit" className="btn-crud btn-primario" disabled={guardando}>
            {guardando ? 'Guardando...' : editandoId ? 'Guardar cambios' : 'Agregar venta'}
          </button>
          {editandoId && (
            <button type="button" className="btn-crud btn-secundario" onClick={cancelarEdicion}>
              Cancelar
            </button>
          )}
        </div>
      </form>

      {cargando && <p className="estado-info">Cargando ventas...</p>}
      {error && <p className="estado-error">{error}</p>}

      {!cargando && !error && (
        <div className="tabla-wrapper">
          <table className="tabla-datos">
            <thead>
              <tr>
                <th>ID Venta</th>
                <th>Cliente</th>
                <th>Fecha</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ventas.map(v => (
                <tr key={v.id_venta}>
                  <td>{v.id_venta}</td>
                  <td>{v.nomCliente}</td>
                  <td>{formatoFecha(v.fecha_venta)}</td>
                  <td className="celda-monto">{formatoMoneda(v.total)}</td>
                  <td><span className={claseBadge(v.estado)}>{v.estado}</span></td>
                  <td>
                    <div className="celda-acciones">
                      <button
                        className="btn-icono"
                        title="Editar"
                        onClick={() => iniciarEdicion(v)}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5 17v3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
                        </svg>
                      </button>
                      <button
                        className="btn-icono btn-eliminar"
                        title="Eliminar"
                        onClick={() => eliminarVenta(v.id_venta)}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M5 7h14M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m2 0-1 13a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1L6 7h12Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default Ventas;
