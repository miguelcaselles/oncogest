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
    </BrowserRouter>
  );
}

export default App;
