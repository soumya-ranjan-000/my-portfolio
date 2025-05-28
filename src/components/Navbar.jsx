import { Link } from 'react-router-dom';
import { useState } from 'react';

function Navbar() {
const [isOpen, setIsOpen] = useState(false);

return (
    <nav className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 shadow-lg fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
            <Link to="/" className="flex items-center space-x-2 group">
                {/* Modern SRG Logo */}
                <svg
                    className="h-10 w-10 transition-transform group-hover:rotate-6 group-hover:scale-110"
                    viewBox="0 0 48 48"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <circle cx="24" cy="24" r="22" fill="url(#srg-logo-gradient)" stroke="#fff" strokeWidth="2"/>
                    <defs>
                        <radialGradient id="srg-logo-gradient" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="#a5b4fc"/>
                            <stop offset="100%" stopColor="#6366f1"/>
                        </radialGradient>
                    </defs>
                    {/* S */}
                    <path
                        d="M16 32c0 2.5 3 4 6 4s6-1.5 6-4-3-3-6-3-6-1.5-6-4 3-4 6-4 6 1.5 6 4"
                        stroke="#fff"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        fill="none"
                        filter="url(#shadow)"
                    />
                    {/* R */}
                    <path
                        d="M28 16v16m0-8c3 0 6-1.5 6-4s-3-4-6-4"
                        stroke="#fff"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        fill="none"
                    />
                    <path
                        d="M28 24l5 8"
                        stroke="#fff"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        fill="none"
                    />
                    {/* G */}
                    <path
                        d="M36 28c0 4-2.5 7-7 7s-7-3-7-7 2.5-7 7-7c2.5 0 5 1 6 3"
                        stroke="#fff"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        fill="none"
                    />
                    <path
                        d="M34 30h-4"
                        stroke="#fff"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        fill="none"
                    />
                </svg>
                <span className="text-white font-extrabold text-xl tracking-widest drop-shadow-lg hidden sm:inline">SRG</span>
            </Link>
            {/* Hamburger menu button */}
            <button
                className="md:hidden flex items-center px-2 py-1 border rounded text-white border-white bg-white/10 hover:bg-white/20 transition"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle menu"
            >
                <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {isOpen ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                </svg>
            </button>
            {/* Desktop menu */}
            <ul className="hidden md:flex space-x-6 text-white font-semibold text-lg drop-shadow">
                <li><Link className="hover:text-indigo-200 transition" to="/">Home</Link></li>
                <li><Link className="hover:text-indigo-200 transition" to="/projects">Projects</Link></li>
                <li><Link className="hover:text-indigo-200 transition" to="/articles">Articles</Link></li>
                <li><Link className="hover:text-indigo-200 transition" to="/about">About</Link></li>
                <li><Link className="hover:text-indigo-200 transition" to="/contact">Contact</Link></li>
            </ul>
        </div>
        {/* Mobile menu */}
        {isOpen && (
            <ul className="md:hidden bg-gradient-to-b from-blue-700 via-indigo-700 to-purple-700 px-4 pb-3 pt-2 space-y-2 text-white font-semibold shadow-lg text-lg">
                <li><Link to="/" onClick={() => setIsOpen(false)} className="block hover:text-indigo-200 transition">Home</Link></li>
                <li><Link to="/projects" onClick={() => setIsOpen(false)} className="block hover:text-indigo-200 transition">Projects</Link></li>
                <li><Link to="/articles" onClick={() => setIsOpen(false)} className="block hover:text-indigo-200 transition">Articles</Link></li>
                <li><Link to="/about" onClick={() => setIsOpen(false)} className="block hover:text-indigo-200 transition">About</Link></li>
                <li><Link to="/contact" onClick={() => setIsOpen(false)} className="block hover:text-indigo-200 transition">Contact</Link></li>
            </ul>
        )}
    </nav>
);
}

export default Navbar;
