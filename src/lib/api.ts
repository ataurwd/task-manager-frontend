import {
  User,
  Note,
  Post,
  PaginatedResponse,
  Scenario1Group,
  Scenario2UserWithPosts
} from '../types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

export const setToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('token', token);
};

export const removeToken = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('token');
};

const request = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
};

export const api = {
  auth: {
    login: (credentials: { email: string; password: string }) =>
      request<{ success: boolean; token: string; user: User }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),

    register: (userData: {
      name: string;
      email: string;
      password: string;
      role?: 'user' | 'admin';
      interests?: string[];
    }) =>
      request<{ success: boolean; token: string; user: User }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      }),

    getMe: () => request<{ success: boolean; user: User }>('/auth/me'),
  },

  notes: {
    list: (page = 1, limit = 10, userId?: string) => {
      let query = `?page=${page}&limit=${limit}`;
      if (userId) query += `&userId=${userId}`;
      return request<PaginatedResponse<Note>>(`/notes${query}`);
    },

    getOne: (id: string) => request<{ success: boolean; data: Note }>(`/notes/${id}`),

    create: (note: { title: string; content: string }) =>
      request<{ success: boolean; data: Note }>('/notes', {
        method: 'POST',
        body: JSON.stringify(note),
      }),

    update: (id: string, note: { title?: string; content?: string }) =>
      request<{ success: boolean; data: Note }>(`/notes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(note),
      }),

    delete: (id: string) =>
      request<{ success: boolean; message: string }>(`/notes/${id}`, {
        method: 'DELETE',
      }),
  },

  admin: {
    listUsers: (page = 1, limit = 10, role?: string) => {
      let query = `?page=${page}&limit=${limit}`;
      if (role) query += `&role=${role}`;
      return request<PaginatedResponse<User>>(`/admin/users${query}`);
    },

    createUser: (userData: {
      name: string;
      email: string;
      password: string;
      role: 'user' | 'admin';
      interests?: string[];
    }) =>
      request<{ success: boolean; data: User }>('/admin/users', {
        method: 'POST',
        body: JSON.stringify(userData),
      }),

    updateUser: (id: string, userData: Partial<User>) =>
      request<{ success: boolean; data: User }>(`/admin/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(userData),
      }),

    deleteUser: (id: string) =>
      request<{ success: boolean; message: string }>(`/admin/users/${id}`, {
        method: 'DELETE',
      }),
  },

  posts: {
    list: (page = 1, limit = 10) =>
      request<PaginatedResponse<Post>>(`/posts?page=${page}&limit=${limit}`),

    create: (post: { title: string; content: string }) =>
      request<{ success: boolean; data: Post }>('/posts', {
        method: 'POST',
        body: JSON.stringify(post),
      }),
  },

  aggregations: {
    // Scenario 1: Group by Interests (exactly one collection.aggregate() call)
    groupByInterests: () =>
      request<{
        success: boolean;
        description: string;
        totalGroups: number;
        data: Scenario1Group[];
      }>('/aggregations/users-by-interests'),

    // Scenario 2: User Posts ($lookup) (single aggregation pipeline with a $lookup stage)
    userPostsLookup: (userId: string) =>
      request<{
        success: boolean;
        description: string;
        data: Scenario2UserWithPosts;
      }>(`/aggregations/users/${userId}/posts`),
  },
};
