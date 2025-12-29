import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiMenuAlt3, HiX } from 'react-icons/hi'; // Assuming react-icons is installed

function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();

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

    // Close menu when route changes
    useEffect(() => {
        setIsOpen(false);
    }, [location]);

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'py-4' : 'py-6'
                }`}
        >
            <div
                className={`mx-auto max-w-7xl px-6 transition-all duration-300 ${scrolled ? 'bg-dark-900/40 backdrop-blur-xl shadow-2xl border border-white/10' : ''
                    } rounded-full mt-2`}
                // Note: The rounded/margin approach gives it a floating island feel if restricted width, 
                // but here we are doing full width sticky header or floating depending on preference.
                // Let's go effectively full width for better UX on standard sites, but glass effect.
                style={{
                    // Resetting some classes for the specific "floating island" look if desired
                    maxWidth: scrolled ? '85%' : '1280px', // Shrink slightly on scroll for effect
                    marginTop: scrolled ? '1rem' : '0',
                    borderRadius: scrolled ? '9999px' : '0', // Fully rounded pills
                }}
            >
                <div className={`flex items-center justify-between transition-all duration-300 ${scrolled ? 'py-2' : 'py-0'}`}>
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="relative w-10 h-10 flex items-center justify-center rounded-full overflow-hidden border-2 border-primary-500 shadow-lg group-hover:shadow-primary-500/30 transition-all duration-300">
                            <img
                                src="/images/profile.png"
                                alt="Profile"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "https://ui-avatars.com/api/?name=Soumya+Ranjan&background=0D8ABC&color=fff";
                                }}
                            />
                        </div>
                        <span className="text-xl font-heading font-bold text-white tracking-wide group-hover:text-primary-400 transition-colors">
                            SRG
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <ul className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <li key={link.name}>
                                <Link
                                    to={link.path}
                                    className={`relative text-sm font-medium transition-colors hover:text-primary-400 ${location.pathname === link.path ? 'text-white' : 'text-slate-400'
                                        }`}
                                >
                                    {link.name}
                                    {location.pathname === link.path && (
                                        <motion.div
                                            layoutId="navbar-indicator"
                                            className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full"
                                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                        />
                                    )}
                                </Link>
                            </li>
                        ))}
                    </ul>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-2 text-slate-300 hover:text-white transition-colors"
                        >
                            {isOpen ? <HiX size={28} /> : <HiMenuAlt3 size={28} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute top-20 left-4 right-4 bg-dark-800/95 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl md:hidden z-40"
                    >
                        <ul className="flex flex-col gap-4">
                            {navLinks.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        to={link.path}
                                        className={`block text-lg font-medium p-2 rounded-lg transition-colors ${location.pathname === link.path
                                            ? 'bg-white/10 text-white'
                                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                                            }`}
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}

export default Navbar;
