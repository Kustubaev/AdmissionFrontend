// Интерфейс для пагинации
export interface Pagination<T> {
  meta: any;
  current_page: number;
  data: T[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: PaginationLink[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

// Интерфейс для ссылок пагинации
export interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}
