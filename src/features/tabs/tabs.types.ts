export interface TabDetailSong {
  id: string;
  title: string;
  slug: string;
  subtitle: string | null;
  releaseYear: number | null;
  artist: { id: string; name: string; slug: string };
  genres: { id: string; name: string; slug: string }[];
}

export interface TabDetail {
  id: string;
  authorUserId: string;
  titleOverride: string | null;
  content: string;
  tabType: string;
  instrument: string;
  difficulty: string;
  status: string;
  authorDisplayName: string | null;
  versionNumber: number;
  submittedAt: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  song: TabDetailSong;
}
