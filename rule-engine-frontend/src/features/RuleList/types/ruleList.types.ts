export interface RuleFilters {
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: 'createdAt' | 'name';
  sortOrder?: 'asc' | 'desc';
}
