import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';

interface Props {
  onToggleTheme: () => void;
  theme: 'light' | 'dark';
}

const HeaderBar = ({ onToggleTheme, theme }: Props) => {
  const { user, logout } = useAuth();

  return (
    <header className="topbar">
      <div>
        <h1>ITCS Certification Prep</h1>
        <p>Stay calm, study smart, conquer TOPCIT.</p>
      </div>
      <div className="topbar-controls">
        <button className="ghost" onClick={onToggleTheme}>
          <i className={theme === 'light' ? 'fa-solid fa-moon' : 'fa-solid fa-sun'} />
        </button>
        <motion.div className="user-chip" whileHover={{ scale: 1.02 }}>
          <div>
            <strong>{user?.name}</strong>
            <small>
              {user?.email}
              {user?.role ? ` · ${user.role}` : ''}
            </small>
          </div>
          <button className="ghost" onClick={logout}>
            Logout
          </button>
        </motion.div>
      </div>
    </header>
  );
};

export default HeaderBar;
