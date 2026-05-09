export interface AdminGenre {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface CreateGenreInput {
  name: string;
}

export interface UpdateGenreInput {
  name?: string;
}
