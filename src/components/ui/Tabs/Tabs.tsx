'use client';

import type { ReactNode } from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import styles from './Tabs.module.css';

export interface TabItem {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface TabsProps {
  items: TabItem[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  children: ReactNode;
  className?: string;
}

export interface TabsContentProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export function Tabs({ items, value, defaultValue, onChange, children, className }: TabsProps) {
  const rootCls = [styles.root, className].filter(Boolean).join(' ');

  return (
    <TabsPrimitive.Root
      className={rootCls}
      value={value}
      defaultValue={defaultValue ?? items[0]?.value}
      onValueChange={onChange}
    >
      <TabsPrimitive.List className={styles.list}>
        {items.map((item) => (
          <TabsPrimitive.Trigger
            key={item.value}
            value={item.value}
            className={styles.trigger}
            disabled={item.disabled}
          >
            {item.label}
          </TabsPrimitive.Trigger>
        ))}
      </TabsPrimitive.List>
      {children}
    </TabsPrimitive.Root>
  );
}

export function TabsContent({ value, children, className }: TabsContentProps) {
  const contentCls = [styles.content, className].filter(Boolean).join(' ');

  return (
    <TabsPrimitive.Content value={value} className={contentCls}>
      {children}
    </TabsPrimitive.Content>
  );
}
