import { useEffect, useState } from 'react';
import api from '../services/api';

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
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/ventas')
      .then(response => {
        setVentas(response.data);
        setCargando(false);
      })
      .catch(err => {
        setError('No se pudo cargar la lista de ventas');
        setCargando(false);
        console.error(err);
      });
  }, []);

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
      <p>Datos obtenidos con una petición GET a /ventas</p>

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
