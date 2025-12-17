import { Link, useLocation } from 'react-router-dom';
import { Beaker, Settings, Package } from 'lucide-react';
import styles from './Header.module.css';

export function Header() {
  const location = useLocation();

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo}>
          <div className={styles.logoIcon}>
            <Beaker size={24} />
          </div>
          <span className={styles.logoText}>OncoGest</span>
        </Link>

        <nav className={styles.nav}>
          <Link
            to="/"
            className={`${styles.navLink} ${location.pathname === '/' ? styles.active : ''}`}
          >
            <Beaker size={18} />
            <span>Sobrantes</span>
          </Link>
          <Link
            to="/compras"
            className={`${styles.navLink} ${location.pathname === '/compras' ? styles.active : ''}`}
          >
            <Package size={18} />
            <span>Compras</span>
          </Link>
          <Link
            to="/admin"
            className={`${styles.navLink} ${location.pathname === '/admin' ? styles.active : ''}`}
          >
            <Settings size={18} />
            <span>Admin</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
