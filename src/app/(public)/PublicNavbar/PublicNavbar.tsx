'use client';

import { useEffect, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import styles from './PublicNavbar.module.css';

const NAV_LINKS = [
  { href: '/songs', label: 'Songs' },
  { href: '/artists', label: 'Artists' },
];

const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function PublicNavbar() {
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuthStore();
  const hydrated = useSyncExternalStore(emptySubscribe, getClientSnapshot, getServerSnapshot);

  useEffect(() => {
    useAuthStore.persist.rehydrate();
  }, []);

  return (
    <nav className={styles.nav}>
      <Link href="/" className={styles.logo}>
        TabSpot
      </Link>

      <div className={styles.navLinks}>
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

      <div className={styles.actions}>
        {!hydrated ? null : !isAuthenticated ? (
          <>
            <Link href="/login" className={styles.loginLink}>
              Log In
            </Link>
            <Link href="/register" className={styles.signupLink}>
              Sign Up
            </Link>
          </>
        ) : (
          <>
            {user?.role === 'ADMIN' && (
              <Link href="/admin" className={styles.adminLink}>
                Admin
              </Link>
            )}
            <span className={styles.profileBtn}>
              <User size={16} />
              {user?.displayName ?? user?.email}
            </span>
          </>
        )}
      </div>
    </nav>
  );
}
