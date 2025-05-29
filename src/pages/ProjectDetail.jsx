import { useParams } from 'react-router-dom';

function ProjectDetail() {
  const { id } = useParams();

  // In a real app, fetch dynamically
  const project = {
    title: 'React Portfolio Website',
    description: 'A detailed overview of how I built my portfolio site.',
    steps: [
      'Set up with Vite and Tailwind CSS',
      'Created components like Hero, Navbar, Footer, etc.',
      'Deployed on Render',
    ],
    image: '/images/project1.jpg',
    video: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    github: 'https://github.com/soumya-ranjan-000/my-portfolio',
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h2 className="text-3xl font-bold mb-4">{project.title}</h2>
      <img src={project.image} alt={project.title} className="w-full rounded mb-6" />
      <p className="mb-4">{project.description}</p>

      <ul className="list-disc list-inside mb-6">
        {project.steps.map((step, idx) => (
          <li key={idx}>{step}</li>
        ))}
      </ul>

      <div className="mb-6">
        <iframe
          width="100%"
          height="315"
          src={project.video}
          title="Project Video"
          allowFullScreen
          className="rounded"
        />
      </div>

      <a
        href={project.github}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        View GitHub Repo
      </a>
    </div>
  );
}

export default ProjectDetail;
