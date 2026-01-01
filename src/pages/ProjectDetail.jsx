import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { projectsList } from "../data/projects";
import { motion } from 'framer-motion';
import { FaGithub, FaTimes, FaSearchPlus, FaSearchMinus } from 'react-icons/fa';

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

  if (!project) return <div className='mt-20 text-center text-white'>Project not found</div>;

  // Zoom / Popup Logic
  const [popupImg, setPopupImg] = useState(null);
  const [videoModal, setVideoModal] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [drag, setDrag] = useState({ isDragging: false, startX: 0, startY: 0, offsetX: 0, offsetY: 0 });

  const handleZoomIn = (e) => { e.stopPropagation(); setZoom((z) => Math.min(z + 0.2, 3)); };
  const handleZoomOut = (e) => { e.stopPropagation(); setZoom((z) => Math.max(z - 0.2, 0.5)); };
  const handleClose = (e) => { e.stopPropagation(); setPopupImg(null); setZoom(1); };

  const handleImgMouseDown = (e) => {
    e.preventDefault(); e.stopPropagation();
    setDrag(d => ({ ...d, isDragging: true, startX: e.clientX, startY: e.clientY }));
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

  const handleImgMouseUp = () => setDrag(d => ({ ...d, isDragging: false }));

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
  }, [drag.isDragging]);

  useEffect(() => {
    if (!popupImg) setDrag({ isDragging: false, startX: 0, startY: 0, offsetX: 0, offsetY: 0 });
  }, [popupImg]);

  return (
    <>
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen py-20 px-4 flex justify-center items-start"
      >
        <div className="glass-card max-w-5xl w-full mx-auto px-8 py-10 rounded-2xl md:px-12">
          {/* Header */}
          <div className="mb-8 border-b border-white/10 pb-6">
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-white mb-4">{project.title}</h1>
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-dark-900 border border-white/10 hover:border-primary-500/50 hover:text-primary-400 transition-colors"
              >
                <FaGithub /> <span>View Source</span>
              </a>
            )}
          </div>

          {/* Markdown Content */}
          <div className="prose prose-invert prose-lg max-w-none">
            <ReactMarkdown components={{
              h1: ({ node, ...props }) => <h1 className="text-3xl font-bold mt-8 mb-4 text-white" {...props} />,
              h2: ({ node, ...props }) => <h2 className="text-2xl font-semibold mt-6 mb-3 text-primary-400" {...props} />,
              h3: ({ node, ...props }) => <h3 className="text-xl font-semibold mt-4 mb-2 text-primary-200" {...props} />,
              p: ({ node, ...props }) => <p className="mb-4 text-slate-300 leading-relaxed" {...props} />,
              ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-4 text-slate-300" {...props} />,
              li: ({ node, ...props }) => <li className="mb-1" {...props} />,
              strong: ({ node, ...props }) => <strong className="text-white font-bold" {...props} />,
              img: ({ node, ...props }) => (
                // eslint-disable-next-line jsx-a11y/alt-text
                <img
                  className="rounded-xl my-6 shadow-lg hover:shadow-primary-500/20 transition-all cursor-zoom-in border border-white/5"
                  {...props}
                  onClick={() => setPopupImg(props.src)}
                  style={{ maxWidth: "100%" }}
                />
              ),
              a: ({ node, ...props }) => {
                const href = props.href || '';
                const children = props.children;

                // YouTube short/long links
                const ytMatch = href && href.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);

                // Direct video files (mp4/webm/ogg)
                if (href.match(/\.(mp4|webm|ogg)(\?.*)?$/i)) {
                  return (
                    // eslint-disable-next-line jsx-a11y/media-has-caption
                    <video controls className="w-full rounded-xl my-6" src={href}>
                      Your browser does not support the video tag.
                    </video>
                  );
                }

                if (ytMatch) {
                  const id = ytMatch[1];
                  const src = `https://www.youtube.com/embed/${id}`;
                  return (
                    <div className="aspect-video rounded-xl overflow-hidden my-6 border border-white/10 shadow-lg">
                      <iframe src={src} title="YouTube video" allowFullScreen className="w-full h-full" frameBorder="0" />
                    </div>
                  );
                }

                const text = (Array.isArray(children) ? children.join('') : children) || '';
                const shouldOpenAsVideo = /demo|watch|video/i.test(text) || /user-attachments|raw.githubusercontent.com/.test(href);

                const handleClick = (e) => {
                  if (shouldOpenAsVideo) {
                    e.preventDefault();
                    setVideoModal(href);
                  }
                };

                return (
                  <a
                    className="text-primary-400 hover:text-primary-300 underline underline-offset-4"
                    href={href}
                    onClick={handleClick}
                    target={shouldOpenAsVideo ? undefined : '_blank'}
                    rel={shouldOpenAsVideo ? undefined : 'noopener noreferrer'}
                  >
                    {children}
                  </a>
                );
              },
              code: ({ node, inline, ...props }) =>
                inline
                  ? <code className="bg-dark-900 px-1.5 py-0.5 rounded text-secondary-400 font-mono text-sm" {...props} />
                  : <code className="block bg-dark-900 p-4 rounded-lg text-slate-300 font-mono text-sm overflow-x-auto my-4 border border-white/5" {...props} />,
            }}>{content}</ReactMarkdown>
          </div>

          {project.video && (
            <div className="mt-10">
              <h3 className="text-2xl font-bold text-white mb-4">Demo Video</h3>
              <div className="aspect-video rounded-xl overflow-hidden border border-white/10 shadow-lg">
                <iframe
                  width="100%"
                  height="100%"
                  src={project.video}
                  title="Project Video"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            </div>
          )}
        </div>
      </motion.section>

      {/* Image Popup */}
      {popupImg && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={handleClose}
        >
          <button
            className="fixed top-6 right-6 bg-dark-800 text-white rounded-full p-3 hover:bg-dark-700 transition z-50 border border-white/10"
            onClick={handleClose}
          >
            <FaTimes size={20} />
          </button>

          <div className="relative max-w-4xl w-full flex justify-center" onClick={e => e.stopPropagation()}>
            <img
              src={popupImg}
              alt="Full size"
              className="max-h-[80vh] max-w-[90vw] rounded-lg shadow-2xl cursor-move"
              style={{
                transform: `scale(${zoom}) translate(${drag.offsetX}px, ${drag.offsetY}px)`,
              }}
              onMouseDown={handleImgMouseDown}
              draggable={false}
            />

            <div className="absolute bottom-[-60px] left-1/2 -translate-x-1/2 flex gap-4 bg-dark-800/80 px-6 py-2 rounded-full border border-white/10 backdrop-blur-md">
              <button className="text-white hover:text-primary-400 transition" onClick={handleZoomOut}><FaSearchMinus size={20} /></button>
              <span className="text-slate-400 text-sm py-1 min-w-[3rem] text-center">{Math.round(zoom * 100)}%</span>
              <button className="text-white hover:text-primary-400 transition" onClick={handleZoomIn}><FaSearchPlus size={20} /></button>
            </div>
          </div>
        </div>
      )}
      {/* Video Modal */}
      {videoModal && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={() => setVideoModal(null)}
        >
          <button
            className="fixed top-6 right-6 bg-dark-800 text-white rounded-full p-3 hover:bg-dark-700 transition z-80 border border-white/10"
            onClick={(e) => { e.stopPropagation(); setVideoModal(null); }}
          >
            <FaTimes size={20} />
          </button>

          <div className="relative max-w-4xl w-full px-4" onClick={e => e.stopPropagation()}>
            <video controls className="w-full max-h-[80vh] rounded-lg shadow-2xl" src={videoModal} />
          </div>
        </div>
      )}
    </>
  );
}

export default ProjectDetail;
