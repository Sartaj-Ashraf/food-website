export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalDocs: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}
