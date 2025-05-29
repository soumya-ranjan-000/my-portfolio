import ProjectCard from '../components/ProjectCard';
import { projectsList } from "../data/projects";

function Projects() {
return (
    <div className="min-h-screen flex flex-col items-center text-center justify-center  px-4 bg-blue-50 transition-colors duration-300">
        <h2
            className="text-4xl font-extrabold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 drop-shadow-lg tracking-tight"
            style={{ fontFamily: "'Pacifico', cursive" }}
        >
            <span className="inline-block align-middle mr-3">
                <svg className="w-8 h-8 inline-block text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
            </span>
            My Projects
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projectsList.map((project) => (
                <ProjectCard key={project.id} {...project} />
            ))}
        </div>
    </div>
);
}

export default Projects;
