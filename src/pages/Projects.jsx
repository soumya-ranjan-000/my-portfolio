import ProjectCard from '../components/ProjectCard';
import { projectsList } from "../data/projects";

function Projects() {
return (
    <div className="min-h-screen flex flex-col items-center text-center justify-center  px-4 bg-stone-200">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projectsList.map((project) => (
                <ProjectCard key={project.id} {...project} />
            ))}
        </div>
    </div>
);
}

export default Projects;
