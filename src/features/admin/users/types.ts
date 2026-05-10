export interface AdminUser {
  id: string;
  supabaseAuthId: string;
  email: string;
  displayName: string | null;
  role: string;
  status: string;
  blockedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ChangeRoleInput {
  role: string;
}

export interface ChangeStatusInput {
  status: string;
}
