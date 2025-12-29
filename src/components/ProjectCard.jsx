import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

function ProjectCard({ id, slug, title, image, description, index }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            viewport={{ once: true }}
        >
            <Link
                to={`/projects/${slug}`}
                className="group block h-fullglass-card rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-primary-500/10 transition-all duration-300 transform hover:-translate-y-2"
            >
                {/* Image Container */}
                <div className="relative overflow-hidden aspect-video bg-dark-800/50 p-6 flex items-center justify-center border-b border-white/5">
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
                    <img
                        src={image}
                        alt={title}
                        className="w-full h-full object-contain transform group-hover:scale-110 transition-transform duration-500 relative z-0"
                    />
                </div>

                {/* Content */}
                <div className="p-6 bg-dark-800/40 backdrop-blur-sm border border-white/5 rounded-b-2xl h-full">
                    <h3 className="text-xl font-heading font-bold text-white mb-2 group-hover:text-primary-400 transition-colors">
                        {title}
                    </h3>
                    <p className="text-slate-400 text-sm line-clamp-3 leading-relaxed">
                        {description}
                    </p>
                </div>
            </Link>
        </motion.div>
    );
}

export default ProjectCard;
