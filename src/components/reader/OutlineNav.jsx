import { useEffect, useMemo, useState } from 'react';
import { FaBars, FaChevronDown, FaChevronLeft, FaListUl } from 'react-icons/fa';

import { safeCssEscape } from './markdownUtils';

export default function OutlineNav({ items, title = 'On this page', variant = 'desktop' }) {
  const [activeId, setActiveId] = useState('');
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const visibleItems = useMemo(
    () => items.filter((item) => item.level <= 3),
    [items]
  );

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

  const itemClass = (item) => {
    const isActive = activeId === item.id;
    const indent = item.level === 1 ? 'pl-3' : item.level === 2 ? 'pl-5' : 'pl-7';

    return [
      'w-full rounded-lg border-l-2 py-1.5 pr-2 text-left text-xs leading-snug transition-colors',
      indent,
      isActive
        ? 'border-primary-400 bg-primary-400/10 text-white'
        : 'border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-200',
    ].join(' ');
  };

  const outlineList = (
    <div className="space-y-1">
      {visibleItems.length === 0 ? (
        <p className="px-3 py-2 text-xs text-slate-500">Headings will appear here.</p>
      ) : (
        visibleItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => navigateToHeading(item.id)}
            className={itemClass(item)}
            title={item.text}
          >
            <span className="line-clamp-2">{item.text}</span>
          </button>
        ))
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
              <div className="mt-2 max-h-[45vh] overflow-y-auto rounded-xl border border-white/10 bg-dark-900/95 p-2 shadow-2xl backdrop-blur">
                {outlineList}
              </div>
            )}
          </div>
        </div>
      )}

      {variant === 'desktop' && (
      <aside
        className={`hidden lg:block self-start transition-all duration-300 ${
          collapsed ? 'w-12' : 'w-56 xl:w-64'
        }`}
      >
        <div className={`fixed top-24 max-h-[calc(100vh-8rem)] overflow-hidden rounded-xl border border-white/10 bg-dark-900/70 shadow-xl backdrop-blur transition-all duration-300 ${
          collapsed ? 'w-12' : 'w-56 xl:w-64'
        }`}>
          <div className="flex items-center justify-between border-b border-white/5 px-3 py-2.5">
            {!collapsed && (
              <h3 className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                {title}
              </h3>
            )}
            <button
              type="button"
              onClick={() => setCollapsed((value) => !value)}
              className="ml-auto rounded-md p-2 text-slate-500 transition hover:bg-white/5 hover:text-slate-200"
              title={collapsed ? 'Expand outline' : 'Collapse outline'}
            >
              {collapsed ? <FaBars size={13} /> : <FaChevronLeft size={12} />}
            </button>
          </div>

          {!collapsed && (
            <div className="max-h-[calc(100vh-11.5rem)] overflow-y-auto p-2">
              {outlineList}
            </div>
          )}
        </div>
      </aside>
      )}
    </>
  );
}
