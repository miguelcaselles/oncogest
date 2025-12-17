import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Sobrantes } from './pages/Sobrantes';
import { Compras } from './pages/Compras';
import { Admin } from './pages/Admin';

function App() {
  return (
    <BrowserRouter>
      <Header />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Sobrantes />} />
          <Route path="/compras" element={<Compras />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>
      <footer
        style={{
          textAlign: 'center',
          padding: '1.5rem',
          color: '#9ca3af',
          fontSize: '0.8125rem',
          borderTop: '1px solid #f3f4f6',
          backgroundColor: '#fafafa',
        }}
      >
        Desarrollado por <strong style={{ color: '#0d9488' }}>Miguel Caselles</strong>
      </footer>
    </BrowserRouter>
  );
}

export default App;
