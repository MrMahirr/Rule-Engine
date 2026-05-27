export interface RuleFilters {
  search?: string;
  category?: string;
  active?: boolean;
  page?: number;
  pageSize?: number;
  sortBy?: 'createdAt' | 'name';
  sortOrder?: 'asc' | 'desc';
}
