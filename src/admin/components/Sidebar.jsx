import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaFolderOpen, FaFileAlt, FaSignOutAlt, FaHome, FaArrowLeft, FaCloud } from 'react-icons/fa';
import { useGitHubAuth } from '../../hooks/useGitHubAuth';

export default function Sidebar() {
  const { logout, user } = useGitHubAuth();
  const navigate = useNavigate();

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: <FaHome size={18} />, end: true },
    { name: 'Projects', path: '/admin/projects/new', icon: <FaFolderOpen size={18} /> },
    { name: 'Articles', path: '/admin/articles/new', icon: <FaFileAlt size={18} /> },
    { name: 'Storage Targets', path: '/admin/storage', icon: <FaCloud size={18} /> },
  ];

  return (
    <aside className="w-full md:w-64 bg-dark-800/60 backdrop-blur-md border-r border-white/5 flex flex-col min-h-screen">
      {/* Header / Admin Identity */}
      <div className="p-6 border-b border-white/5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-heading font-bold gradient-text">Console</h1>
          <span className="text-xs text-slate-500 font-medium">Portfolio CMS v1.0</span>
        </div>
        <button
          onClick={() => navigate('/')}
          className="p-2 text-slate-400 hover:text-white bg-white/5 rounded-lg transition-all duration-200"
          title="Back to Portfolio"
        >
          <FaArrowLeft size={12} />
        </button>
      </div>

      {/* Authenticated User Quick Info */}
      {user && (
        <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3 bg-dark-900/40">
          <img
            src={user.avatar_url}
            alt={user.login}
            className="w-10 h-10 rounded-full border border-primary-500/20"
          />
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-white truncate">@{user.login}</p>
            <p className="text-xs text-slate-500 truncate">{user.name || 'Administrator'}</p>
          </div>
        </div>
      )}

      {/* Menu Navigation Links */}
      <nav className="flex-grow p-4 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-primary-500/10 text-primary-400 border border-primary-500/10 shadow-lg shadow-primary-500/5'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`
            }
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout button */}
      <div className="p-4 border-t border-white/5">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-all duration-200"
        >
          <FaSignOutAlt size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
