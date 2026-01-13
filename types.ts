
export interface User {
  appUserId: string;
  openid?: string;
}

export interface Post {
  _id: string;
  _openid: string;
  title: string;
  body: string;
  visibility: 'public' | 'private';
  createdAt: Date | any;
}

export interface Comment {
  _id: string;
  _openid: string;
  postId: string;
  content: string;
  createdAt: Date | any;
}

export interface PaginatedResult<T> {
  data: T[];
  nextCursor: string | null;
}

declare global {
  interface Window {
    gemigo: any;
  }
}
