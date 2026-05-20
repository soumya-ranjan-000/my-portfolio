import React from 'react';
import { FaExternalLinkAlt, FaPlus, FaPython, FaTrash } from 'react-icons/fa';

const emptyNotebook = {
  title: '',
  type: 'marimo',
  mode: 'iframe',
  embedUrl: '',
  sourceUrl: '',
  description: '',
  height: 620
};

const normalizeNotebook = (notebook = {}) => ({
  ...emptyNotebook,
  ...notebook,
  type: notebook.type || 'marimo',
  mode: notebook.mode || 'iframe',
  height: notebook.height || 620
});

export default function NotebookFields({ notebooks = [], onChange, accent = 'primary' }) {
  const items = notebooks.map(normalizeNotebook);
  const focusClass = accent === 'secondary' ? 'focus:border-secondary-500' : 'focus:border-primary-500';
  const activeClass = accent === 'secondary' ? 'text-secondary-400 bg-secondary-500/10 border-secondary-500/20' : 'text-primary-400 bg-primary-500/10 border-primary-500/20';

  const updateNotebook = (index, key, value) => {
    const next = items.map((item, itemIndex) => (
      itemIndex === index ? { ...item, [key]: value } : item
    ));
    onChange(next);
  };

  const addNotebook = () => {
    onChange([...items, { ...emptyNotebook }]);
  };

  const removeNotebook = (index) => {
    onChange(items.filter((_, itemIndex) => itemIndex !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <label className="block text-sm font-semibold text-slate-300">Python / marimo Notebooks</label>
          <p className="mt-1 text-xs text-slate-500">Attach hosted marimo apps, WASM exports, static notebook HTML, or source links.</p>
        </div>
        <button
          type="button"
          onClick={addNotebook}
          className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2 text-xs font-bold transition hover:bg-white/10 ${activeClass}`}
        >
          <FaPlus size={11} /> Add Notebook
        </button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-dark-900/50 px-5 py-6 text-sm text-slate-500">
          No notebook attached yet. Add a marimo app URL, exported HTML/WASM URL, or source notebook link when this entry has runnable analysis.
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((notebook, index) => (
            <div key={index} className="rounded-2xl border border-white/10 bg-dark-900/50 p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <FaPython className={accent === 'secondary' ? 'text-secondary-400' : 'text-primary-400'} />
                  Notebook {index + 1}
                </div>
                <button
                  type="button"
                  onClick={() => removeNotebook(index)}
                  className="rounded-lg bg-red-500/10 p-2 text-red-400 transition hover:bg-red-500/20 hover:text-red-300"
                  title="Remove notebook"
                >
                  <FaTrash size={12} />
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Title</label>
                  <input
                    type="text"
                    value={notebook.title}
                    onChange={(e) => updateNotebook(index, 'title', e.target.value)}
                    placeholder="Interactive data exploration"
                    className={`w-full rounded-xl border border-white/10 bg-dark-950 px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none ${focusClass}`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Type</label>
                    <select
                      value={notebook.type}
                      onChange={(e) => updateNotebook(index, 'type', e.target.value)}
                      className={`w-full rounded-xl border border-white/10 bg-dark-950 px-4 py-3 text-white focus:outline-none ${focusClass}`}
                    >
                      <option value="marimo">marimo</option>
                      <option value="jupyter">Jupyter</option>
                      <option value="html">Static HTML</option>
                      <option value="python">Python</option>
                      <option value="external">External</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Height</label>
                    <input
                      type="number"
                      min="360"
                      max="1200"
                      step="20"
                      value={notebook.height}
                      onChange={(e) => updateNotebook(index, 'height', Number(e.target.value))}
                      className={`w-full rounded-xl border border-white/10 bg-dark-950 px-4 py-3 text-white focus:outline-none ${focusClass}`}
                    />
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Embed URL</label>
                  <input
                    type="url"
                    value={notebook.embedUrl}
                    onChange={(e) => updateNotebook(index, 'embedUrl', e.target.value)}
                    placeholder="https://.../notebook.html or hosted marimo app URL"
                    className={`w-full rounded-xl border border-white/10 bg-dark-950 px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none ${focusClass}`}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Source URL</label>
                  <div className="flex gap-3">
                    <input
                      type="url"
                      value={notebook.sourceUrl}
                      onChange={(e) => updateNotebook(index, 'sourceUrl', e.target.value)}
                      placeholder="https://github.com/.../notebook.py"
                      className={`min-w-0 flex-1 rounded-xl border border-white/10 bg-dark-950 px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none ${focusClass}`}
                    />
                    {notebook.sourceUrl && (
                      <a
                        href={notebook.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 text-slate-300 transition hover:bg-white/10 hover:text-white"
                        title="Open source URL"
                      >
                        <FaExternalLinkAlt size={12} />
                      </a>
                    )}
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Description</label>
                  <textarea
                    value={notebook.description}
                    onChange={(e) => updateNotebook(index, 'description', e.target.value)}
                    placeholder="Optional context for what this notebook demonstrates..."
                    className={`h-20 w-full resize-none rounded-xl border border-white/10 bg-dark-950 px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none ${focusClass}`}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
