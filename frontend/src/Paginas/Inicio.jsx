import { useEffect, useState } from 'react';
import api from '../services/api';

function Inicio() {
  const [stats, setStats] = useState({
    clientes: null,
    productos: null,
    totalVentas: null
  });

  useEffect(() => {
    Promise.all([
      api.get('/clientes'),
      api.get('/productos'),
      api.get('/ventas')
    ])
      .then(([resClientes, resProductos, resVentas]) => {
        const totalVentas = resVentas.data.reduce(
          (suma, venta) => suma + Number(venta.total || 0),
          0
        );

        setStats({
          clientes: resClientes.data.length,
          productos: resProductos.data.length,
          totalVentas
        });
      })
      .catch(err => console.error('No se pudieron cargar las estadísticas', err));
  }, []);

  const formatoMoneda = (valor) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(valor);

  return (
    <section className="hero">
      <p className="hero-eyebrow">Taller React + Express + MySQL</p>
      <h1>Panel de Ventas</h1>
      <p>
        Este panel consulta el backend en tiempo real: cada número de abajo
        viene de una petición GET a tu API, conectada a MySQL.
      </p>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-numero">
            {stats.clientes === null ? '—' : stats.clientes}
          </div>
          <div className="stat-etiqueta">Clientes registrados</div>
        </div>

        <div className="stat-card">
          <div className="stat-numero">
            {stats.productos === null ? '—' : stats.productos}
          </div>
          <div className="stat-etiqueta">Productos en catálogo</div>
        </div>

        <div className="stat-card">
          <div className="stat-numero">
            {stats.totalVentas === null ? '—' : formatoMoneda(stats.totalVentas)}
          </div>
          <div className="stat-etiqueta">Total vendido</div>
        </div>
      </div>
    </section>
  );
}

export default Inicio;
