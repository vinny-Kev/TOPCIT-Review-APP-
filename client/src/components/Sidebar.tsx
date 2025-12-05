import { motion } from 'framer-motion';

const sections: { id: 'dashboard' | 'flashcards' | 'tests' | 'progress' | 'notes'; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'fa-solid fa-chart-line' },
  { id: 'flashcards', label: 'Flashcards', icon: 'fa-solid fa-clone' },
  { id: 'tests', label: 'Tests', icon: 'fa-solid fa-list-check' },
  { id: 'progress', label: 'Progress', icon: 'fa-solid fa-chart-pie' },
  { id: 'notes', label: 'Notes', icon: 'fa-solid fa-book-open' }
];

interface Props {
  active: (typeof sections)[number]['id'];
  onChange: (section: (typeof sections)[number]['id']) => void;
  showAdmin?: boolean;
  onAdmin?: () => void;
}

const Sidebar = ({ active, onChange, showAdmin = false, onAdmin }: Props) => (
  <aside className="sidebar-panel">
    <div className="brand">🍎 TOPCIT</div>
    <nav>
      {sections.map((section) => (
        <motion.button
          key={section.id}
          className={section.id === active ? 'active' : ''}
          whileTap={{ scale: 0.97 }}
          onClick={() => onChange(section.id)}
        >
          <i className={section.icon} />
          <span>{section.label}</span>
        </motion.button>
      ))}
      {showAdmin && onAdmin && (
        <motion.button className="admin-link" whileTap={{ scale: 0.97 }} onClick={onAdmin}>
          <i className="fa-solid fa-screwdriver-wrench" />
          <span>Admin</span>
        </motion.button>
      )}
    </nav>
  </aside>
);

export default Sidebar;
