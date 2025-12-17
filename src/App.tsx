import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Login } from './components/Login';
import { Sobrantes } from './pages/Sobrantes';
import { Compras } from './pages/Compras';
import { Admin } from './pages/Admin';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const auth = sessionStorage.getItem('oncogest_authenticated');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

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
