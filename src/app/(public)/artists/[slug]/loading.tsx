import { Spinner } from '@/components/ui/Spinner';
import styles from './page.module.css';

export default function Loading() {
  return (
    <div className={styles.center}>
      <Spinner />
    </div>
  );
}
