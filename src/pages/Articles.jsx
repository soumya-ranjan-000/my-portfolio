import React, { useState, useEffect, useMemo } from 'react';
import { useCMS, fetchCMSContent } from '../hooks/useCMS';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCalendarAlt, FaClock, FaArrowLeft, FaSpinner, FaEye, FaTag } from 'react-icons/fa';
import NotebookEmbeds from '../components/NotebookEmbeds';
import MarkdownContent, { createMarkdownComponents } from '../components/reader/MarkdownContent';
import ReaderShell from '../components/reader/ReaderShell';
import { extractMarkdownHeadings as parseMarkdownHeadings } from '../components/reader/markdownUtils';

export default function Articles() {
  const { articles, loadingArticles } = useCMS();
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [articleContent, setArticleContent] = useState('');
  const [loadingContent, setLoadingContent] = useState(false);

  const outlineItems = useMemo(() => {
    return parseMarkdownHeadings(articleContent);
  }, [articleContent]);

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

  const readerMarkdownComponents = createMarkdownComponents({
    accent: 'secondary',
    imageAlt: 'Article asset',
  });

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
            className="w-full"
          >
            <ReaderShell
              outlineItems={outlineItems}
              outlineTitle="Article outline"
              header={
                <header className="border-b border-white/10 px-4 py-5 md:px-8 lg:px-10">
                  <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={() => setSelectedArticle(null)}
                      className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-slate-400 transition hover:bg-white/10 hover:text-white"
                >
                  <FaArrowLeft size={12} /> <span>Back to publications</span>
                </button>
                    <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <FaCalendarAlt /> {new Date(selectedArticle.publishDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <FaClock /> {selectedArticle.readTime}
                      </span>
                    </div>
                  </div>

                {/* Banner Header Image */}
                {selectedArticle.coverImage && (
                    <div className="mb-5 max-h-[280px] w-full overflow-hidden rounded-xl border border-white/10 shadow-xl">
                    <img src={selectedArticle.coverImage} alt={selectedArticle.title} className="w-full h-full object-cover" />
                  </div>
                )}

                {/* Headline info */}
                  <div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedArticle.tags && selectedArticle.tags.map(tag => (
                      <span key={tag} className="flex items-center gap-1 px-2.5 py-0.5 bg-secondary-500/10 text-secondary-400 text-[10px] font-bold rounded-full border border-secondary-500/15 uppercase tracking-wide">
                        <FaTag size={8} /> {tag}
                      </span>
                    ))}
                  </div>
                    <h1 className="text-3xl font-heading font-bold leading-tight text-white md:text-4xl">
                    {selectedArticle.title}
                  </h1>
                  </div>
                </header>
              }
            >
              {loadingContent ? (
                <div className="flex items-center justify-center py-16 text-slate-400">
                  <FaSpinner className="mr-3 animate-spin" /> Loading article...
                </div>
              ) : (
                <>

                {/* Article Content */}
                  <MarkdownContent content={articleContent} components={readerMarkdownComponents} />

                <NotebookEmbeds item={selectedArticle} accent="secondary" />
                </>
              )}
            </ReaderShell>
          </motion.article>
        )}
      </AnimatePresence>
    </div>
  );
}
