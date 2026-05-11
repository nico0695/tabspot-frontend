import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { fetchSongBySlug } from '@/lib/api/server';
import { SongDetailClient } from './SongDetailClient';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const song = await fetchSongBySlug(slug);

  if (!song) {
    return { title: 'Song not found | TabSpot' };
  }

  return {
    title: `${song.title} - ${song.artist.name} | TabSpot`,
    description: song.subtitle
      ? `${song.title} by ${song.artist.name} - ${song.subtitle}`
      : `${song.title} by ${song.artist.name} - Tabs and chords on TabSpot`,
  };
}

export default async function SongDetailPage({ params }: Props) {
  const { slug } = await params;
  const song = await fetchSongBySlug(slug);

  if (!song) {
    notFound();
  }

  return <SongDetailClient song={song} />;
}
