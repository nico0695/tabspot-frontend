import type { Metadata } from 'next';
import { SongsPageClient } from './SongsPageClient';

export const metadata: Metadata = {
  title: 'Songs | TabSpot',
  description: 'Browse and discover songs with tabs and chords on TabSpot.',
};

export default function SongsPage() {
  return <SongsPageClient />;
}
