import type { Metadata } from 'next';
import { ArtistsPageClient } from './ArtistsPageClient';

export const metadata: Metadata = {
  title: 'Artists | TabSpot',
  description: 'Browse artists and discover their songs with tabs and chords on TabSpot.',
};

export default function ArtistsPage() {
  return <ArtistsPageClient />;
}
