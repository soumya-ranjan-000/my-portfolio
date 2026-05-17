import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

function ProjectCard({ id, slug, title, image, description, tags = [], index }) {
    // Generate a subtle colored glow based on index or primary tag
    const glowColors = [
        'group-hover:shadow-primary-500/10',
        'group-hover:shadow-secondary-500/10',
        'group-hover:shadow-orange-500/10',
        'group-hover:shadow-emerald-500/10',
        'group-hover:shadow-sky-500/10'
    ];
    const borderGlows = [
        'group-hover:border-primary-500/30',
        'group-hover:border-secondary-500/30',
        'group-hover:border-orange-500/30',
        'group-hover:border-emerald-500/30',
        'group-hover:border-sky-500/30'
    ];
    const selectedColor = glowColors[index % glowColors.length];
    const selectedBorder = borderGlows[index % borderGlows.length];

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.5, ease: 'easeOut' }}
            viewport={{ once: true }}
            className="h-full"
        >
            <Link
                to={`/projects/${slug}`}
                className={`group flex flex-col h-full bg-dark-800/40 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden hover:bg-dark-800/60 shadow-lg ${selectedColor} ${selectedBorder} transition-all duration-300 transform hover:-translate-y-2`}
            >
                {/* Image Container with Dark Masking / Blending */}
                <div className="relative overflow-hidden aspect-video bg-[#f8fafc]/5 p-6 flex items-center justify-center border-b border-white/5 relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-900/40 to-transparent opacity-40 group-hover:opacity-10 transition-opacity duration-300 z-10" />
                    
                    {/* Subtle grid pattern background behind image to blend white backgrounds */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />

                    <img
                        src={image}
                        alt={title}
                        className="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-500 relative z-0 filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.25)]"
                    />
                </div>

                {/* Content Box */}
                <div className="p-6 flex flex-col flex-grow">
                    {/* Tag Badges */}
                    {tags && tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3.5 select-none">
                            {tags.slice(0, 4).map((tag, tIdx) => (
                                <span 
                                    key={tIdx} 
                                    className="px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider rounded-md bg-white/5 text-slate-300 border border-white/5 group-hover:border-primary-500/20 group-hover:bg-primary-500/5 group-hover:text-primary-300 transition-all duration-300"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}

                    <h3 className="text-lg md:text-xl font-heading font-bold text-white mb-2.5 group-hover:text-primary-400 transition-colors leading-snug">
                        {title}
                    </h3>
                    
                    <p className="text-slate-400 text-sm line-clamp-3 leading-relaxed mb-4 flex-grow">
                        {description}
                    </p>

                    {/* Learn More link in card footer */}
                    <div className="flex items-center text-xs font-bold text-primary-400 group-hover:text-primary-300 tracking-wider uppercase mt-auto select-none">
                        View Project Details
                        <span className="transform translate-x-0 group-hover:translate-x-1.5 transition-transform duration-300 ml-1.5">→</span>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}

export default ProjectCard;
