'use client';

import Link from 'next/link';
import { Music, Users, ListMusic, UserCog } from 'lucide-react';
import styles from './page.module.css';

const SECTIONS = [
  {
    href: '/admin/genres',
    icon: <Music size={24} />,
    label: 'Géneros',
    description: 'Gestionar géneros musicales',
  },
  {
    href: '/admin/artists',
    icon: <Users size={24} />,
    label: 'Artistas',
    description: 'Gestionar artistas',
  },
  {
    href: '/admin/songs',
    icon: <ListMusic size={24} />,
    label: 'Canciones',
    description: 'Gestionar canciones',
  },
  {
    href: '/admin/users',
    icon: <UserCog size={24} />,
    label: 'Usuarios',
    description: 'Gestionar usuarios',
  },
];

export default function AdminDashboardPage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Dashboard</h1>
      <div className={styles.grid}>
        {SECTIONS.map((section) => (
          <Link key={section.href} href={section.href} className={styles.cardLink}>
            <div className={styles.card}>
              <div className={styles.iconWrapper}>{section.icon}</div>
              <div className={styles.cardContent}>
                <h2 className={styles.cardLabel}>{section.label}</h2>
                <p className={styles.cardDescription}>{section.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
