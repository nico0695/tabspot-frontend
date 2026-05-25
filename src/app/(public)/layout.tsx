import { PublicNavbar } from './PublicNavbar/PublicNavbar';
import styles from './layout.module.css';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.layout}>
      <PublicNavbar />
      <main className={styles.main}>{children}</main>
    </div>
  );
}
