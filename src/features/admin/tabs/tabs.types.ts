export type TabFormModalMode = 'create' | 'edit' | 'detail' | 'delete';

export interface AdminTabAuthor {
  id: string;
  displayName: string | null;
  email: string;
  status: string;
  role: string;
}

export interface AdminTabSong {
  id: string;
  title: string;
  slug: string;
  deletedAt: string | null;
  artist: { id: string; name: string; slug: string };
}

export interface AdminTab {
  id: string;
  songId: string;
  authorUserId: string;
  titleOverride: string | null;
  content: string;
  tabType: string;
  instrument: string;
  difficulty: string;
  status: string;
  submittedAt: string | null;
  publishedAt: string | null;
  moderatedByUserId: string | null;
  moderationNotes: string | null;
  versionNumber: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  author: AdminTabAuthor;
  song: AdminTabSong;
}

export interface CreateTabInput {
  songId: string;
  content: string;
  tabType: string;
  instrument: string;
  difficulty: string;
  titleOverride?: string;
  status?: string;
  moderationNotes?: string | null;
}

export interface UpdateTabInput {
  content?: string;
  tabType?: string;
  instrument?: string;
  difficulty?: string;
  titleOverride?: string | null;
  status?: string;
  moderationNotes?: string | null;
}
