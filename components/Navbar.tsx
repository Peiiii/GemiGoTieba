
import React from 'react';
import { User } from '../types';

interface NavbarProps {
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogin, onLogout }) => {
  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        <div 
          className="flex items-center gap-2 cursor-pointer group" 
          onClick={() => window.location.reload()}
        >
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200 group-hover:scale-105 transition-transform">
            <span className="text-white font-black text-2xl italic">G</span>
          </div>
          <span className="text-xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hidden sm:inline">
            GemiGo Tieba
          </span>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden md:block text-right">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Authorized User</p>
                <p className="text-sm font-semibold text-slate-700 max-w-[120px] truncate">{user.appUserId}</p>
              </div>
              <button
                onClick={onLogout}
                className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-red-600 bg-slate-100 hover:bg-red-50 rounded-full transition-all"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={onLogin}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full shadow-lg shadow-blue-200 transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              Connect App
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
