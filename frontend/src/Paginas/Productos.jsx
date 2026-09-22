import { useEffect, useState } from 'react';
import api from '../services/api';

const FORM_VACIO = { nomProducto: '', cantidad: '', precio: '' };

const formatoMoneda = (valor) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(valor);

function Productos() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const [form, setForm] = useState(FORM_VACIO);
  const [editandoId, setEditandoId] = useState(null);
  const [errorForm, setErrorForm] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const cargarProductos = () => {
    setCargando(true);
    api.get('/productos')
      .then(response => {
        setProductos(response.data);
        setCargando(false);
      })
      .catch(err => {
        setError('No se pudo cargar la lista de productos');
        setCargando(false);
        console.error(err);
      });
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  const manejarCambio = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const iniciarEdicion = (producto) => {
    setEditandoId(producto.id_producto);
    setForm({
      nomProducto: producto.nomProducto,
      cantidad: producto.cantidad,
      precio: producto.precio
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
      nomProducto: form.nomProducto,
      cantidad: Number(form.cantidad),
      precio: Number(form.precio)
    };

    try {
      if (editandoId) {
        await api.put(`/productos/${editandoId}`, payload);
      } else {
        await api.post('/productos', payload);
      }
      setForm(FORM_VACIO);
      setEditandoId(null);
      cargarProductos();
    } catch (err) {
      const mensaje = err.response?.data?.mensaje || 'No se pudo guardar el producto';
      setErrorForm(mensaje);
    } finally {
      setGuardando(false);
    }
  };

  const eliminarProducto = async (id, nombre) => {
    const confirmar = window.confirm(`¿Eliminar el producto "${nombre}"? Esta acción no se puede deshacer.`);
    if (!confirmar) return;

    try {
      await api.delete(`/productos/${id}`);
      cargarProductos();
    } catch (err) {
      alert(err.response?.data?.mensaje || 'No se pudo eliminar el producto');
    }
  };

  return (
    <section className="seccion">
      <div className="seccion-encabezado">
        <span className="seccion-icono">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 8l8-4 8 4-8 4-8-4Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/>
            <path d="M4 8v8l8 4 8-4V8" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/>
            <path d="M12 12v8" stroke="currentColor" strokeWidth="1.7"/>
          </svg>
        </span>
        <h1>Listado de Productos</h1>
      </div>
      <p>Consulta, agrega, edita y elimina productos — todo conectado a MySQL</p>

      <form className="form-crud" onSubmit={enviarFormulario}>
        <p className="form-crud-titulo">
          {editandoId ? `Editando producto #${editandoId}` : 'Agregar nuevo producto'}
        </p>
        <div className="form-crud-grid">
          <div>
            <label htmlFor="nomProducto">Nombre</label>
            <input id="nomProducto" name="nomProducto" value={form.nomProducto} onChange={manejarCambio} required />
          </div>
          <div>
            <label htmlFor="cantidad">Cantidad</label>
            <input id="cantidad" name="cantidad" type="number" min="0" value={form.cantidad} onChange={manejarCambio} required />
          </div>
          <div>
            <label htmlFor="precio">Precio</label>
            <input id="precio" name="precio" type="number" min="0" value={form.precio} onChange={manejarCambio} required />
          </div>
        </div>

        {errorForm && <p className="form-crud-error">{errorForm}</p>}

        <div className="form-crud-acciones">
          <button type="submit" className="btn-crud btn-primario" disabled={guardando}>
            {guardando ? 'Guardando...' : editandoId ? 'Guardar cambios' : 'Agregar producto'}
          </button>
          {editandoId && (
            <button type="button" className="btn-crud btn-secundario" onClick={cancelarEdicion}>
              Cancelar
            </button>
          )}
        </div>
      </form>

      {cargando && <p className="estado-info">Cargando productos...</p>}
      {error && <p className="estado-error">{error}</p>}

      {!cargando && !error && (
        <div className="tabla-wrapper">
          <table className="tabla-datos">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Cantidad</th>
                <th>Precio</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.map(p => (
                <tr key={p.id_producto}>
                  <td>{p.id_producto}</td>
                  <td>{p.nomProducto}</td>
                  <td>{p.cantidad}</td>
                  <td className="celda-monto">{formatoMoneda(p.precio)}</td>
                  <td>
                    <div className="celda-acciones">
                      <button
                        className="btn-icono"
                        title="Editar"
                        onClick={() => iniciarEdicion(p)}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5 17v3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
                        </svg>
                      </button>
                      <button
                        className="btn-icono btn-eliminar"
                        title="Eliminar"
                        onClick={() => eliminarProducto(p.id_producto, p.nomProducto)}
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

export default Productos;
