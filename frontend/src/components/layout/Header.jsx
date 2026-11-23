import { Menu } from 'lucide-react';
import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import { NAV_LINKS, ROUTES } from '@/lib/constants';
import Logo from './Logo';
import MobileMenu from './MobileMenu';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close the drawer on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <header className={cn('sticky top-0 z-50 bg-white transition-shadow', scrolled ? 'shadow-md' : 'border-b border-border')}>
      <div className="container-page flex h-16 items-center justify-between gap-4 lg:h-20">
        <Logo />

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    cn(
                      'relative inline-flex h-11 items-center px-3.5 text-[15px] font-semibold transition-colors',
                      'after:absolute after:inset-x-3.5 after:bottom-1 after:h-0.5 after:rounded after:bg-accent after:transition-transform',
                      isActive ? 'text-primary after:scale-x-100' : 'text-primary-500 after:scale-x-0 hover:text-primary hover:after:scale-x-100',
                    )
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <Button to={ROUTES.contact} className="hidden lg:inline-flex">
            Get a Quote
          </Button>
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-primary hover:bg-muted lg:hidden"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </header>
  );
}
