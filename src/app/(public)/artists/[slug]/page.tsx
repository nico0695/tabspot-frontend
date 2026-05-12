import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { fetchArtistBySlug } from '@/lib/api/server';
import { ArtistDetailClient } from './ArtistDetailClient';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const artist = await fetchArtistBySlug(slug);

  if (!artist) {
    return { title: 'Artist not found | TabSpot' };
  }

  return {
    title: `${artist.name} | TabSpot`,
    description: `Browse songs and tabs by ${artist.name} on TabSpot.`,
  };
}

export default async function ArtistDetailPage({ params }: Props) {
  const { slug } = await params;
  const artist = await fetchArtistBySlug(slug);

  if (!artist) {
    notFound();
  }

  return <ArtistDetailClient artist={artist} />;
}
