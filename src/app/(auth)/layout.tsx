'use client';

import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import styles from './layout.module.css';

export default function AuthLayout({ children }: { children: ReactNode }) {
  useEffect(() => {
    useAuthStore.persist.rehydrate();
  }, []);

  return <div className={styles.container}>{children}</div>;
}
