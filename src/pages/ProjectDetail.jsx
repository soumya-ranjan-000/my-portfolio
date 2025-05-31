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
  const [popupImg, setPopupImg] = useState(null);
  const [zoom, setZoom] = useState(1);

  const handleZoomIn = (e) => {
    e.stopPropagation();
    setZoom((z) => Math.min(z + 0.2, 3));
  };

  const handleZoomOut = (e) => {
    e.stopPropagation();
    setZoom((z) => Math.max(z - 0.2, 0.5));
  };

  const handleClose = (e) => {
    e.stopPropagation();
    setPopupImg(null);
    setZoom(1);
  };

  // State for dragging
  const [drag, setDrag] = useState({ isDragging: false, startX: 0, startY: 0, offsetX: 0, offsetY: 0 });

  // Handlers for drag events
  const handleImgMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDrag(d => ({
      ...d,
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY
    }));
  };

  const handleImgMouseMove = (e) => {
    if (!drag.isDragging) return;
    setDrag(d => ({
      ...d,
      offsetX: d.offsetX + (e.clientX - d.startX),
      offsetY: d.offsetY + (e.clientY - d.startY),
      startX: e.clientX,
      startY: e.clientY
    }));
  };

  const handleImgMouseUp = () => {
    setDrag(d => ({ ...d, isDragging: false }));
  };

  // Attach/remove mousemove/mouseup listeners when dragging
  useEffect(() => {
    if (drag.isDragging) {
      window.addEventListener('mousemove', handleImgMouseMove);
      window.addEventListener('mouseup', handleImgMouseUp);
    } else {
      window.removeEventListener('mousemove', handleImgMouseMove);
      window.removeEventListener('mouseup', handleImgMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleImgMouseMove);
      window.removeEventListener('mouseup', handleImgMouseUp);
    };
    // eslint-disable-next-line
  }, [drag.isDragging]);

  // Reset drag offset when popup closes
  useEffect(() => {
    if (!popupImg) {
      setDrag({ isDragging: false, startX: 0, startY: 0, offsetX: 0, offsetY: 0 });
    }
  }, [popupImg]);

  return (
    <>
      <section
        className="min-h-screen py-10 px-2 md:px-0 flex justify-center items-start bg-stone-100"
      >
        <div className="max-w-5xl w-full mx-auto px-8 py-2 mt-10 font-['Roboto'] bg-white rounded-2xl border border-gray-300 bg-stone-50 shadow-lg">
          <ReactMarkdown components={{
            h1: ({ node, ...props }) => <h1 className="text-4xl font-bold mt-6 mb-4 text-zinc-900" {...props} />,
            h2: ({ node, ...props }) => <h2 className="text-2xl font-semibold mt-4 mb-2 text-gray-800" {...props} />,
            p: ({ node, ...props }) => <p className="mb-4 text-gray-800" {...props} />,
            img: ({ node, ...props }) => (
              // eslint-disable-next-line jsx-a11y/alt-text
              <img
                className="rounded-md my-4 shadow cursor-pointer transition-transform"
                {...props}
                onClick={() => setPopupImg(props.src)}
                style={{ maxWidth: "100%" }}
              />
            ),
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
      {popupImg && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80"
          onClick={handleClose}
        >
          {/* Close button at top right of the screen */}
                <button
                className="fixed top-4 right-4 bg-white rounded-full p-2 shadow hover:bg-gray-200 z-50"
                onClick={handleClose}
                aria-label="Close image"
                >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                </button>
                <div className="relative max-w-xl w-full flex justify-center">
                <img
                  src={popupImg}
                  alt="Full size"
                  className="max-h-[60vh] max-w-[60vw] rounded shadow-lg transition-transform duration-200 cursor-grab active:cursor-grabbing"
                  style={{
                  transform: `scale(${zoom}) translate(${drag.offsetX}px, ${drag.offsetY}px)`,
                  userSelect: "none"
                  }}
                  onClick={e => e.stopPropagation()}
                  onMouseDown={handleImgMouseDown}
                  draggable={false}
                />
            
            <div className="absolute left-1/2 -translate-x-1/2 -bottom-14 flex gap-3 z-10">
              <button
                className="bg-white rounded-full p-2 shadow hover:bg-gray-200"
                onClick={handleZoomOut}
                aria-label="Zoom out"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <button
                className="bg-white rounded-full p-2 shadow hover:bg-gray-200"
                onClick={handleZoomIn}
                aria-label="Zoom in"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ProjectDetail;
