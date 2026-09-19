# Taller: React + Express + MySQL

Cumple exactamente lo pedido: proyecto React, proyecto Express, y base de
datos (esta última se conecta de última, como acordamos).

## Estructura entregada

```
proyecto-taller/
├── backend/                  (Express, ES modules)
│   ├── app.js
│   ├── package.json
│   └── routes/
│       ├── index.js
│       ├── users.js          (extra, no obligatorio)
│       ├── Clientes.js
│       ├── Producto.js
│       └── Ventas.js
└── frontend/                 (React con Vite)
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── .env.example
    └── src/
        ├── App.jsx
        ├── App.css
        ├── index.css
        ├── main.jsx
        ├── services/api.js
        ├── components/Menu.jsx
        └── Paginas/
            ├── Inicio.jsx
            ├── Clientes.jsx
            ├── Productos.jsx
            └── Ventas.jsx
```

## Comandos de terminal — EN ORDEN

Abre **dos terminales** (una para el backend, otra para el frontend). No hace
falta tocar MySQL todavía; ambos proyectos ya sirven datos en memoria.

### Terminal 1 — Backend (Express)

```bash
cd proyecto-taller/backend
npm install
npm run dev
```

Deberías ver:
```
✓ Servidor escuchando en puerto 3000
✓ Accede a: http://localhost:3000
```

Prueba en el navegador: http://localhost:3000/clientes

### Terminal 2 — Frontend (React + Vite)

```bash
cd proyecto-taller/frontend
npm install
cp .env.example .env
npm run dev
```

Deberías ver algo como:
```
  VITE ready
  ➜  Local:   http://localhost:5173/
```

Abre http://localhost:5173 en el navegador y navega por el menú:
Inicio, Clientes, Productos, Ventas.

## Notas para tu sustentación

- El frontend hace `axios.get('/clientes')`, `/productos`, `/ventas` contra
  el backend (puerto 3000), configurado con una URL base en `.env`
  (`VITE_API_URL`) para no "quemar" la URL en el código.
- `cors()` en el backend permite que el navegador (puerto 5173) le hable al
  backend (puerto 3000), aunque sean orígenes distintos.
- Los datos hoy viven en arreglos de JavaScript dentro de cada archivo de
  `routes/`. Cuando conectemos MySQL, sustituimos esos arreglos por consultas
  `SELECT * FROM tabla` con el mismo pool de conexión, y el frontend no
  cambia en nada porque los nombres de los campos (`id_cliente`,
  `nomCliente`, etc.) ya coinciden con las columnas de la base de datos.

## Base de datos (MySQL) — cuando llegue el momento

Te genero el script `schema.sql` con las 4 tablas del diagrama
(`clientes`, `productos`, `ventas`, `detalle_venta`, todos con id
`AUTO_INCREMENT`) apenas quieras dar ese paso. Ahí instalamos `mysql2` y
`dotenv` en el backend, y cambiamos únicamente la fuente de los datos.
