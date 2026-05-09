'use client';

import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import type { ReactNode } from 'react';
import styles from './DropdownMenu.module.css';

export interface DropdownMenuProps {
  children: ReactNode;
}

export interface DropdownMenuTriggerProps {
  children: ReactNode;
  asChild?: boolean;
}

export interface DropdownMenuContentProps {
  children: ReactNode;
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
  className?: string;
}

export type DropdownMenuItemVariant = 'default' | 'danger';

export interface DropdownMenuItemProps {
  variant?: DropdownMenuItemVariant;
  onSelect?: () => void;
  disabled?: boolean;
  children: ReactNode;
  className?: string;
}

export interface DropdownMenuSeparatorProps {
  className?: string;
}

function DropdownMenuRoot({ children }: DropdownMenuProps) {
  return <DropdownMenuPrimitive.Root>{children}</DropdownMenuPrimitive.Root>;
}

function DropdownMenuTrigger({ children, asChild = true }: DropdownMenuTriggerProps) {
  return (
    <DropdownMenuPrimitive.Trigger asChild={asChild}>{children}</DropdownMenuPrimitive.Trigger>
  );
}

function DropdownMenuContent({
  children,
  align = 'end',
  sideOffset = 4,
  className,
}: DropdownMenuContentProps) {
  const cls = [styles.content, className].filter(Boolean).join(' ');
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content className={cls} align={align} sideOffset={sideOffset}>
        {children}
      </DropdownMenuPrimitive.Content>
    </DropdownMenuPrimitive.Portal>
  );
}

function DropdownMenuItem({
  variant = 'default',
  onSelect,
  disabled,
  children,
  className,
}: DropdownMenuItemProps) {
  const cls = [styles.item, variant === 'danger' && styles.danger, className]
    .filter(Boolean)
    .join(' ');
  return (
    <DropdownMenuPrimitive.Item className={cls} onSelect={onSelect} disabled={disabled}>
      {children}
    </DropdownMenuPrimitive.Item>
  );
}

function DropdownMenuSeparator({ className }: DropdownMenuSeparatorProps) {
  const cls = [styles.separator, className].filter(Boolean).join(' ');
  return <DropdownMenuPrimitive.Separator className={cls} />;
}

export const DropdownMenu = Object.assign(DropdownMenuRoot, {
  Trigger: DropdownMenuTrigger,
  Content: DropdownMenuContent,
  Item: DropdownMenuItem,
  Separator: DropdownMenuSeparator,
});
