import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import ReactMarkdown from 'react-markdown';
import { 
  FaBold, FaItalic, FaHeading, FaCode, FaListUl, FaListOl, 
  FaQuoteLeft, FaLink, FaImage, FaVideo, FaEye, FaPen, FaYoutube, 
  FaMinus, FaSpinner, FaExpand, FaCompress
} from 'react-icons/fa';
import { useDropzone } from 'react-dropzone';
import CodeBlock from '../../components/CodeBlock';
import { storageManager } from '../services/storageManager';

const markdownComponents = {
  h1: ({ node, ...props }) => (
    <h1 className="text-3xl font-bold font-heading mt-8 mb-4 text-orange-500 border-b border-white/5 pb-2" {...props} />
  ),
  h2: ({ node, ...props }) => (
    <h2 className="text-2xl font-semibold font-heading mt-6 mb-3 text-primary-400" {...props} />
  ),
  h3: ({ node, ...props }) => (
    <h3 className="text-xl font-semibold font-heading mt-5 mb-2 text-secondary-400" {...props} />
  ),
  p: ({ node, ...props }) => (
    <p className="mb-4 text-slate-300 leading-relaxed tracking-wide text-sm md:text-base" {...props} />
  ),
  ul: ({ node, ...props }) => (
    <ul className="list-disc list-inside mb-4 pl-2 text-slate-300 marker:text-primary-500 space-y-1 text-sm md:text-base" {...props} />
  ),
  ol: ({ node, ...props }) => (
    <ol className="list-decimal list-inside mb-4 pl-2 text-slate-300 marker:text-secondary-500 space-y-1 text-sm md:text-base" {...props} />
  ),
  li: ({ node, ...props }) => (
    <li className="mb-1 hover:text-slate-200 transition-colors" {...props} />
  ),
  strong: ({ node, ...props }) => (
    <strong className="text-white font-bold" {...props} />
  ),
  blockquote: ({ node, ...props }) => (
    <blockquote className="border-l-4 border-primary-500 bg-primary-500/5 px-5 py-3 rounded-r-xl my-4 italic text-slate-400 font-medium text-sm md:text-base" {...props} />
  ),
  hr: ({ node, ...props }) => (
    <hr className="my-8 h-px border-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" {...props} />
  ),
  table: ({ node, ...props }) => (
    <div className="overflow-x-auto my-6 border border-white/5 rounded-xl">
      <table className="min-w-full divide-y divide-white/5" {...props} />
    </div>
  ),
  thead: ({ node, ...props }) => <thead className="bg-white/3" {...props} />,
  tbody: ({ node, ...props }) => <tbody className="divide-y divide-white/5" {...props} />,
  tr: ({ node, ...props }) => <tr className="hover:bg-white/1 transition-colors" {...props} />,
  th: ({ node, ...props }) => <th className="px-4 py-2 text-left text-xs font-bold text-slate-200 uppercase tracking-wider border-b border-white/5" {...props} />,
  td: ({ node, ...props }) => <td className="px-4 py-2.5 text-xs md:text-sm text-slate-300 font-medium" {...props} />,
  pre: ({ node, children, ...props }) => {
    const codeChild = React.Children.toArray(children)[0];
    if (codeChild && codeChild.props) {
      return (
        <CodeBlock 
          className={codeChild.props.className} 
          inline={false}
        >
          {codeChild.props.children}
        </CodeBlock>
      );
    }
    return <pre {...props}>{children}</pre>;
  },
  code: ({ node, className, children, ...props }) => (
    <CodeBlock inline={true} className={className} {...props}>
      {children}
    </CodeBlock>
  ),
  img: ({ node, ...props }) => (
    <img className="rounded-lg my-4 max-h-[300px] object-cover shadow border border-white/5" {...props} alt={props.alt || 'Preview image'} />
  ),
  a: ({ node, ...props }) => {
    const href = props.href || '';
    const ytMatch = href.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
    if (href.match(/\.(mp4|webm|ogg)(\?.*)?$/i)) {
      return (
        <video controls className="w-full max-h-[300px] rounded-lg my-4" src={href}>
          Your browser does not support the video tag.
        </video>
      );
    }
    if (ytMatch) {
      return (
        <div className="aspect-video max-h-[300px] rounded-lg overflow-hidden my-4 border border-white/10 shadow">
          <iframe src={`https://www.youtube.com/embed/${ytMatch[1]}`} title="YouTube preview" className="w-full h-full" frameBorder="0" allowFullScreen />
        </div>
      );
    }
    return <a className="text-primary-400 hover:underline" href={href} target="_blank" rel="noopener noreferrer">{props.children}</a>;
  }
};

