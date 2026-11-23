import { ChevronDown, ExternalLink, LogOut, Menu, UserCog } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/cn';
import { ROUTES } from '@/lib/constants';
import { useAuth } from '../auth/AuthProvider';
import { pageTitle } from './navItems';

export default function Topbar({ onMenu }) {
  const { admin, logout } = useAuth();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => !menuRef.current?.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-white px-4 sm:px-6">
      <button
        type="button"
        onClick={onMenu}
        className="-ml-2 inline-flex h-11 w-11 items-center justify-center rounded-lg text-primary hover:bg-muted lg:hidden"
        aria-label="Open navigation"
      >
        <Menu className="h-6 w-6" />
      </button>
      <h1 className="min-w-0 flex-1 truncate text-lg font-bold text-primary">{pageTitle(pathname)}</h1>

      <a
        href="/"
        target="_blank"
        rel="noopener noreferrer"
        className="hidden min-h-[44px] items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-primary-500 hover:bg-muted hover:text-primary sm:inline-flex"
      >
        <ExternalLink className="h-4 w-4" aria-hidden="true" /> View Website
      </a>

      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-haspopup="menu"
          className="flex min-h-[44px] items-center gap-2 rounded-lg px-2 hover:bg-muted"
        >
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-accent text-sm font-bold text-primary">
            {(admin?.name || 'A').charAt(0).toUpperCase()}
          </span>
          <span className="hidden max-w-[140px] truncate text-sm font-semibold text-primary md:block">{admin?.name}</span>
          <ChevronDown className={cn('h-4 w-4 text-ink-muted transition-transform', open && 'rotate-180')} aria-hidden="true" />
        </button>
        {open && (
          <div role="menu" className="absolute right-0 mt-2 w-56 animate-scale-in overflow-hidden rounded-lg border border-border bg-white py-1 shadow-card-hover">
            <div className="border-b border-border px-4 py-3">
              <p className="truncate text-sm font-semibold text-primary">{admin?.name}</p>
              <p className="truncate text-xs text-ink-muted">{admin?.email}</p>
            </div>
            <Link role="menuitem" to={ROUTES.admin.account} className="flex min-h-[44px] items-center gap-2 px-4 text-sm hover:bg-muted">
              <UserCog className="h-4 w-4" aria-hidden="true" /> My Account
            </Link>
            <a role="menuitem" href="/" target="_blank" rel="noopener noreferrer" className="flex min-h-[44px] items-center gap-2 px-4 text-sm hover:bg-muted sm:hidden">
              <ExternalLink className="h-4 w-4" aria-hidden="true" /> View Website
            </a>
            <button role="menuitem" type="button" onClick={logout} className="flex min-h-[44px] w-full items-center gap-2 px-4 text-sm text-danger hover:bg-red-50">
              <LogOut className="h-4 w-4" aria-hidden="true" /> Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
