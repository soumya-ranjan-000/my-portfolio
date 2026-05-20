import React from 'react';
import { FaBookOpen, FaCode, FaExternalLinkAlt, FaPython } from 'react-icons/fa';

const normalizeNotebooks = (item = {}) => {
  const notebooks = Array.isArray(item.notebooks) ? item.notebooks : [];

  if (notebooks.length > 0) {
    return notebooks.filter(notebook => notebook && (notebook.embedUrl || notebook.sourceUrl));
  }

  if (item.notebookUrl || item.notebookEmbedUrl || item.notebookSourceUrl) {
    return [
      {
        title: item.notebookTitle || 'Interactive Notebook',
        type: item.notebookType || 'marimo',
        embedUrl: item.notebookEmbedUrl || item.notebookUrl,
        sourceUrl: item.notebookSourceUrl,
        description: item.notebookDescription || '',
        height: item.notebookHeight
      }
    ];
  }

  return [];
};

const typeLabels = {
  marimo: 'marimo',
  jupyter: 'Jupyter',
  html: 'HTML',
  python: 'Python',
  external: 'Notebook'
};

function NotebookEmbeds({ item, notebooks: notebookList, accent = 'primary' }) {
  const notebooks = notebookList
    ? normalizeNotebooks({ notebooks: notebookList })
    : normalizeNotebooks(item);

  if (notebooks.length === 0) return null;

  const accentClass = accent === 'secondary' ? 'text-secondary-400' : 'text-primary-400';
  const borderClass = accent === 'secondary' ? 'border-secondary-500/20' : 'border-primary-500/20';
  const bgClass = accent === 'secondary' ? 'bg-secondary-500/10' : 'bg-primary-500/10';

  return (
    <section className="mt-10 border-t border-white/10 pt-8">
      <div className="mb-5 flex items-center gap-3">
        <div className={`rounded-xl border ${borderClass} ${bgClass} p-3 ${accentClass}`}>
          <FaPython size={18} />
        </div>
        <div>
          <h2 className="text-2xl font-heading font-bold text-white">Notebook</h2>
          <p className="text-sm text-slate-500">Interactive Python work attached to this entry.</p>
        </div>
      </div>

      <div className="space-y-6">
        {notebooks.map((notebook, index) => {
          const title = notebook.title || `Notebook ${index + 1}`;
          const type = (notebook.type || 'external').toLowerCase();
          const typeLabel = typeLabels[type] || notebook.type || 'Notebook';
          const height = Number(notebook.height) || 620;

          return (
            <article key={`${title}-${index}`} className="overflow-hidden rounded-2xl border border-white/10 bg-dark-900/60 shadow-xl">
              <div className="flex flex-col gap-4 border-b border-white/10 bg-white/[0.03] px-5 py-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 rounded-full border ${borderClass} ${bgClass} px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${accentClass}`}>
                      <FaBookOpen size={10} /> {typeLabel}
                    </span>
                    {notebook.mode && (
                      <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {notebook.mode}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-heading font-bold text-white">{title}</h3>
                  {notebook.description && (
                    <p className="mt-1 text-sm leading-relaxed text-slate-400">{notebook.description}</p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {notebook.sourceUrl && (
                    <a
                      href={notebook.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
                    >
                      <FaCode size={12} /> Source
                    </a>
                  )}
                  {notebook.embedUrl && (
                    <a
                      href={notebook.embedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-2 rounded-xl border ${borderClass} ${bgClass} px-3 py-2 text-xs font-semibold ${accentClass} transition hover:bg-white/10`}
                    >
                      <FaExternalLinkAlt size={11} /> Open
                    </a>
                  )}
                </div>
              </div>

              {notebook.embedUrl ? (
                <div className="bg-dark-950">
                  <iframe
                    title={title}
                    src={notebook.embedUrl}
                    className="block w-full border-0"
                    style={{ height: `${height}px` }}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    sandbox="allow-downloads allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
                  />
                </div>
              ) : (
                <div className="px-5 py-6 text-sm text-slate-400">
                  This notebook is linked as source only. Open it from the controls above.
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default NotebookEmbeds;
