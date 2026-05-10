import { Navbar } from './Navbar';
import styles from './layout.module.css';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.layout}>
      <Navbar />
      <main className={styles.main}>{children}</main>
    </div>
  );
}
