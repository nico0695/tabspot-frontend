export interface CursorPageInfo {
  nextCursor: string | null;
  hasMore: boolean;
}

export interface CursorPage<T> {
  data: T[];
  pageInfo: CursorPageInfo;
}

export interface OffsetPageInfo {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface OffsetPage<T> {
  data: T[];
  pageInfo: OffsetPageInfo;
}

export interface FieldError {
  field: string;
  message: string;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly fields?: FieldError[],
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
