export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  interests: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface Note {
  _id: string;
  title: string;
  content: string;
  userId: string | User;
  createdAt: string;
  updatedAt?: string;
}

export interface Post {
  _id: string;
  title: string;
  content: string;
  authorId: string | User;
  createdAt: string;
  updatedAt?: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  pagination: Pagination;
  data: T[];
}

export interface Scenario1Group {
  interest: string;
  count: number;
  users: Array<{
    _id: string;
    name: string;
    email: string;
    role: string;
  }>;
}

export interface Scenario2UserWithPosts extends User {
  postsCount: number;
  posts: Post[];
}
