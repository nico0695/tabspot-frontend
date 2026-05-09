import type { ReactNode } from 'react';
import styles from './Card.module.css';

export interface CardProps {
  wide?: boolean;
  children: ReactNode;
  className?: string;
}

export interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export interface CardDescriptionProps {
  children: ReactNode;
  className?: string;
}

export interface CardBodyProps {
  children: ReactNode;
  className?: string;
}

function CardRoot({ wide, children, className }: CardProps) {
  const cls = [styles.card, wide && styles.wide, className].filter(Boolean).join(' ');
  return <div className={cls}>{children}</div>;
}

function CardHeader({ children, className }: CardHeaderProps) {
  const cls = [styles.header, className].filter(Boolean).join(' ');
  return <div className={cls}>{children}</div>;
}

function CardDescription({ children, className }: CardDescriptionProps) {
  const cls = [styles.description, className].filter(Boolean).join(' ');
  return <p className={cls}>{children}</p>;
}

function CardBody({ children, className }: CardBodyProps) {
  const cls = [styles.body, className].filter(Boolean).join(' ');
  return <div className={cls}>{children}</div>;
}

export const Card = Object.assign(CardRoot, {
  Header: CardHeader,
  Description: CardDescription,
  Body: CardBody,
});
