import { useParams } from 'react-router-dom';
import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { FaGithub, FaTimes, FaSearchPlus, FaSearchMinus } from 'react-icons/fa';
import NotebookEmbeds from '../components/NotebookEmbeds';
import MarkdownContent, { createMarkdownComponents } from '../components/reader/MarkdownContent';
import ReaderShell from '../components/reader/ReaderShell';
import { extractMarkdownHeadings as parseMarkdownHeadings } from '../components/reader/markdownUtils';

import { useCMS, fetchCMSContent } from '../hooks/useCMS';

function ProjectDetail() {
  const { slug } = useParams();
  const { projects, loadingProjects } = useCMS();
  const [project, setProject] = useState(null);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  const outlineItems = useMemo(() => {
    return parseMarkdownHeadings(content);
  }, [content]);

  useEffect(() => {
    const loadProjectData = async () => {
      if (loadingProjects) return;
      
      setLoading(true);
      try {
        // Find matching project from merged projects list (local + dynamic target stores)
        const foundProject = projects.find(p => p.slug === slug);
        if (!foundProject) {
          throw new Error('Project not found in CMS or static data');
        }

        setProject(foundProject);

        // Fetch markdown content using the specific storage target ID
        const text = await fetchCMSContent(slug, 'projects', foundProject.storageTargetId);
        setContent(text);
      } catch (err) {
        console.error("Error fetching dynamic project:", err);
        setContent("Could not load project details.");
        setProject(null);
      } finally {
        setLoading(false);
      }
    };

    loadProjectData();
  }, [slug, projects, loadingProjects]);

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

  if (loadingProjects || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900 text-slate-200">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-lg font-medium text-slate-400">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (!project) return <div className='mt-20 text-center text-white'>Project not found</div>;

  const readerMarkdownComponents = createMarkdownComponents({
    accent: 'primary',
    imageAlt: 'Project asset',
    onImageClick: setPopupImg,
    onVideoLink: setVideoModal,
  });

  return (
    <>
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-[calc(100vh-5.5rem)] px-3 pb-10 pt-20 md:px-5"
      >
        <ReaderShell
          outlineItems={outlineItems}
          outlineTitle="Project outline"
          header={
            <header className="border-b border-white/10 px-4 py-5 md:px-8 lg:px-10">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-primary-400/80">
                    Project brief
                  </p>
                  <h1 className="text-3xl font-heading font-bold leading-tight text-white md:text-4xl">
                    {project.title}
                  </h1>
                </div>
              {project.github && (
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-white/10 bg-dark-900/70 px-3 py-2 text-sm font-semibold text-slate-200 transition-colors hover:border-primary-500/50 hover:text-primary-400"
                >
                  <FaGithub /> <span>View Source</span>
                </a>
              )}
              </div>
            </header>
          }
        >
          <MarkdownContent content={content} components={readerMarkdownComponents} />

              <NotebookEmbeds item={project} accent="primary" />

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
        </ReaderShell>
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
