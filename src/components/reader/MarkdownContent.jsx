import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';

import CodeBlock from '../CodeBlock';
import { renderHeading } from './markdownUtils';

export const createMarkdownComponents = ({
  accent = 'primary',
  imageAlt = 'Content asset',
  onImageClick,
  onVideoLink,
} = {}) => {
  const accentText = accent === 'secondary' ? 'text-secondary-400' : 'text-primary-400';
  const accentHover = accent === 'secondary' ? 'hover:text-secondary-300' : 'hover:text-primary-300';
  const markerText = accent === 'secondary' ? 'marker:text-secondary-500' : 'marker:text-primary-500';
  const quoteBorder = accent === 'secondary' ? 'border-secondary-500 bg-secondary-500/5' : 'border-primary-500 bg-primary-500/5';
  const h2Text = accent === 'secondary' ? 'text-secondary-400' : 'text-primary-400';

  return {
    h1: renderHeading(1, 'scroll-mt-28 mt-9 mb-4 border-b border-white/10 pb-2 font-heading text-3xl font-bold leading-tight text-orange-500 md:text-4xl'),
    h2: renderHeading(2, 'scroll-mt-28 mt-8 mb-3 font-heading text-2xl font-semibold leading-tight md:text-3xl text-primary-400'),
    h3: renderHeading(3, 'scroll-mt-28 mt-7 mb-3 font-heading text-xl font-semibold leading-snug text-secondary-400 md:text-2xl'),
    h4: renderHeading(4, 'scroll-mt-28 mt-6 mb-2 font-heading text-lg font-semibold leading-snug text-slate-300 md:text-xl'),
    h5: renderHeading(5, 'scroll-mt-28 mt-5 mb-2 font-heading text-base font-semibold leading-snug text-slate-300 md:text-lg'),
    h6: renderHeading(6, 'scroll-mt-28 mt-5 mb-2 font-heading text-sm font-semibold uppercase tracking-wide text-slate-400 md:text-base'),
    p: ({ node, ...props }) => (
      <p className="mb-5 font-sans text-base leading-8 text-slate-300 md:text-[17px]" {...props} />
    ),
    ul: ({ node, ...props }) => (
      <ul className={`mb-5 list-disc space-y-2 pl-6 font-sans text-base leading-8 text-slate-300 md:text-[17px] ${markerText}`} {...props} />
    ),
    ol: ({ node, ...props }) => (
      <ol className={`mb-5 list-decimal space-y-2 pl-6 font-sans text-base leading-8 text-slate-300 md:text-[17px] ${markerText}`} {...props} />
    ),
    li: ({ node, ...props }) => (
      <li className="pl-1 text-slate-300 transition-colors hover:text-white" {...props} />
    ),
    strong: ({ node, ...props }) => (
      <strong className="font-bold text-slate-100" {...props} />
    ),
    blockquote: ({ node, ...props }) => (
      <blockquote className={`my-6 rounded-r-xl border-l-4 px-5 py-4 font-sans text-base font-medium italic leading-8 text-slate-300 md:text-[17px] ${quoteBorder}`} {...props} />
    ),
    hr: ({ node, ...props }) => (
      <hr className="my-8 h-px border-0 bg-white/10" {...props} />
    ),
    table: ({ node, ...props }) => (
      <div className="my-6 overflow-x-auto rounded-xl border border-white/10">
        <table className="min-w-full divide-y divide-white/5" {...props} />
      </div>
    ),
    thead: ({ node, ...props }) => <thead className="bg-white/[0.03]" {...props} />,
    tbody: ({ node, ...props }) => <tbody className="divide-y divide-white/5" {...props} />,
    tr: ({ node, ...props }) => <tr className="transition-colors hover:bg-white/[0.02]" {...props} />,
    th: ({ node, ...props }) => <th className="border-b border-white/5 px-4 py-2.5 text-left text-sm font-bold uppercase tracking-wider text-slate-100" {...props} />,
    td: ({ node, ...props }) => <td className="px-4 py-3 text-sm font-medium leading-6 text-slate-300 md:text-base" {...props} />,
    pre: ({ node, children, ...props }) => {
      const codeChild = React.Children.toArray(children)[0];
      if (codeChild && codeChild.props) {
        return (
          <CodeBlock className={codeChild.props.className} inline={false} accent={accent}>
            {codeChild.props.children}
          </CodeBlock>
        );
      }
      return <pre {...props}>{children}</pre>;
    },
    code: ({ node, className, children, ...props }) => (
      <CodeBlock inline className={className} accent={accent} {...props}>
        {children}
      </CodeBlock>
    ),
    img: ({ node, ...props }) => {
      const image = (
        <img
          className="mx-auto max-h-[620px] w-full rounded-lg object-contain"
          {...props}
          alt={props.alt || imageAlt}
        />
      );

      if (!onImageClick) {
        return (
          <div className="my-6 w-full rounded-xl border border-white/10 bg-dark-900/40 p-1 shadow-lg">
            {image}
          </div>
        );
      }

      return (
        <button
          type="button"
          className="my-6 block w-full cursor-zoom-in rounded-xl border border-white/10 bg-dark-900/40 p-1 shadow-lg transition hover:border-white/20"
          onClick={() => onImageClick(props.src)}
        >
          {image}
        </button>
      );
    },
    a: ({ node, ...props }) => {
      const href = props.href || '';
      const children = props.children;
      const ytMatch = href.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);

      if (href.match(/\.(mp4|webm|ogg)(\?.*)?$/i)) {
        return (
          <video controls className="my-6 w-full rounded-xl border border-white/10" src={href}>
            Your browser does not support the video tag.
          </video>
        );
      }

      if (ytMatch) {
        return (
          <div className="my-6 aspect-video overflow-hidden rounded-xl border border-white/10 shadow-lg">
            <iframe src={`https://www.youtube.com/embed/${ytMatch[1]}`} title="YouTube video" allowFullScreen className="h-full w-full" frameBorder="0" />
          </div>
        );
      }

      const text = (Array.isArray(children) ? children.join('') : children) || '';
      const shouldOpenAsVideo = onVideoLink && (/demo|watch|video/i.test(text) || /user-attachments|raw.githubusercontent.com/.test(href));

      const handleClick = (e) => {
        if (shouldOpenAsVideo) {
          e.preventDefault();
          onVideoLink(href);
        }
      };

      return (
        <a
          className={`${accentText} ${accentHover} font-semibold underline underline-offset-4`}
          href={href}
          onClick={handleClick}
          target={shouldOpenAsVideo ? undefined : '_blank'}
          rel={shouldOpenAsVideo ? undefined : 'noopener noreferrer'}
        >
          {children}
        </a>
      );
    },
  };
};

export default function MarkdownContent({ content, components }) {
  return (
    <div className="prose prose-invert max-w-none font-sans text-slate-300 prose-p:text-slate-300 prose-li:text-slate-300 prose-headings:font-heading prose-headings:tracking-normal">
      <ReactMarkdown
        remarkPlugins={[remarkMath, remarkGfm]}
        rehypePlugins={[rehypeKatex]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
