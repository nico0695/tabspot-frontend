import { EmptyState } from '@/components/ui/EmptyState';
import styles from './page.module.css';

export default function NotFound() {
  return (
    <div className={styles.center}>
      <EmptyState
        title="Artist not found"
        description="The artist you're looking for doesn't exist."
      />
    </div>
  );
}
