import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiMenuAlt3, HiX } from 'react-icons/hi';
import { FaShieldAlt, FaSignOutAlt } from 'react-icons/fa';
import { useGitHubAuth } from '../hooks/useGitHubAuth';

function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();
    const { isAuthorized, logout } = useGitHubAuth();

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Projects', path: '/projects' },
        { name: 'Articles', path: '/articles' },
        { name: 'About', path: '/about' },
        { name: 'Contact', path: '/contact' },
    ];

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setIsOpen(false);
    }, [location]);

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'py-3' : 'py-5'}`}>
            <div
                className={`mx-auto transition-all duration-500 border border-white/0 ${
                    scrolled 
                        ? 'bg-dark-900/60 backdrop-blur-xl shadow-2xl border-white/5 shadow-primary-500/5' 
                        : 'bg-transparent'
                }`}
                style={{
                    maxWidth: scrolled ? '88%' : '1240px',
                    borderRadius: scrolled ? '24px' : '0px',
                    paddingLeft: scrolled ? '1.5rem' : '1rem',
                    paddingRight: scrolled ? '1.5rem' : '1rem',
                }}
            >
                <div className={`flex items-center justify-between transition-all duration-300 ${scrolled ? 'py-2.5' : 'py-2'}`}>
                    
                    {/* Brand Section */}
                    <Link to="/" className="flex items-center gap-2.5 group select-none">
                        <div className="relative w-9 h-9 flex items-center justify-center rounded-xl overflow-hidden border border-white/10 group-hover:border-primary-500/40 shadow-inner group-hover:shadow-primary-500/10 transition-all duration-300">
                            {/* Brand Logo Integration */}
                            <img
                                src="/logo.png"
                                alt="Brand Logo"
                                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "https://ui-avatars.com/api/?name=Soumya+Ranjan&background=0D8ABC&color=fff";
                                }}
                            />
                        </div>
                        <span className="text-lg font-heading font-extrabold text-white tracking-wider group-hover:text-primary-400 transition-colors uppercase">
                            Soumya<span className="text-primary-400 font-medium">.dev</span>
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-7">
                        <ul className="flex items-center gap-7">
                            {navLinks.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        to={link.path}
                                        className={`relative text-xs font-semibold uppercase tracking-wider transition-colors hover:text-primary-400 ${
                                            location.pathname === link.path ? 'text-white' : 'text-slate-400'
                                        }`}
                                    >
                                        {link.name}
                                        {location.pathname === link.path && (
                                            <motion.div
                                                layoutId="navbar-indicator"
                                                className="absolute -bottom-1.5 left-0 right-0 h-[2px] bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full"
                                                transition={{ type: "spring", stiffness: 350, damping: 28 }}
                                            />
                                        )}
                                    </Link>
                                </li>
                            ))}
                        </ul>

                        {/* Portal / Authorized Admin Shortcut Button */}
                        {isAuthorized && (
                            <div className="flex items-center gap-2.5 border-l border-white/10 pl-6 ml-1.5">
                                <Link
                                    to="/admin"
                                    className="px-3.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 hover:border-emerald-500/50 text-[10px] font-bold text-emerald-400 hover:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5 transition-all duration-200 select-none shadow shadow-emerald-500/5 hover:shadow-emerald-500/10"
                                >
                                    <FaShieldAlt size={10} className="animate-pulse text-emerald-400" />
                                    CMS Dashboard
                                </Link>
                                <button
                                    onClick={logout}
                                    className="p-2 rounded-lg bg-white/5 border border-white/5 hover:bg-red-500/10 hover:border-red-500/20 text-slate-400 hover:text-red-400 transition-all duration-200"
                                    title="Logout of CMS session"
                                >
                                    <FaSignOutAlt size={10} />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Toggle button */}
                    <div className="md:hidden flex items-center gap-3">
                        {isAuthorized && (
                            <Link
                                to="/admin"
                                className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                                title="Admin Dashboard"
                            >
                                <FaShieldAlt size={12} />
                            </Link>
                        )}
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-2 text-slate-300 hover:text-white transition-colors"
                        >
                            {isOpen ? <HiX size={26} /> : <HiMenuAlt3 size={26} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Dropdown Drawer */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-18 left-4 right-4 bg-dark-900/90 backdrop-blur-2xl border border-white/5 rounded-2xl p-5 shadow-2xl md:hidden z-40"
                    >
                        <ul className="flex flex-col gap-2.5">
                            {navLinks.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        to={link.path}
                                        className={`block text-sm font-semibold uppercase tracking-wider px-3.5 py-2.5 rounded-xl transition-all ${
                                            location.pathname === link.path
                                                ? 'bg-primary-500/10 text-primary-400 border border-primary-500/10'
                                                : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                                        }`}
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                            {isAuthorized && (
                                <li className="border-t border-white/5 pt-3 mt-1 flex flex-col gap-2">
                                    <Link
                                        to="/admin"
                                        className="block text-center text-sm font-bold uppercase tracking-wider py-2.5 px-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl"
                                    >
                                        CMS Dashboard
                                    </Link>
                                    <button
                                        onClick={logout}
                                        className="w-full text-center text-xs font-bold uppercase tracking-wider py-2.5 bg-white/5 text-red-400 rounded-xl"
                                    >
                                        Logout Session
                                    </button>
                                </li>
                            )}
                        </ul>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}

export default Navbar;
