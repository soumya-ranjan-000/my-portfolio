import OutlineNav from './OutlineNav';

export default function ReaderShell({ outlineItems, outlineTitle, header, children, accent }) {
  return (
    <div className="mx-auto grid w-full max-w-[1180px] gap-5 lg:grid-cols-[minmax(0,1fr)_auto]">
      <main className="min-w-0">
        <OutlineNav items={outlineItems} title={outlineTitle} variant="mobile" accent={accent} />
        <article className="mx-auto w-full max-w-4xl rounded-2xl border border-white/10 bg-dark-800/35 shadow-xl backdrop-blur-sm">
          {header}
          <div className="px-4 pb-8 pt-2 md:px-8 lg:px-10">
            {children}
          </div>
        </article>
      </main>
      <OutlineNav items={outlineItems} title={outlineTitle} variant="desktop" accent={accent} />
    </div>
  );
}
