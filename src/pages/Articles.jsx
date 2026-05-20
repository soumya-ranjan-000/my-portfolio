import React, { useState, useEffect } from 'react';
import { useCMS, fetchCMSContent } from '../hooks/useCMS';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { FaCalendarAlt, FaClock, FaArrowLeft, FaSpinner, FaEye, FaTag } from 'react-icons/fa';
import CodeBlock from '../components/CodeBlock';
import NotebookEmbeds from '../components/NotebookEmbeds';

const markdownComponents = {
  h1: ({ node, ...props }) => (
    <h1 className="text-3xl font-bold font-heading mt-8 mb-4 text-orange-500 border-b border-white/5 pb-2" {...props} />
  ),
  h2: ({ node, ...props }) => (
    <h2 className="text-2xl font-semibold font-heading mt-6 mb-3 text-secondary-400" {...props} />
  ),
  h3: ({ node, ...props }) => (
    <h3 className="text-xl font-semibold font-heading mt-5 mb-2 text-slate-300" {...props} />
  ),
  p: ({ node, ...props }) => (
    <p className="mb-4 text-slate-300 leading-relaxed tracking-wide text-sm md:text-base" {...props} />
  ),
  ul: ({ node, ...props }) => (
    <ul className="list-disc list-inside mb-4 pl-2 text-slate-300 marker:text-secondary-500 space-y-1 text-sm md:text-base" {...props} />
  ),
  ol: ({ node, ...props }) => (
    <ol className="list-decimal list-inside mb-4 pl-2 text-slate-300 marker:text-primary-500 space-y-1 text-sm md:text-base" {...props} />
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
    <div className="py-20 w-full px-4 max-w-7xl mx-auto min-h-screen">
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
              <div className="flex flex-col items-center justify-center py-20">
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
            className="max-w-4xl mx-auto glass-card p-6 md:p-12 rounded-2xl border border-white/5 relative shadow-2xl"
          >
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

            {/* Article Content loader/rendered Markdown */}
            {loadingContent ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-secondary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-slate-400">Fetching publication content...</p>
              </div>
            ) : (
              <div className="prose prose-invert prose-lg max-w-none">
                <ReactMarkdown components={markdownComponents}>{articleContent}</ReactMarkdown>
              </div>
            )}
            <NotebookEmbeds item={selectedArticle} accent="secondary" />
          </motion.article>
        )}
      </AnimatePresence>
    </div>
  );
}
