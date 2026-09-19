import './App.css';

import Menu from './components/Menu.jsx';

import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Inicio from './Paginas/Inicio.jsx';
import Clientes from './Paginas/Clientes.jsx';
import Productos from './Paginas/Productos.jsx';
import Ventas from './Paginas/Ventas.jsx';

function App() {
  return (
    <BrowserRouter>
      <Menu />

      <main className="contenido">
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/productos" element={<Productos />} />
          <Route path="/ventas" element={<Ventas />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
