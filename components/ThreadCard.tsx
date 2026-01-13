
import React from 'react';
import { Post } from '../types';

interface ThreadCardProps {
  post: Post;
  onClick: (id: string) => void;
}

const ThreadCard: React.FC<ThreadCardProps> = ({ post, onClick }) => {
  const dateStr = post.createdAt instanceof Date 
    ? post.createdAt.toLocaleString() 
    : 'New Post';

  return (
    <div 
      onClick={() => onClick(post._id)}
      className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-blue-400 hover:shadow-xl hover:shadow-blue-500/5 transition-all cursor-pointer group animate-fade-in"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-xl font-extrabold text-slate-800 group-hover:text-blue-600 transition-colors leading-tight">
          {post.title}
        </h3>
        <span className="shrink-0 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md bg-slate-100 text-slate-500">
          {post.visibility}
        </span>
      </div>
      <p className="text-slate-600 line-clamp-3 text-sm mb-6 leading-relaxed">
        {post.body}
      </p>
      <div className="flex items-center justify-between pt-4 border-t border-slate-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-[10px] text-slate-600 font-black overflow-hidden shadow-inner">
            {post._openid.substring(0, 2).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-700">
              User_{post._openid.substring(0, 6)}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              Creator ID: {post._openid.substring(0, 12)}...
            </span>
          </div>
        </div>
        <div className="text-right">
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Posted At</span>
          <span className="text-xs text-slate-500 font-medium">{dateStr}</span>
        </div>
      </div>
    </div>
  );
};

export default ThreadCard;
