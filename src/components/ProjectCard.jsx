import { Link } from 'react-router-dom';

function ProjectCard({ id, title, image, description }) {
return (
    <Link to={`/projects/${id}`} className="block bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition">
        <img
            src={image}
            alt={title}
            className="w-full h-48 object-contain p-5 shadow-inner shadow-gray-300"
            style={{ boxShadow: 'inset 0 -3px 3px -3px rgba(0,0,0,0.15)' }}
        />
        <div className="p-4">
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-sm text-gray-600 mt-2">{description}</p>
        </div>
    </Link>
);
}

export default ProjectCard;
