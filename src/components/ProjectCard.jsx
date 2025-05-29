import { Link } from 'react-router-dom';

function ProjectCard({ id, slug, title, image, description }) {
    return (
        <Link to={`/projects/${slug}`} className="block bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition w-72">
            <img
                src={image}
                alt={title}
                className="w-full h-36 object-contain p-3 shadow-inner shadow-gray-300"
                style={{ boxShadow: 'inset 0 -3px 3px -3px rgba(0,0,0,0.15)' }}
            />
            <div className="p-3">
                <h3 className="text-base font-semibold">{title}</h3>
                <p className="text-xs text-gray-600 mt-1">{description}</p>
            </div>
        </Link>
    );
}

export default ProjectCard;
