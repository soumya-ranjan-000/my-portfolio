import React, { useState, useMemo } from 'react';
import ProjectCard from '../components/ProjectCard';
import { useCMS } from "../hooks/useCMS";
import { motion, AnimatePresence } from 'framer-motion';
import { FaSpinner, FaSearch, FaTags } from 'react-icons/fa';

function Projects() {
    const { projects, loadingProjects } = useCMS();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTag, setSelectedTag] = useState('all');

    // 1. Extract all unique tags dynamically from loaded projects
    const allTags = useMemo(() => {
        const tagsSet = new Set(['all']);
        projects.forEach(project => {
            if (project.tags && Array.isArray(project.tags)) {
                project.tags.forEach(tag => {
                    if (tag) tagsSet.add(tag.trim().toLowerCase());
                });
            }
        });
        return Array.from(tagsSet);
    }, [projects]);

    // 2. Filter projects list based on search query and selected tag
    const filteredProjects = useMemo(() => {
        return projects.filter(project => {
            const matchesSearch = 
                project.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                project.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (project.tags && project.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));

            const matchesTag = 
                selectedTag === 'all' || 
                (project.tags && project.tags.some(tag => tag.trim().toLowerCase() === selectedTag));

            return matchesSearch && matchesTag;
        });
    }, [projects, searchQuery, selectedTag]);

    // Helper to format tag label
    const formatTagLabel = (tag) => {
        if (tag === 'all') return 'All Projects';
        if (tag === 'bdd') return 'BDD';
        if (tag === 'llm' || tag === 'api') return tag.toUpperCase();
        return tag.charAt(0).toUpperCase() + tag.slice(1);
    };

    return (
        <div className="py-24 w-full px-6 min-h-screen bg-dark-950 relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/5 blur-[120px] rounded-full -translate-x-1/2 pointer-events-none"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary-500/5 blur-[120px] rounded-full translate-x-1/2 pointer-events-none"></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-7xl mx-auto text-center mb-12 relative z-10"
            >
                <h2 className="text-4xl md:text-5xl font-heading font-bold text-white mb-5 select-none">
                    Featured <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-400">Projects</span>
                </h2>
                <p className="text-slate-400 max-w-2xl mx-auto text-base md:text-lg leading-relaxed select-none">
                    A highly detailed showcase of BDD frameworks, self-healing automation architectures, real-time analytics dashboards, and modern microservices testing pipelines.
                </p>
            </motion.div>

            {loadingProjects ? (
                <div className="flex flex-col items-center justify-center py-32 relative z-10">
                    <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-slate-400 font-medium">Loading high-fidelity portfolio from GitHub CMS...</p>
                </div>
            ) : (
                <div className="max-w-7xl mx-auto relative z-10">
                    {/* Search and Filters Panel */}
                    <div className="mb-12 flex flex-col gap-6 p-6 bg-dark-900/40 backdrop-blur-md border border-white/5 rounded-2xl shadow-xl">
                        {/* Search Input */}
                        <div className="relative w-full">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500">
                                <FaSearch size={14} />
                            </span>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search projects by title, description, or specific tools (e.g. 'playwright', 'kafka')..."
                                className="w-full pl-11 pr-4 py-3 bg-dark-950/80 border border-white/5 rounded-xl text-sm font-medium text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-primary-500/40 focus:ring-1 focus:ring-primary-500/10 transition-all duration-300 shadow-inner"
                            />
                        </div>

                        {/* Technology Filter Pills */}
                        <div className="flex flex-col gap-3">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 select-none">
                                <FaTags size={10} className="text-secondary-400" /> Filter by Technology
                            </span>
                            <div className="flex flex-wrap gap-2">
                                {allTags.map((tag) => (
                                    <button
                                        key={tag}
                                        onClick={() => setSelectedTag(tag)}
                                        className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider border select-none transition-all duration-300 ${
                                            selectedTag === tag
                                                ? 'bg-primary-500/20 border-primary-500/40 text-primary-300 shadow shadow-primary-500/5'
                                                : 'bg-dark-950/40 border-white/5 text-slate-400 hover:text-slate-200 hover:bg-dark-900/60'
                                        }`}
                                    >
                                        {formatTagLabel(tag)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Filtered Grid View */}
                    <AnimatePresence mode="popLayout">
                        {filteredProjects.length > 0 ? (
                            <motion.div 
                                layout
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                            >
                                {filteredProjects.map((project, index) => (
                                    <motion.div
                                        key={project.id || project.slug}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <ProjectCard {...project} index={index} />
                                    </motion.div>
                                ))}
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-center py-20 bg-dark-900/20 border border-white/5 rounded-2xl p-8 shadow-inner select-none"
                            >
                                <p className="text-slate-500 italic mb-2">No projects found matching your search parameters.</p>
                                <button
                                    onClick={() => { setSearchQuery(''); setSelectedTag('all'); }}
                                    className="text-xs font-bold text-primary-400 hover:underline uppercase tracking-wider"
                                >
                                    Clear all filters
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}

export default Projects;
