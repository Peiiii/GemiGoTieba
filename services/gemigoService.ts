
import { Post, Comment, PaginatedResult, User } from '../types';

// Use a stable appId for development
const APP_ID = 'gemigo-tieba-demo';

export class GemigoService {
  private static get sdk() {
    if (!window.gemigo) {
      throw new Error('GemiGo SDK not available');
    }
    return window.gemigo;
  }

  static async login(): Promise<User> {
    return await this.sdk.auth.login({
      appId: APP_ID,
      scopes: ['identity:basic', 'db:rw'],
    });
  }

  static logout() {
    this.sdk.auth.logout();
  }

  static getDb() {
    return this.sdk.cloud.database();
  }

  static async fetchPosts(cursor: string | null = null): Promise<PaginatedResult<Post>> {
    const db = this.getDb();
    const _ = db.command;
    
    let query = db.collection('posts')
      .where({ visibility: _.eq('public') })
      .orderBy('createdAt', 'desc')
      .limit(10);

    if (cursor) {
      query = query.startAfter(cursor);
    }

    const res = await query.get();
    return {
      data: res.data || [],
      nextCursor: res._meta?.nextCursor || null,
    };
  }

  static async createPost(title: string, body: string, visibility: 'public' | 'private' = 'public'): Promise<any> {
    const db = this.getDb();
    return await db.collection('posts').add({
      data: {
        title,
        body,
        visibility,
        createdAt: db.serverDate(),
      },
    });
  }

  static async fetchComments(postId: string): Promise<PaginatedResult<Comment>> {
    const db = this.getDb();
    const _ = db.command;

    const res = await db.collection('comments')
      .where({ postId: _.eq(postId) })
      .orderBy('createdAt', 'asc')
      .limit(50)
      .get();

    return {
      data: res.data || [],
      nextCursor: res._meta?.nextCursor || null,
    };
  }

  static async addComment(postId: string, content: string): Promise<any> {
    const db = this.getDb();
    return await db.collection('comments').add({
      data: {
        postId,
        content,
        createdAt: db.serverDate(),
      },
    });
  }

  static async attemptForgingOpenid(): Promise<any> {
    const db = this.getDb();
    // This is expected to be rejected by the server side validation
    return await db.collection('posts').add({
      data: {
        title: 'Forgery attempt',
        body: 'This should fail because _openid is a system field',
        visibility: 'public',
        _openid: 'forged-openid-123', 
      },
    });
  }
}
