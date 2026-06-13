import { useEffect, useMemo, useState } from 'react';
import { FaChevronDown, FaListUl } from 'react-icons/fa';

import { safeCssEscape } from './markdownUtils';

export default function OutlineNav({ items, title = 'On this page', variant = 'desktop', accent }) {
  const [activeId, setActiveId] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);

  // Filter items up to level 3 (H1, H2, H3)
  const visibleItems = useMemo(
    () => items.filter((item) => item.level <= 3),
    [items]
  );

  // Find the minimum heading level to compute relative indentations
  const minLevel = useMemo(() => {
    if (visibleItems.length === 0) return 1;
    return Math.min(...visibleItems.map(item => item.level));
  }, [visibleItems]);

  useEffect(() => {
    if (visibleItems.length === 0) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];

        if (visibleEntry) {
          setActiveId(visibleEntry.target.id);
        }
      },
      {
        rootMargin: '-18% 0px -70% 0px',
        threshold: [0, 1],
      }
    );

    const targets = visibleItems
      .map((item) => document.getElementById(safeCssEscape(item.id)))
      .filter(Boolean);

    targets.forEach((target) => observer.observe(target));

    return () => observer.disconnect();
  }, [visibleItems]);

  const navigateToHeading = (id) => {
    const target = document.getElementById(safeCssEscape(id));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveId(id);
      setMobileOpen(false);
    }
  };

  const activeIndicatorColor = accent === 'secondary' ? 'bg-secondary-500' : 'bg-primary-500';

  const outlineList = (
    <div className="relative border-l border-white/10 space-y-3 py-1 ml-1.5 text-left">
      {visibleItems.length === 0 ? (
        <p className="pl-4 py-2 text-xs text-slate-500">No headings on this page.</p>
      ) : (
        visibleItems.map((item) => {
          const isActive = activeId === item.id;
          const relativeLevel = item.level - minLevel;
          
          let indentClass = 'pl-4';
          if (relativeLevel === 1) indentClass = 'pl-8';
          if (relativeLevel >= 2) indentClass = 'pl-12';

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => navigateToHeading(item.id)}
              className={`group relative block w-full text-left font-sans text-xs transition-colors duration-200 ${indentClass} ${
                isActive
                  ? 'text-slate-100 font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title={item.text}
            >
              {isActive && (
                <span className={`absolute left-[-1.5px] top-0 bottom-0 w-[3px] rounded-full ${activeIndicatorColor}`} />
              )}
              <span className="line-clamp-2 leading-relaxed">
                {item.text}
              </span>
            </button>
          );
        })
      )}
    </div>
  );

  return (
    <>
      {variant === 'mobile' && (
        <div className="mb-4 h-12 lg:hidden">
          <div className="fixed left-3 right-3 top-20 z-30">
            <button
              type="button"
              onClick={() => setMobileOpen((open) => !open)}
              className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-dark-800/95 px-4 py-3 text-sm font-semibold text-slate-200 shadow-lg backdrop-blur"
            >
              <span className="flex items-center gap-2">
                <FaListUl size={13} /> {title}
              </span>
              <FaChevronDown
                size={12}
                className={`transition-transform ${mobileOpen ? 'rotate-180' : ''}`}
              />
            </button>
            {mobileOpen && (
              <div className="mt-2 max-h-[45vh] overflow-y-auto rounded-xl border border-white/10 bg-dark-900/95 p-4 shadow-2xl backdrop-blur">
                {outlineList}
              </div>
            )}
          </div>
        </div>
      )}

      {variant === 'desktop' && (
        <aside className="hidden lg:block w-56 xl:w-64 self-start">
          <div className="fixed top-24 max-h-[calc(100vh-8rem)] w-56 xl:w-64 overflow-y-auto pr-4 select-none">
            <div className="flex flex-col">
              <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500 mb-3 pl-1.5">
                {title}
              </h3>
              {outlineList}
            </div>
          </div>
        </aside>
      )}
    </>
  );
}
