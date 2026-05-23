import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { fetchTabById } from '@/lib/api/server';
import { TabDetailClient } from './TabDetailClient';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const tab = await fetchTabById(id);

  if (!tab) {
    return { title: 'Tab not found | TabSpot' };
  }

  const tabTypeLabel = tab.tabType.charAt(0) + tab.tabType.slice(1).toLowerCase();

  return {
    title: `${tab.song.title} — ${tabTypeLabel} | TabSpot`,
    description: `${tab.song.title} by ${tab.song.artist.name} - ${tabTypeLabel} on TabSpot`,
  };
}

export default async function TabDetailPage({ params }: Props) {
  const { id } = await params;
  const tab = await fetchTabById(id);

  if (!tab) {
    notFound();
  }

  return <TabDetailClient tab={tab} />;
}
