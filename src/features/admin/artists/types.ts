export interface AdminArtist {
  id: string;
  name: string;
  slug: string;
  sortName: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface CreateArtistInput {
  name: string;
  sortName?: string;
}

export interface UpdateArtistInput {
  name?: string;
  sortName?: string | null;
}
