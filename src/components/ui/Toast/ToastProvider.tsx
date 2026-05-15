'use client';

import { Toaster } from 'sonner';
import styles from './Toast.module.css';

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      gap={8}
      visibleToasts={3}
      duration={4000}
      offset={16}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: styles.toast,
          success: styles.success,
          error: styles.error,
          warning: styles.warning,
          info: styles.info,
        },
      }}
    />
  );
}
