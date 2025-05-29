import ProjectCard from '../components/ProjectCard';

const projectList = [
  {
    id: 'portfolio',
    title: 'React Portfolio',
    image: 'src/assets/brand.png',
    description: 'My personal portfolio built with React and Tailwind CSS.',
  },
  {
    id: 'automation using plywright',
    title: 'Automation Framework Using Playwright',
    image: 'src/images/projects/pw_cucumber_java.png',
    description: 'A comprehensive BDD framework using Playwright and Cucumber with Java.',
  },
  {
    id: 'Andvance Reporting with grafana & mongodb',
    title: 'Andvance Reporting using grafana & mongodb',
    image: 'src/images/projects/grafana_mongo.png',
    description: 'Create advanced reports using Grafana and MongoDB for data visualization.',
  }
];

function Projects() {
return (
    <div className="max-w-6xl mx-auto px-4 py-10 mt-20 font-['Roboto']">
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
            {projectList.map((project) => (
                <ProjectCard key={project.id} {...project} />
            ))}
        </div>
    </div>
);
}

export default Projects;
