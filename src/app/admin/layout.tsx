'use client';

import { useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { IconButton } from '@/components/ui/IconButton';
import styles from './layout.module.css';

const NAV_LINKS = [
  { href: '/admin/genres', label: 'Géneros' },
  { href: '/admin/artists', label: 'Artistas' },
  { href: '/admin/songs', label: 'Canciones' },
  { href: '/admin/tabs', label: 'Tabs' },
  { href: '/admin/users', label: 'Usuarios' },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [hydrated, setHydrated] = useState(false);

  const user = useAuthStore((s) => s.user);
  const validateSession = useAuthStore((s) => s.validateSession);
  const logoutSupabase = useAuthStore((s) => s.logoutSupabase);

  const onHydrated = useCallback(async () => {
    const valid = await validateSession();
    if (!valid || useAuthStore.getState().user?.role !== 'ADMIN') {
      router.push('/');
      return;
    }
    setHydrated(true);
  }, [validateSession, router]);

  useEffect(() => {
    const unsub = useAuthStore.persist.onFinishHydration(onHydrated);
    useAuthStore.persist.rehydrate();
    return unsub;
  }, [onHydrated]);

  const handleLogout = useCallback(async () => {
    await logoutSupabase();
    router.push('/login');
  }, [logoutSupabase, router]);

  if (!hydrated) return null;

  return (
    <div className={styles.layout}>
      <nav className={styles.topnav}>
        <div className={styles.brand}>
          <span className={styles.brandText}>Admin</span>
        </div>
        <div className={styles.nav}>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={pathname.startsWith(link.href) ? styles.navLinkActive : styles.navLink}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className={styles.userInfo}>
          <span className={styles.userName}>{user?.displayName || user?.email}</span>
          <IconButton size="sm" label="Cerrar sesión" onClick={handleLogout}>
            <LogOut size={16} />
          </IconButton>
        </div>
      </nav>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
