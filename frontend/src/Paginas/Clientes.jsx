import { useEffect, useState } from 'react';
import api from '../services/api';

const FORM_VACIO = { nomCliente: '', contacto: '', departamento: '', ciudad: '' };

function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const [form, setForm] = useState(FORM_VACIO);
  const [editandoId, setEditandoId] = useState(null);
  const [errorForm, setErrorForm] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const cargarClientes = () => {
    setCargando(true);
    api.get('/clientes')
      .then(response => {
        setClientes(response.data);
        setCargando(false);
      })
      .catch(err => {
        setError('No se pudo cargar la lista de clientes');
        setCargando(false);
        console.error(err);
      });
  };

  useEffect(() => {
    cargarClientes();
  }, []);

  const manejarCambio = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const iniciarEdicion = (cliente) => {
    setEditandoId(cliente.id_cliente);
    setForm({
      nomCliente: cliente.nomCliente,
      contacto: cliente.contacto || '',
      departamento: cliente.departamento || '',
      ciudad: cliente.ciudad || ''
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

    try {
      if (editandoId) {
        await api.put(`/clientes/${editandoId}`, form);
      } else {
        await api.post('/clientes', form);
      }
      setForm(FORM_VACIO);
      setEditandoId(null);
      cargarClientes();
    } catch (err) {
      const mensaje = err.response?.data?.mensaje || 'No se pudo guardar el cliente';
      setErrorForm(mensaje);
    } finally {
      setGuardando(false);
    }
  };

  const eliminarCliente = async (id, nombre) => {
    const confirmar = window.confirm(`¿Eliminar al cliente "${nombre}"? Esta acción no se puede deshacer.`);
    if (!confirmar) return;

    try {
      await api.delete(`/clientes/${id}`);
      cargarClientes();
    } catch (err) {
      alert(err.response?.data?.mensaje || 'No se pudo eliminar el cliente');
    }
  };

  return (
    <section className="seccion">
      <div className="seccion-encabezado">
        <span className="seccion-icono">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.7"/>
            <path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
          </svg>
        </span>
        <h1>Listado de Clientes</h1>
      </div>
      <p>Consulta, agrega, edita y elimina clientes — todo conectado a MySQL</p>

      <form className="form-crud" onSubmit={enviarFormulario}>
        <p className="form-crud-titulo">
          {editandoId ? `Editando cliente #${editandoId}` : 'Agregar nuevo cliente'}
        </p>
        <div className="form-crud-grid">
          <div>
            <label htmlFor="nomCliente">Nombre</label>
            <input id="nomCliente" name="nomCliente" value={form.nomCliente} onChange={manejarCambio} required />
          </div>
          <div>
            <label htmlFor="contacto">Contacto</label>
            <input id="contacto" name="contacto" value={form.contacto} onChange={manejarCambio} required />
          </div>
          <div>
            <label htmlFor="departamento">Departamento</label>
            <input id="departamento" name="departamento" value={form.departamento} onChange={manejarCambio} required />
          </div>
          <div>
            <label htmlFor="ciudad">Ciudad</label>
            <input id="ciudad" name="ciudad" value={form.ciudad} onChange={manejarCambio} required />
          </div>
        </div>

        {errorForm && <p className="form-crud-error">{errorForm}</p>}

        <div className="form-crud-acciones">
          <button type="submit" className="btn-crud btn-primario" disabled={guardando}>
            {guardando ? 'Guardando...' : editandoId ? 'Guardar cambios' : 'Agregar cliente'}
          </button>
          {editandoId && (
            <button type="button" className="btn-crud btn-secundario" onClick={cancelarEdicion}>
              Cancelar
            </button>
          )}
        </div>
      </form>

      {cargando && <p className="estado-info">Cargando clientes...</p>}
      {error && <p className="estado-error">{error}</p>}

      {!cargando && !error && (
        <div className="tabla-wrapper">
          <table className="tabla-datos">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Contacto</th>
                <th>Departamento</th>
                <th>Ciudad</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map(c => (
                <tr key={c.id_cliente}>
                  <td>{c.id_cliente}</td>
                  <td>{c.nomCliente}</td>
                  <td>{c.contacto}</td>
                  <td>{c.departamento}</td>
                  <td>{c.ciudad}</td>
                  <td>
                    <div className="celda-acciones">
                      <button
                        className="btn-icono"
                        title="Editar"
                        onClick={() => iniciarEdicion(c)}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5 17v3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
                        </svg>
                      </button>
                      <button
                        className="btn-icono btn-eliminar"
                        title="Eliminar"
                        onClick={() => eliminarCliente(c.id_cliente, c.nomCliente)}
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

export default Clientes;
