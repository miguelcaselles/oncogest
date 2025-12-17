import { useState } from 'react';
import { Lock, AlertCircle } from 'lucide-react';
import styles from './Login.module.css';

interface LoginProps {
  onLogin: () => void;
}

const CORRECT_PASSWORD = 'Fuenlabradafa01';

export function Login({ onLogin }: LoginProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (password === CORRECT_PASSWORD) {
      sessionStorage.setItem('oncogest_authenticated', 'true');
      onLogin();
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div className={styles.container}>
      <div className={`${styles.card} ${shake ? styles.shake : ''}`}>
        <div className={styles.iconWrapper}>
          <Lock size={32} />
        </div>

        <h1 className={styles.title}>OncoGest</h1>
        <p className={styles.subtitle}>Sistema de Gestión Oncológica</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <input
              type="password"
              className={`input ${styles.input} ${error ? styles.inputError : ''}`}
              placeholder="Contraseña"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
              autoFocus
            />
          </div>

          {error && (
            <div className={styles.error}>
              <AlertCircle size={16} />
              <span>Contraseña incorrecta</span>
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            Acceder
          </button>
        </form>
      </div>
    </div>
  );
}
