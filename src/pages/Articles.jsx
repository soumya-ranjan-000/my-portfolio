import React, { useState, useEffect, useMemo } from 'react';
import { useCMS, fetchCMSContent } from '../hooks/useCMS';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { FaCalendarAlt, FaClock, FaArrowLeft, FaSpinner, FaEye, FaTag } from 'react-icons/fa';
import CodeBlock from '../components/CodeBlock';
import NotebookEmbeds from '../components/NotebookEmbeds';

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '');
};

const extractHeadingText = (children) => {
  return React.Children.toArray(children)
    .map((child) => {
      if (typeof child === 'string') return child;
      if (child && child.props && child.props.children) return extractHeadingText(child.props.children);
      return '';
    })
    .join('');
};

const renderHeading = (level, className) => ({ node, children, ...props }) => {
  const id = slugify(extractHeadingText(children));
  return React.createElement(
    `h${level}`,
    { id, className, ...props },
    children
  );
};

const safeCssEscape = (value) => {
  if (typeof CSS !== 'undefined' && CSS.escape) {
    return CSS.escape(value);
  }
  return value.replace(/[^a-zA-Z0-9_-]/g, '-');
};

const extractMarkdownHeadings = (text) => {
  const items = [];
  const seenIds = {};
  const lines = (text || '').split(/\r?\n/);
  let inFencedCode = false;
  let fenceMarker = '';
  let previousLine = '';

  const pushHeading = (level, rawText) => {
    const textValue = rawText.trim();
    if (!textValue) return;
    let id = slugify(textValue.replace(/<[^>]+>/g, ''));
    if (!id) return;
    if (seenIds[id]) {
      seenIds[id] += 1;
      id = `${id}-${seenIds[id]}`;
    } else {
      seenIds[id] = 1;
    }
    items.push({ level, text: textValue, id });
  };

  for (const line of lines) {
    const fencedMatch = line.match(/^([`~]{3,})(.*)$/);
    if (fencedMatch) {
      const markerChar = fencedMatch[1][0];
      if (!inFencedCode) {
        inFencedCode = true;
        fenceMarker = markerChar;
      } else if (markerChar === fenceMarker) {
        inFencedCode = false;
        fenceMarker = '';
      }
      previousLine = '';
      continue;
    }

    if (inFencedCode) {
      continue;
    }

    if (/^[ \t]{4,}/.test(line)) {
      previousLine = '';
      continue;
    }

    const atxMatch = line.match(/^ {0,3}(#{1,6})\s+(.*)$/);
    if (atxMatch) {
      pushHeading(atxMatch[1].length, atxMatch[2]);
      previousLine = '';
      continue;
    }

    const setextMatch = line.match(/^[ \t]*(=+|-+)[ \t]*$/);
    if (setextMatch && previousLine.trim()) {
      pushHeading(setextMatch[1].startsWith('=') ? 1 : 2, previousLine);
      previousLine = '';
      continue;
    }

    previousLine = line;
  }

  return items;
};

const markdownComponents = {
  h1: renderHeading(1, 'text-2xl md:text-3xl font-bold font-heading mt-8 mb-4 text-orange-500 border-b border-white/5 pb-2'),
  h2: renderHeading(2, 'text-xl md:text-2xl font-semibold font-heading mt-6 mb-3 text-secondary-400'),
  h3: renderHeading(3, 'text-lg md:text-xl font-semibold font-heading mt-5 mb-2 text-slate-300'),
  h4: renderHeading(4, 'text-base md:text-lg font-semibold mt-5 mb-2 text-slate-200'),
  h5: renderHeading(5, 'text-sm md:text-base font-semibold mt-4 mb-2 text-slate-200'),
  h6: renderHeading(6, 'text-xs md:text-sm font-semibold mt-4 mb-2 uppercase tracking-wide text-slate-400'),
  p: ({ node, ...props }) => (
    <p className="mb-4 text-slate-300 leading-relaxed tracking-wide text-sm" {...props} />
  ),
  ul: ({ node, ...props }) => (
    <ul className="list-disc list-inside mb-4 pl-2 text-slate-300 marker:text-secondary-500 space-y-1 text-sm" {...props} />
  ),
  ol: ({ node, ...props }) => (
    <ol className="list-decimal list-inside mb-4 pl-2 text-slate-300 marker:text-primary-500 space-y-1 text-sm" {...props} />
  ),
  li: ({ node, ...props }) => (
    <li className="mb-1 hover:text-slate-200 transition-colors" {...props} />
  ),
  strong: ({ node, ...props }) => (
    <strong className="text-white font-bold" {...props} />
  ),
  blockquote: ({ node, ...props }) => (
    <blockquote className="border-l-4 border-secondary-500 bg-secondary-500/5 px-5 py-3 rounded-r-xl my-4 italic text-slate-400 font-medium text-sm md:text-base" {...props} />
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
    <img className="rounded-xl my-6 shadow-lg border border-white/5 max-h-[450px] object-cover" {...props} alt={props.alt || 'Article asset'} />
  ),
  a: ({ node, ...props }) => {
    const href = props.href || '';
    const ytMatch = href.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
    if (href.match(/\.(mp4|webm|ogg)(\?.*)?$/i)) {
      return (
        <video controls className="w-full rounded-xl my-6" src={href}>
          Your browser does not support the video tag.
        </video>
      );
    }
    if (ytMatch) {
      return (
        <div className="aspect-video rounded-xl overflow-hidden my-6 border border-white/10 shadow-lg">
          <iframe src={`https://www.youtube.com/embed/${ytMatch[1]}`} title="YouTube video player" className="w-full h-full" frameBorder="0" allowFullScreen />
        </div>
      );
    }
    return <a className="text-secondary-400 hover:text-secondary-300 underline underline-offset-4 font-semibold" href={href} target="_blank" rel="noopener noreferrer">{props.children}</a>;
  }
};

export default function Articles() {
  const { articles, loadingArticles } = useCMS();
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [articleContent, setArticleContent] = useState('');
  const [loadingContent, setLoadingContent] = useState(false);

  const outlineItems = useMemo(() => {
    const items = [];
    const regex = /^ {0,3}(#{1,6})\s+(.+)$/gm;
    const seenIds = {};
    const textValue = articleContent || '';

    for (const match of textValue.matchAll(regex)) {
      const level = match[1].length;
      const text = match[2].trim();
      if (!text) continue;

      let id = slugify(text);
      if (!id) continue;
      if (seenIds[id]) {
        seenIds[id] += 1;
        id = `${id}-${seenIds[id]}`;
      } else {
        seenIds[id] = 1;
      }

      items.push({ level, text, id });
    }

    return items;
  }, [articleContent]);

  const navigateToHeading = (id) => {
    const target = document.getElementById(safeCssEscape(id));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Fetch article body content when one is selected
  useEffect(() => {
    if (selectedArticle) {
      setLoadingContent(true);
      fetchCMSContent(selectedArticle.slug, 'articles')
        .then(setArticleContent)
        .catch(err => {
          console.error(err);
          setArticleContent('Could not load article body content.');
        })
        .finally(() => setLoadingContent(false));
    } else {
      setArticleContent('');
    }
  }, [selectedArticle]);

  return (
    <div className="pt-20 pb-4 w-full px-2 md:px-3 max-w-full mx-auto min-h-[calc(100vh-5.5rem)]">
      <AnimatePresence mode="wait">
        {!selectedArticle ? (
          /* ================= LIST VIEW ================= */
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
          >
            {/* Header Section */}
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-heading font-bold text-white mb-6">
                Technical <span className="gradient-text">Articles</span>
              </h2>
              <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                Technical guides, test automation strategies, and development tips written by me.
              </p>
            </div>

            {loadingArticles ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-10 h-10 border-4 border-secondary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-slate-400">Loading publications...</p>
              </div>
            ) : articles.length === 0 ? (
              /* No dynamic articles yet state */
              <div className="glass-card p-12 max-w-2xl mx-auto rounded-2xl relative overflow-hidden text-center">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 blur-[80px] rounded-full -mr-20 -mt-20"></div>
                <h3 className="text-2xl font-bold text-white mb-4">Articles Brewing...</h3>
                <p className="text-slate-400 mb-6">
                  I'm currently writing deep dives on automation testing, microservice orchestration, and UI design systems. Check back soon!
                </p>
                <span className="px-4 py-2 bg-secondary-500/10 text-secondary-400 rounded-full text-xs font-semibold border border-secondary-500/15">
                  ✍️ Writing in progress...
                </span>
              </div>
            ) : (
              /* Beautiful Grid List */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {articles.map((art, index) => (
                  <motion.div
                    key={art.slug}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.4 }}
                    onClick={() => setSelectedArticle(art)}
                    className="glass-card group overflow-hidden border border-white/5 hover:border-secondary-500/30 transition-all duration-300 flex flex-col h-full cursor-pointer shadow-lg hover:shadow-secondary-500/5"
                  >
                    {/* Cover image banner */}
                    <div className="aspect-[1.91/1] overflow-hidden relative bg-dark-900 border-b border-white/5">
                      {art.coverImage ? (
                        <img
                          src={art.coverImage}
                          alt={art.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-dark-800 to-dark-700 text-slate-500 text-4xl">
                          📝
                        </div>
                      )}
                      <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
                        {art.tags && art.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="px-2 py-0.5 bg-black/60 backdrop-blur-md text-[10px] text-secondary-300 font-bold rounded border border-white/10 uppercase tracking-wide">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Excerpt Body details */}
                    <div className="p-6 flex-grow flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-4 text-xs text-slate-500 mb-3 font-semibold">
                          <span className="flex items-center gap-1"><FaCalendarAlt /> {new Date(art.publishDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          <span className="flex items-center gap-1"><FaClock /> {art.readTime || '3 min read'}</span>
                        </div>
                        <h3 className="text-xl font-heading font-bold text-white group-hover:text-secondary-400 transition mb-3 line-clamp-2">
                          {art.title}
                        </h3>
                        <p className="text-slate-400 text-sm line-clamp-3 leading-relaxed mb-4">
                          {art.excerpt}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-secondary-400 font-bold group-hover:underline">
                        <span>Read Article</span> <FaEye />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          /* ================= DETAILED ARTICLE READER ================= */
          <motion.article
            key="detail"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className="w-full h-full grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]"
          >
            <aside className="hidden lg:flex flex-col rounded-3xl border border-white/5 bg-dark-900/80 p-4 shadow-xl h-fit sticky top-28 self-start max-h-[calc(100vh-160px)] overflow-y-auto">
              <h3 className="text-[10px] uppercase tracking-[0.3em] text-slate-400 font-semibold mb-3">Article outline</h3>
              {outlineItems.length === 0 ? (
                <p className="text-slate-500 text-[12px]">Add headings to build the outline.</p>
              ) : (
                <div className="space-y-2">
                  {outlineItems.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => navigateToHeading(item.id)}
                      className={`w-full text-left rounded-2xl px-3 py-2 text-sm font-sans transition-colors duration-200 hover:bg-white/5 hover:text-white ${item.level === 1 ? 'text-slate-100 font-semibold' : 'text-slate-300'} ${item.level === 2 ? 'pl-5' : item.level === 3 ? 'pl-8' : 'pl-10'}`}
                    >
                      {item.text}
                    </button>
                  ))}
                </div>
              )}
            </aside>
            <div className="glass-card overflow-hidden rounded-2xl border border-white/5 relative shadow-2xl h-full">
              <div className="h-full overflow-y-auto p-5 md:p-8">
                {/* Back Arrow */}
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="mb-8 p-3 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 transition flex items-center gap-2 text-sm font-semibold"
                >
                  <FaArrowLeft size={12} /> <span>Back to publications</span>
                </button>

                {/* Banner Header Image */}
                {selectedArticle.coverImage && (
                  <div className="w-full aspect-[2/1] rounded-2xl overflow-hidden border border-white/5 shadow-xl mb-8">
                    <img src={selectedArticle.coverImage} alt={selectedArticle.title} className="w-full h-full object-cover" />
                  </div>
                )}

                {/* Headline info */}
                <div className="border-b border-white/10 pb-6 mb-8">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedArticle.tags && selectedArticle.tags.map(tag => (
                      <span key={tag} className="flex items-center gap-1 px-2.5 py-0.5 bg-secondary-500/10 text-secondary-400 text-[10px] font-bold rounded-full border border-secondary-500/15 uppercase tracking-wide">
                        <FaTag size={8} /> {tag}
                      </span>
                    ))}
                  </div>
                  <h1 className="text-3xl md:text-5xl font-heading font-bold text-white mb-4 leading-tight">
                    {selectedArticle.title}
                  </h1>
                  <div className="flex items-center gap-6 text-sm text-slate-500 font-semibold">
                    <span className="flex items-center gap-1.5"><FaCalendarAlt /> {new Date(selectedArticle.publishDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    <span className="flex items-center gap-1.5"><FaClock /> {selectedArticle.readTime}</span>
                  </div>
                </div>

                {/* Article Content */}
                <div className="prose prose-sm prose-invert max-w-none">
                  <ReactMarkdown
                    remarkPlugins={[remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                    components={markdownComponents}
                  >
                    {articleContent}
                  </ReactMarkdown>
                </div>

                <NotebookEmbeds item={selectedArticle} accent="secondary" />
              </div>
            </div>
          </motion.article>
        )}
      </AnimatePresence>
    </div>
  );
}
