export const TabType = { CHORDS: 'CHORDS', TAB: 'TAB', MIXED: 'MIXED' } as const;
export type TabType = (typeof TabType)[keyof typeof TabType];

export const Instrument = {
  GUITAR: 'GUITAR',
  BASS: 'BASS',
  UKULELE: 'UKULELE',
  PIANO: 'PIANO',
} as const;
export type Instrument = (typeof Instrument)[keyof typeof Instrument];

export const Difficulty = {
  BEGINNER: 'BEGINNER',
  INTERMEDIATE: 'INTERMEDIATE',
  ADVANCED: 'ADVANCED',
} as const;
export type Difficulty = (typeof Difficulty)[keyof typeof Difficulty];

export const TabStatus = {
  DRAFT: 'DRAFT',
  PENDING: 'PENDING',
  PUBLISHED: 'PUBLISHED',
  REJECTED: 'REJECTED',
} as const;
export type TabStatus = (typeof TabStatus)[keyof typeof TabStatus];

export const UserRole = { USER: 'USER', ADMIN: 'ADMIN' } as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const UserStatus = { ACTIVE: 'ACTIVE', BLOCKED: 'BLOCKED' } as const;
export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];