export default function MarkdownEditor({ 
  value, 
  onChange, 
  editorType = 'project', 
  editorSlug = 'temp', 
  githubToken = null, 
  isImageUploading, 
  onImageUploadStart, 
  onImageUploadEnd,
  cms = null
}) {
  const [isPreview, setIsPreview] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const textareaRef = useRef(null);
  const previewRef = useRef(null);
  const activeScrollSourceRef = useRef(null);

  const handleEditorScroll = (e) => {
    if (activeScrollSourceRef.current === 'preview') return;
    activeScrollSourceRef.current = 'editor';

    const editorEl = e.target;
    const previewEl = previewRef.current;
    if (editorEl && previewEl) {
      const scrollRatio = editorEl.scrollTop / (editorEl.scrollHeight - editorEl.clientHeight);
      previewEl.scrollTop = scrollRatio * (previewEl.scrollHeight - previewEl.clientHeight);
    }

    clearTimeout(editorEl.scrollTimeout);
    editorEl.scrollTimeout = setTimeout(() => {
      activeScrollSourceRef.current = null;
    }, 100);
  };

  const handlePreviewScroll = (e) => {
    if (activeScrollSourceRef.current === 'editor') return;
    activeScrollSourceRef.current = 'preview';

    const previewEl = e.target;
    const editorEl = textareaRef.current;
    if (editorEl && previewEl) {
      const scrollRatio = previewEl.scrollTop / (previewEl.scrollHeight - previewEl.clientHeight);
      editorEl.scrollTop = scrollRatio * (editorEl.scrollHeight - editorEl.clientHeight);
    }

    clearTimeout(previewEl.scrollTimeout);
    previewEl.scrollTimeout = setTimeout(() => {
      activeScrollSourceRef.current = null;
    }, 100);
  };

  // Toggle fullscreen within webpage overlay bounds only
  const handleToggleFullscreen = () => {
    setIsMaximized(!isMaximized);
  };

  // Helper to insert markdown code at cursor position
  const insertMarkdown = (before, after = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);

    const replacement = before + (selectedText || 'text') + after;
    const newValue = text.substring(0, start) + replacement + text.substring(end);
    
    onChange(newValue);
    
    // Reset cursor focus and selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + (selectedText || 'text').length
      );
    }, 50);
  };

  // Image & Video File Drop Upload to Public CDN
  const onDrop = async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;
    const file = acceptedFiles[0];
    
    const isVideo = file.type.startsWith('video/');
    const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;

    setUploading(true);
    if (onImageUploadStart) onImageUploadStart();

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64 = reader.result.split(',')[1];
        
        const type = editorType === 'article' ? 'articles' : 'projects';
        const rawUrl = await storageManager.uploadMediaToCDN(type, editorSlug || 'temp', filename, base64, githubToken);
        
        if (isVideo) {
          insertMarkdown(`\n[Demo Video](${rawUrl})\n`);
        } else {
          insertMarkdown(`\n![${file.name}](${rawUrl})\n`);
        }
      };
    } catch (err) {
      console.error('Media upload failed:', err);
    } finally {
      setUploading(false);
      if (onImageUploadEnd) onImageUploadEnd();
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'video/*': ['.mp4', '.webm']
    }
  });

  const toolbarButtons = [
    { label: 'H1', icon: <FaHeading size={12} />, action: () => insertMarkdown('# ', '\n') },
    { label: 'H2', icon: <div className="flex items-center"><FaHeading size={12} /><span className="text-[9px] ml-0.5">2</span></div>, action: () => insertMarkdown('## ', '\n') },
    { label: 'H3', icon: <div className="flex items-center"><FaHeading size={12} /><span className="text-[9px] ml-0.5">3</span></div>, action: () => insertMarkdown('### ', '\n') },
    { label: 'Bold', icon: <FaBold />, action: () => insertMarkdown('**', '**') },
    { label: 'Italic', icon: <FaItalic />, action: () => insertMarkdown('*', '*') },
    { label: 'Inline Code', icon: <FaCode />, action: () => insertMarkdown('`', '`') },
    { label: 'Code Block', icon: <span className="text-xs font-mono font-bold">&lt;/&gt;</span>, action: () => insertMarkdown('```javascript\n', '\n```') },
    { label: 'Bullet List', icon: <FaListUl />, action: () => insertMarkdown('- ', '\n') },
    { label: 'Numbered List', icon: <FaListOl />, action: () => insertMarkdown('1. ', '\n') },
    { label: 'Blockquote', icon: <FaQuoteLeft />, action: () => insertMarkdown('> ', '\n') },
    { label: 'Link', icon: <FaLink />, action: () => insertMarkdown('[', '](url)') },
    { label: 'YouTube', icon: <FaYoutube />, action: () => insertMarkdown('[Watch Video](https://www.youtube.com/watch?v=VIDEO_ID)') },
    { label: 'Divider', icon: <FaMinus />, action: () => insertMarkdown('\n---\n') }
  ];

  // Handle image pasting (Ctrl + V) from clipboard
  const handlePaste = async (e) => {
    const items = e.clipboardData?.items;
    if (!items || !cms) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (!file) continue;

        // Prevent default text paste behavior
        e.preventDefault();

        // Reuse the dropzone upload mechanism!
        onDrop([file]);
        break;
      }
    }
  };

  if (isMaximized) {
    const maximizedMarkup = (
      <div 
        {...getRootProps()} 
        className="fixed inset-0 z-[9999] w-screen h-screen p-3 flex flex-col gap-3 bg-dark-900 overflow-hidden text-slate-200"
        style={{
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}
      >
        <input { ...getInputProps() } />
        
        {/* Editor Toolbar (Floating Card) */}
        <div className="flex flex-wrap items-center justify-between gap-2 bg-dark-800/90 border border-white/5 px-4 py-2 rounded-xl shadow-lg backdrop-blur-md">
          <div className="flex flex-wrap items-center gap-1">
            {toolbarButtons.map((btn, index) => (
              <button
                key={index}
                type="button"
                onClick={btn.action}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors duration-200"
                title={btn.label}
              >
                {btn.icon}
              </button>
            ))}
            {cms && (
              <label className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors duration-200 cursor-pointer" title="Upload Media File">
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*,video/*" 
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      onDrop(Array.from(e.target.files));
                    }
                  }}
                />
                {uploading ? <FaSpinner className="animate-spin text-primary-400" /> : <FaImage />}
              </label>
            )}
          </div>

          {/* Action Controls (Toggles + Fullscreen) */}
          <div className="flex items-center gap-3">
            {/* View Toggles */}
            <div className="flex items-center gap-1.5 bg-dark-800 p-0.5 rounded-lg border border-white/5">
              <button
                type="button"
                onClick={() => setIsPreview(false)}
                className={`px-3 py-1 text-xs font-semibold rounded-md flex items-center gap-1 transition-all ${!isPreview ? 'bg-primary-500/20 text-primary-400 border border-primary-500/20' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <FaPen size={10} /> Edit
              </button>
              <button
                type="button"
                onClick={() => setIsPreview(true)}
                className={`px-3 py-1 text-xs font-semibold rounded-md flex items-center gap-1 transition-all ${isPreview ? 'bg-primary-500/20 text-primary-400 border border-primary-500/20' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <FaEye size={10} /> Preview
              </button>
            </div>

            <span className="w-px h-5 bg-white/10 hidden sm:block"></span>

            {/* Maximize Button */}
            <button
              type="button"
              onClick={handleToggleFullscreen}
              className="p-2 rounded-lg border transition-all duration-200 flex items-center justify-center bg-primary-500/20 text-primary-400 border-primary-500/20"
              title="Exit Fullscreen"
            >
              <FaCompress size={12} />
            </button>
          </div>
        </div>

        {/* Editor Split Panels Grid */}
        <div className="grid md:grid-cols-2 gap-3 flex-grow h-[calc(100vh-85px)] overflow-hidden">
          {/* Left Column (Editor Textarea Card) */}
          <div className={`flex flex-col bg-dark-800/90 border border-white/5 rounded-xl overflow-hidden shadow-2xl h-full ${isPreview ? 'hidden md:flex' : 'flex'}`}>
            <div className="flex items-center justify-between px-4 py-2.5 bg-white/5 border-b border-white/5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <FaPen size={8} className="text-primary-400" /> Editor Workspace
              </span>
              <span className="text-[10px] font-mono text-slate-500">{value ? value.length : 0} characters</span>
            </div>
            <div className="p-4 flex-grow h-full overflow-hidden flex flex-col">
              <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onPaste={handlePaste}
                onScroll={handleEditorScroll}
                placeholder="Type your markdown content here... Or copy & paste (Ctrl+V) images directly!"
                className="w-full bg-transparent text-slate-200 font-mono text-sm focus:outline-none resize-none placeholder:text-slate-600 leading-relaxed overflow-y-auto flex-grow h-full"
              />
            </div>
          </div>

          {/* Right Column (Interactive Live Preview Card) */}
          <div className={`flex flex-col bg-dark-800/90 border border-white/5 rounded-xl overflow-hidden shadow-2xl h-full ${!isPreview ? 'hidden md:flex' : 'flex'}`}>
            <div className="flex items-center justify-between px-4 py-2.5 bg-white/5 border-b border-white/5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <FaEye size={8} className="text-secondary-400" /> Interactive Live Preview
              </span>
              <span className="text-[10px] text-primary-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-pulse"></span> Sync Active
              </span>
            </div>
            <div 
              ref={previewRef}
              onScroll={handlePreviewScroll}
              className="p-6 flex-grow overflow-y-auto prose prose-invert prose-slate max-w-none bg-dark-900/10"
            >
              {value ? (
                <ReactMarkdown components={markdownComponents}>{value}</ReactMarkdown>
              ) : (
                <p className="text-slate-600 italic">No content written yet. Preview will show up here.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
    return createPortal(maximizedMarkup, document.body);
  }

  return (
    <div 
      {...getRootProps()} 
      className={`border border-white/10 overflow-hidden transition-all duration-200 relative rounded-xl bg-dark-800 ${isDragActive ? 'border-primary-500 ring-2 ring-primary-500/20' : ''}`}
    >
      <input { ...getInputProps() } />
      
      {isDragActive && (
        <div className="absolute inset-0 bg-primary-500/10 backdrop-blur-sm z-30 flex items-center justify-center border-2 border-dashed border-primary-500">
          <div className="text-center">
            <FaImage className="mx-auto text-primary-400 mb-2 animate-bounce" size={40} />
            <p className="text-white font-heading font-semibold text-lg">Drop your image or video here</p>
            <p className="text-slate-400 text-sm">Automatically uploads to GitHub</p>
          </div>
        </div>
      )}

      {/* Editor Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-dark-900/80 px-4 py-2.5 border-b border-white/5 backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-1">
          {toolbarButtons.map((btn, index) => (
            <button
              key={index}
              type="button"
              onClick={btn.action}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors duration-200"
              title={btn.label}
            >
              {btn.icon}
            </button>
          ))}
          {cms && (
            <label className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors duration-200 cursor-pointer" title="Upload Media File">
              <input 
                type="file" 
                className="hidden" 
                accept="image/*,video/*" 
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    onDrop(Array.from(e.target.files));
                  }
                }}
              />
              {uploading ? <FaSpinner className="animate-spin text-primary-400" /> : <FaImage />}
            </label>
          )}
        </div>

        {/* Action Controls (Toggles + Fullscreen) */}
        <div className="flex items-center gap-3">
          {/* View Toggles */}
          <div className="flex items-center gap-1.5 bg-dark-800 p-0.5 rounded-lg border border-white/5">
            <button
              type="button"
              onClick={() => setIsPreview(false)}
              className={`px-3 py-1 text-xs font-semibold rounded-md flex items-center gap-1 transition-all ${!isPreview ? 'bg-primary-500/20 text-primary-400 border border-primary-500/20' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <FaPen size={10} /> Edit
            </button>
            <button
              type="button"
              onClick={() => setIsPreview(true)}
              className={`px-3 py-1 text-xs font-semibold rounded-md flex items-center gap-1 transition-all ${isPreview ? 'bg-primary-500/20 text-primary-400 border border-primary-500/20' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <FaEye size={10} /> Preview
            </button>
          </div>

          <span className="w-px h-5 bg-white/10 hidden sm:block"></span>

          {/* Maximize Button */}
          <button
            type="button"
            onClick={handleToggleFullscreen}
            className={`p-2 rounded-lg border transition-all duration-200 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 border-white/5`}
            title="Fullscreen Editor"
          >
            <FaExpand size={12} />
          </button>
        </div>
      </div>

      {/* Editor Content Area */}
      <div className="grid md:grid-cols-2 divide-x divide-white/5 h-[500px] overflow-hidden">
        {/* Editor Textarea Pane */}
        <div className={`p-4 h-full flex flex-col ${isPreview ? 'hidden md:flex' : 'flex'}`}>
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onPaste={handlePaste}
            onScroll={handleEditorScroll}
            placeholder="Type your markdown content here... Or copy & paste (Ctrl+V) images directly!"
            className="w-full bg-transparent text-slate-200 font-mono text-sm focus:outline-none resize-none placeholder:text-slate-600 leading-relaxed overflow-y-auto flex-grow h-full"
          />
        </div>

        {/* Live Preview Pane */}
        <div 
          ref={previewRef}
          onScroll={handlePreviewScroll}
          className={`p-6 h-full overflow-y-auto prose prose-invert prose-slate max-w-none bg-dark-900/20 ${!isPreview ? 'hidden md:block' : 'block'}`}
        >
          {value ? (
            <ReactMarkdown components={markdownComponents}>{value}</ReactMarkdown>
          ) : (
            <p className="text-slate-600 italic">No content written yet. Preview will show up here.</p>
          )}
        </div>
      </div>
    </div>
  );
}
