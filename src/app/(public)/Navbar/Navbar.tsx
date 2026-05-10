'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Navbar.module.css';

const NAV_LINKS = [
  { href: '/songs', label: 'Songs' },
  { href: '/artists', label: 'Artists' },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className={styles.topnav}>
      <div className={styles.brand}>
        <Link href="/" className={styles.brandLink}>
          TabSpot
        </Link>
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
      <div className={styles.spacer} />
    </nav>
  );
}
