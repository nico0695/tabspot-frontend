'use client';

import type { ReactNode } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import styles from './Modal.module.css';

export interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
  maxWidth?: number;
  className?: string;
}

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  actions,
  maxWidth = 380,
  className,
}: ModalProps) {
  const contentCls = [styles.content, className].filter(Boolean).join(' ');

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} />
        <Dialog.Content className={contentCls} style={{ maxWidth }}>
          <Dialog.Title className={styles.title}>{title}</Dialog.Title>
          {description && (
            <Dialog.Description className={styles.description}>{description}</Dialog.Description>
          )}
          <div className={styles.body}>{children}</div>
          {actions && <div className={styles.actions}>{actions}</div>}
          <Dialog.Close asChild>
            <button type="button" className={styles.closeBtn} aria-label="Close">
              <X size={16} />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
