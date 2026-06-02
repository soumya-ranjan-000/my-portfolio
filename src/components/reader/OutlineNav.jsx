import { useEffect, useMemo, useState } from 'react';
import { FaBars, FaChevronDown, FaChevronLeft, FaListUl } from 'react-icons/fa';

import { safeCssEscape } from './markdownUtils';

export default function OutlineNav({ items, title = 'On this page', variant = 'desktop' }) {
  const [activeId, setActiveId] = useState('');
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const visibleItems = useMemo(
    () => items.filter((item) => item.level <= 2),
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

  const getOutlineStyle = (level, isActive) => {
    if (level === 1) {
      return {
        label: 'H1',
        button: isActive
          ? 'border-primary-400 bg-primary-500/20 text-slate-50 ring-2 ring-primary-500/15'
          : 'border-primary-400/40 bg-primary-500/10 text-slate-300 hover:border-primary-400/70 hover:bg-primary-500/15',
        badge: 'bg-primary-500/20 text-primary-300 border-primary-500/30',
        indent: '',
      };
    }

    if (level === 2) {
      return {
        label: 'H2',
        button: isActive
          ? 'border-secondary-400 bg-secondary-500/20 text-slate-50 ring-2 ring-secondary-500/15'
          : 'border-secondary-400/30 bg-secondary-500/10 text-slate-300 hover:border-secondary-400/60 hover:bg-secondary-500/15',
        badge: 'bg-secondary-500/20 text-secondary-300 border-secondary-500/30',
        indent: 'ml-3',
      };
    }

    return {
      label: `H${level}`,
      button: isActive
        ? 'border-primary-400 bg-white/[0.08] text-slate-50 ring-2 ring-primary-500/10'
        : 'border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/20 hover:bg-white/[0.06] hover:text-slate-200',
      badge: 'bg-white/5 text-slate-400 border-white/10',
      indent: level === 3 ? 'ml-6' : 'ml-8',
    };
  };

  const outlineList = (
    <div className="space-y-2">
      {visibleItems.length === 0 ? (
        <p className="px-3 py-2 text-xs text-slate-500">Headings will appear here.</p>
      ) : (
        visibleItems.map((item) => {
          const isActive = activeId === item.id;
          const style = getOutlineStyle(item.level, isActive);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => navigateToHeading(item.id)}
              className={`group w-full rounded-xl border px-3 py-2 text-left font-sans shadow-sm transition-all duration-200 ${style.indent} ${style.button}`}
              title={item.text}
            >
              <span className="flex items-start gap-2">
                <span className={`mt-0.5 shrink-0 rounded-md border px-1.5 py-0.5 text-[10px] font-bold leading-none ${style.badge}`}>
                  {style.label}
                </span>
                <span className="line-clamp-2 text-xs font-semibold leading-snug">
                  {item.text}
                </span>
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
