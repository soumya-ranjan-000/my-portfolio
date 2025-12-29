import ProjectCard from '../components/ProjectCard';
import { projectsList } from "../data/projects";
import { motion } from 'framer-motion';

function Projects() {
    return (
        <div className="py-20 w-full px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-7xl mx-auto text-center mb-16"
            >
                <h2 className="text-4xl md:text-5xl font-heading font-bold text-white mb-6">
                    Featured <span className="gradient-text">Projects</span>
                </h2>
                <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                    A collection of my recent work in test automation, web development, and software engineering.
                </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                {projectsList.map((project, index) => (
                    <ProjectCard key={project.id} {...project} index={index} />
                ))}
            </div>
        </div>
    );
}

export default Projects;
