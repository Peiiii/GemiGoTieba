
import React, { useState, useEffect, useCallback } from 'react';
import { GemigoService } from './services/gemigoService';
import { Post, Comment, User } from './types';
import Navbar from './components/Navbar';
import ThreadCard from './components/ThreadCard';
import CreatePostModal from './components/CreatePostModal';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentContent, setCommentContent] = useState('');
  const [debugLog, setDebugLog] = useState<string[]>([]);

  const addLog = (msg: string) => {
    setDebugLog(prev => [msg, ...prev].slice(0, 8));
  };

  const loadPosts = useCallback(async (append = false) => {
    setLoading(true);
    try {
      const res = await GemigoService.fetchPosts(append ? nextCursor : null);
      if (append) {
        setPosts(prev => [...prev, ...res.data]);
      } else {
        setPosts(res.data);
      }
      setNextCursor(res.nextCursor);
      addLog(`Loaded ${res.data.length} posts ${append ? '(append)' : '(fresh)'}`);
    } catch (err: any) {
      addLog(`Fetch Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [nextCursor]);

  const loadComments = useCallback(async (postId: string) => {
    try {
      const res = await GemigoService.fetchComments(postId);
      setComments(res.data);
      addLog(`Loaded ${res.data.length} comments for post ${postId.substring(0, 8)}`);
    } catch (err: any) {
      addLog(`Comment Error: ${err.message}`);
    }
  }, []);

  const handleLogin = async () => {
    try {
      const u = await GemigoService.login();
      setUser(u);
      addLog(`Successfully authorized as ${u.appUserId}`);
      loadPosts(false);
    } catch (err: any) {
      addLog(`Authorization Failed: ${err.message}`);
    }
  };

  const handleLogout = () => {
    GemigoService.logout();
    setUser(null);
    setPosts([]);
    setSelectedPostId(null);
    addLog('Logged out and state cleared');
  };

  const handleCreatePost = async (title: string, body: string, visibility: 'public' | 'private') => {
    await GemigoService.createPost(title, body, visibility);
    addLog('New thread published');
    loadPosts(false);
  };

  const handlePostClick = (id: string) => {
    setSelectedPostId(id);
    loadComments(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPostId || !commentContent.trim()) return;
    try {
      await GemigoService.addComment(selectedPostId, commentContent.trim());
      setCommentContent('');
      loadComments(selectedPostId);
      addLog('Reply posted successfully');
    } catch (err: any) {
      addLog(`Reply Error: ${err.message}`);
    }
  };

  const handleNegativeTest = async () => {
    try {
      addLog('TEST: Attempting to bypass system field (_openid)...');
      const res = await GemigoService.attemptForgingOpenid();
      addLog(`TEST RESULT (Unexpected Success): ${JSON.stringify(res)}`);
    } catch (err: any) {
      addLog(`TEST RESULT (Expected Failure): ${err.message}`);
    }
  };

  const selectedPost = posts.find(p => p._id === selectedPostId);

  return (
    <div className="min-h-screen bg-slate-50 pb-20 selection:bg-blue-100 selection:text-blue-900">
      <Navbar user={user} onLogin={handleLogin} onLogout={handleLogout} />

      <main className="max-w-4xl mx-auto px-4 pt-8">
        {!user ? (
          <div className="flex flex-col items-center justify-center py-32 text-center animate-fade-in">
            <div className="relative mb-8">
              <div className="w-24 h-24 bg-blue-600/10 text-blue-600 rounded-[2.5rem] flex items-center justify-center">
                <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.9 1.9 0 01-2-2V6c0-1.1.9-2 2-2h4a2 2 0 012 2v2" />
                </svg>
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-indigo-600 rounded-full border-4 border-white flex items-center justify-center animate-bounce">
                <span className="text-white text-[10px] font-black italic">!</span>
              </div>
            </div>
            <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Welcome to Tieba</h2>
            <p className="text-slate-500 mb-10 max-w-sm mx-auto leading-relaxed text-lg">
              The modern community forum powered by GemiGo SDK. Connect to start discussing.
            </p>
            <button
              onClick={handleLogin}
              className="px-12 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-2xl shadow-blue-200 hover:bg-blue-700 transform transition hover:-translate-y-1 active:translate-y-0.5"
            >
              Sign In with GemiGo
            </button>
          </div>
        ) : selectedPostId ? (
          <div className="space-y-8 animate-fade-in">
            <button 
              onClick={() => setSelectedPostId(null)}
              className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold transition-all group"
            >
              <div className="p-1.5 rounded-lg bg-white border border-slate-200 group-hover:bg-blue-50 group-hover:border-blue-200 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </div>
              Back to Community
            </button>

            {selectedPost ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xl shadow-slate-200/50">
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-50">
                   <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-lg font-black text-indigo-600 shadow-inner">
                      {selectedPost._openid.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-black text-slate-900 text-lg">User_{selectedPost._openid.substring(0, 6)}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Post ID: {selectedPost._id.substring(0, 10)}</p>
                    </div>
                   </div>
                   <div className="px-4 py-1.5 rounded-full bg-slate-100 text-slate-500 text-xs font-black uppercase tracking-widest">
                    {selectedPost.visibility}
                   </div>
                </div>
                <h1 className="text-3xl font-black text-slate-900 mb-6 tracking-tight">
                  {selectedPost.title}
                </h1>
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap text-xl font-medium">
                  {selectedPost.body}
                </p>
              </div>
            ) : (
              <div className="p-12 text-center bg-red-50 text-red-500 rounded-3xl border border-red-100 font-bold">
                Post not found or inaccessible.
              </div>
            )}

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                  Thread Replies 
                  <span className="bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-blue-200">
                    {comments.length}
                  </span>
                </h3>
              </div>
              
              <div className="space-y-4">
                {comments.map((c, i) => (
                  <div key={c._id} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex gap-4">
                    <div className="shrink-0 w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-xs font-black text-slate-500">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-black text-slate-800">User_{c._openid.substring(0, 6)}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">#{c._id.substring(0, 4)}</span>
                      </div>
                      <p className="text-slate-700 text-md leading-relaxed font-medium">{c.content}</p>
                    </div>
                  </div>
                ))}
                {comments.length === 0 && (
                  <div className="py-16 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                    <p className="text-slate-400 font-bold italic">No replies in this thread yet. Start the conversation!</p>
                  </div>
                )}
              </div>

              <form onSubmit={handleAddComment} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 flex flex-col gap-4">
                <textarea
                  required
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  placeholder="Share your thoughts..."
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl p-4 text-md font-medium outline-none transition-all resize-none min-h-[100px]"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!commentContent.trim()}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-black py-3 px-10 rounded-2xl shadow-lg shadow-blue-200 transition-all active:scale-95 text-sm uppercase tracking-widest"
                  >
                    Post Reply
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/40">
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Community Feed</h2>
                <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Public Discussions • {posts.length} Active Threads</p>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full md:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-xl shadow-indigo-100 transition-all hover:-translate-y-1 active:translate-y-0"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Thread
              </button>
            </div>

            {loading && posts.length === 0 ? (
              <div className="space-y-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white border border-slate-200 rounded-2xl p-8 animate-pulse">
                    <div className="h-6 bg-slate-100 rounded-lg w-1/2 mb-6"></div>
                    <div className="h-4 bg-slate-100 rounded-lg w-full mb-3"></div>
                    <div className="h-4 bg-slate-100 rounded-lg w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {posts.map(post => (
                  <ThreadCard key={post._id} post={post} onClick={handlePostClick} />
                ))}
                {posts.length === 0 && (
                  <div className="text-center py-32 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                    <p className="text-slate-400 font-black text-xl italic mb-4">The wall is currently empty.</p>
                    <button onClick={() => setIsModalOpen(true)} className="text-blue-600 font-black underline underline-offset-4 decoration-2">Start the very first discussion!</button>
                  </div>
                )}
              </div>
            )}

            {nextCursor && (
              <div className="flex justify-center pt-10">
                <button
                  onClick={() => loadPosts(true)}
                  disabled={loading}
                  className="px-10 py-4 bg-white border-2 border-slate-200 hover:border-blue-600 hover:text-blue-600 text-slate-700 font-black rounded-2xl shadow-md transition-all flex items-center gap-3 active:scale-95"
                >
                  {loading ? (
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                  Load More Content
                </button>
              </div>
            )}
          </div>
        )}

        {user && (
          <div className="mt-32 border-t-2 border-slate-200 border-dashed pt-12">
            <div className="bg-slate-900 rounded-[2rem] p-8 text-slate-300 font-mono text-xs overflow-hidden shadow-2xl relative border-4 border-slate-800">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-emerald-400 font-black uppercase tracking-widest text-[11px]">System Kernel Output</span>
                </div>
                <button 
                  onClick={handleNegativeTest}
                  className="px-6 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border-2 border-red-500/30 rounded-xl font-black transition-all hover:scale-105 active:scale-95 uppercase tracking-tighter"
                >
                  Force Negative Validation Test
                </button>
              </div>
              <div className="space-y-2 opacity-90 overflow-y-auto max-h-[300px] scrollbar-hide">
                {debugLog.map((log, i) => (
                  <div key={i} className="flex gap-4 group border-l-2 border-slate-700 pl-4 py-1">
                    <span className="text-slate-600 shrink-0 font-bold">{new Date().toLocaleTimeString()}</span>
                    <span className="break-all group-hover:text-emerald-300 transition-colors">{log}</span>
                  </div>
                ))}
              </div>
              <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none select-none text-8xl font-black italic">
                DEBUG
              </div>
            </div>
          </div>
        )}
      </main>

      <CreatePostModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreatePost}
      />
    </div>
  );
};

export default App;
