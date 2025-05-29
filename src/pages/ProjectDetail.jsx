import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { projectsList } from "../data/projects";

function ProjectDetail() {
  const { slug } = useParams();
  const project = projectsList.find(p => p.slug === slug);
  const [content, setContent] = useState("");

  useEffect(() => {
    if (project) {
      fetch(`/projects/${project.slug}.md`)
        .then((res) => res.text())
        .then(setContent)
        .catch((err) => {
          console.error("Error fetching markdown:", err);
          setContent("Could not load project details.");
        });
    }
  }, [project]);

  if (!project) return <div className='mt-10'>Project not found</div>;
  return (
    <section
      className="min-h-screen py-16 px-2 md:px-0 flex justify-center items-start bg-blue-50 transition-colors duration-300"
    >
      <div className="max-w-5xl w-full mx-auto px-8 py-10 mt-10 font-['Roboto'] bg-white rounded-2xl border border-gray-300">
        {/* <h1 className="text-3xl font-bold mb-4 text-blue-700">{project.title}</h1> */}
        <ReactMarkdown components={{
          h1: ({ node, ...props }) => <h1 className="text-3xl font-bold mt-6 mb-4 text-blue-700" {...props} />,
          h2: ({ node, ...props }) => <h2 className="text-2xl font-semibold mt-4 mb-2 text-blue-600" {...props} />,
          p: ({ node, ...props }) => <p className="mb-4 text-gray-800" {...props} />,
          img: ({ node, ...props }) => <img className="rounded-md my-4 shadow" {...props} />,
          a: ({ node, ...props }) => <a className="text-blue-600 underline" {...props} />,
        }}>{content}</ReactMarkdown>

        {project.video && (
          <div className="my-6">
            <iframe
              width="100%"
              height="315"
              src={project.video}
              title="Project Video"
              allowFullScreen
              className="rounded shadow-lg"
            />
          </div>
        )}

        {project.github && (
          <a
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 shadow transition-colors duration-200"
          >
            View GitHub Repo
          </a>
        )}
      </div>
    </section>
  );
}

export default ProjectDetail;
