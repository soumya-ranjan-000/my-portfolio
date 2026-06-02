import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaFolderOpen, FaFileAlt, FaSignOutAlt, FaHome, FaArrowLeft, FaCloud, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useGitHubAuth } from '../../hooks/useGitHubAuth';

export default function Sidebar() {
  const { logout, user } = useGitHubAuth();
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem('admin_sidebar_collapsed') === 'true';
  });

  const toggleCollapsed = () => {
    const newVal = !collapsed;
    setCollapsed(newVal);
    localStorage.setItem('admin_sidebar_collapsed', String(newVal));
  };

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: <FaHome size={18} />, end: true },
    { name: 'Projects', path: '/admin/projects/new', icon: <FaFolderOpen size={18} /> },
    { name: 'Articles', path: '/admin/articles/new', icon: <FaFileAlt size={18} /> },
    { name: 'Storage Targets', path: '/admin/storage', icon: <FaCloud size={18} /> },
  ];

  return (
    <aside className={`w-full ${collapsed ? 'md:w-16' : 'md:w-64'} bg-dark-800/60 backdrop-blur-md border-r border-white/5 flex flex-col min-h-screen transition-all duration-300`}>
      {/* Header / Admin Identity */}
      <div className={`p-4 border-b border-white/5 flex flex-col items-center gap-4 ${collapsed ? '' : 'md:flex-row md:justify-between'}`}>
        {!collapsed ? (
          <div>
            <h1 className="text-xl font-heading font-bold gradient-text">Console</h1>
            <span className="text-xs text-slate-500 font-medium">Portfolio CMS</span>
          </div>
        ) : (
          <span className="text-xl font-heading font-bold gradient-text">C</span>
        )}
        <div className={`flex gap-2 ${collapsed ? 'flex-col items-center' : ''}`}>
          <button
            onClick={() => navigate('/')}
            className="p-2 text-slate-400 hover:text-white bg-white/5 rounded-lg transition-all duration-200"
            title="Back to Portfolio"
          >
            <FaArrowLeft size={12} />
          </button>
          <button
            onClick={toggleCollapsed}
            className="p-2 text-slate-400 hover:text-white bg-white/5 rounded-lg transition-all duration-200"
            title={collapsed ? "Expand Menu" : "Collapse Menu"}
          >
            {collapsed ? <FaChevronRight size={12} /> : <FaChevronLeft size={12} />}
          </button>
        </div>
      </div>

      {/* Authenticated User Quick Info */}
      {user && (
        <div 
          className={`px-4 py-4 border-b border-white/5 flex items-center gap-3 bg-dark-900/40 justify-center ${collapsed ? '' : 'md:justify-start'}`}
          title={`@${user.login} (${user.name || 'Administrator'})`}
        >
          <img
            src={user.avatar_url}
            alt={user.login}
            className="w-10 h-10 rounded-full border border-primary-500/20 shrink-0"
          />
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">@{user.login}</p>
              <p className="text-xs text-slate-500 truncate">{user.name || 'Administrator'}</p>
            </div>
          )}
        </div>
      )}

      {/* Menu Navigation Links */}
      <nav className="flex-grow p-2 md:p-4 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            title={item.name}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                collapsed ? 'justify-center' : ''
              } ${
                isActive
                  ? 'bg-primary-500/10 text-primary-400 border border-primary-500/10 shadow-lg shadow-primary-500/5'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`
            }
          >
            {item.icon}
            {!collapsed && <span>{item.name}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Logout button */}
      <div className="p-4 border-t border-white/5">
        <button
          onClick={logout}
          title="Sign Out"
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-all duration-200 ${collapsed ? 'justify-center' : ''}`}
        >
          <FaSignOutAlt size={18} />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
