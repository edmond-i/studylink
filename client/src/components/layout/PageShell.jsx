import { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import './PageShell.css';

/**
 * Main layout wrapper combining Navbar + Sidebar + content area
 * @param {Object} props - Props
 * @param {React.ReactNode} props.children - Page content
 */
function PageShell({ children }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="page-shell">
      <Navbar
        onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isMobileMenuOpen={isMobileMenuOpen}
      />

      <div className="page-container">
        <Sidebar
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />

        <main className="page-content">
          {children}
        </main>
      </div>
    </div>
  );
}

export default PageShell;
