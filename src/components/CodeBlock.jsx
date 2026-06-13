import React, { useState, useEffect, useRef } from 'react';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css'; // Premium tomorrow theme
import { FaRegCopy, FaCheck, FaDownload, FaCode, FaProjectDiagram } from 'react-icons/fa';
import mermaid from 'mermaid';

// Load extra language grammars in Prism
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';

// Initialize mermaid with dark mode options
try {
  mermaid.initialize({
    startOnLoad: false,
    theme: 'dark',
    securityLevel: 'loose',
    fontFamily: 'Outfit, Inter, sans-serif',
    themeVariables: {
      background: '#121214',
      primaryColor: '#1e293b',
      primaryTextColor: '#f8fafc',
      primaryBorderColor: '#334155',
      lineColor: '#64748b',
      secondaryColor: '#0f172a',
      tertiaryColor: '#1e1b4b',
      mainBkg: '#121214',
      nodeBorder: '#334155',
      actorBorder: '#334155',
      signalColor: '#f8fafc',
      labelBoxBorderColor: '#334155',
      labelBoxBkgColor: '#1e293b',
    }
  });
} catch (e) {
  console.error('Failed to initialize mermaid:', e);
}

let idCounter = 0;

// Sub-component for rendering Mermaid diagrams safely
function MermaidRenderer({ chart }) {
  const containerRef = useRef(null);
  const [svg, setSvg] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const elementId = `mermaid-${++idCounter}`;

    const renderChart = async () => {
      try {
        setError(null);
        // Clean up text format slightly
        const cleanChart = chart
          .replace(/&gt;/g, '>')
          .replace(/&lt;/g, '<')
          .replace(/&amp;/g, '&');

        const { svg: renderedSvg } = await mermaid.render(elementId, cleanChart);
        if (isMounted) {
          setSvg(renderedSvg);
        }
      } catch (err) {
        console.error('Mermaid render error:', err);
        if (isMounted) {
          setError(err.message || 'Failed to parse Mermaid diagram syntax.');
        }
        const badElement = document.getElementById(elementId);
        if (badElement) {
          badElement.remove();
        }
      }
    };

    renderChart();

    return () => {
      isMounted = false;
    };
  }, [chart]);

  if (error) {
    return (
      <div className="p-5 bg-red-950/20 border border-red-500/20 rounded-xl text-red-400 font-mono text-xs">
        <p className="font-bold mb-1.5 flex items-center gap-2">⚠️ Diagram Syntax Error:</p>
        <pre className="overflow-x-auto whitespace-pre-wrap leading-relaxed text-[11px] opacity-90">{error}</pre>
      </div>
    );
  }

  if (!svg) {
    return (
      <div className="flex flex-col items-center justify-center py-12 bg-[#121214]/60 border border-white/5 rounded-xl">
        <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-xs text-slate-500 font-medium">Compiling dynamic architecture flowchart...</p>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="mermaid-svg-container p-6 bg-[#121214]/40 border border-white/5 rounded-xl flex justify-center overflow-x-auto backdrop-blur-sm shadow-inner transition-all duration-300"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

// Capitalize language helper
const formatLanguage = (lang) => {
  if (!lang) return 'Code';
  const l = lang.trim().toLowerCase();
  if (l === 'js') return 'JavaScript';
  if (l === 'ts') return 'TypeScript';
  if (l === 'sh' || l === 'bash' || l === 'shell') return 'Bash';
  if (l === 'json') return 'JSON';
  if (l === 'html') return 'HTML';
  if (l === 'css') return 'CSS';
  if (l === 'java') return 'Java';
  if (l === 'mermaid') return 'Mermaid Diagram';
  return lang.charAt(0).toUpperCase() + lang.slice(1);
};

export default function CodeBlock({ className, children, inline, accent }) {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState('diagram'); // For mermaid: 'diagram' or 'code'

  // If it's inline code (e.g. `git clone`), render compact style
  if (inline) {
    const textAccentClass = accent === 'secondary' ? 'text-secondary-400' : 'text-primary-400';
    return (
      <code className={`bg-dark-900/60 border border-white/5 px-1.5 py-0.5 rounded font-mono text-sm font-semibold ${textAccentClass}`}>
        {children}
      </code>
    );
  }

  // Extract language key
  const language = className ? className.replace(/language-/, '') : '';
  const codeString = String(children).replace(/\n$/, '');
  const isMermaid = language.toLowerCase() === 'mermaid';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code: ', err);
    }
  };

  const handleDownload = () => {
    const ext = isMermaid ? 'mmd' : language === 'javascript' ? 'js' : language === 'typescript' ? 'ts' : language === 'bash' ? 'sh' : language || 'txt';
    const blob = new Blob([codeString], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `snippet_${Date.now()}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Perform highlighting using PrismJS
  const getHighlightedHtml = () => {
    const prismLang = Prism.languages[language] || Prism.languages.markup;
    return Prism.highlight(codeString, prismLang, language || 'markup');
  };

  return (
    <div className="my-6 border border-white/5 rounded-xl overflow-hidden bg-dark-950/40 shadow-2xl flex flex-col font-mono text-sm backdrop-blur-sm">
      {/* Code Header Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#1e1e24]/80 border-b border-white/5 select-none">
        
        {/* Left Side Tab / Language Title */}
        {isMermaid ? (
          <div className="flex items-center gap-1.5 p-0.5 bg-dark-900/60 rounded-lg border border-white/5">
            <button
              type="button"
              onClick={() => setViewMode('diagram')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'diagram'
                  ? 'bg-primary-500/20 text-primary-400 border border-primary-500/10'
                  : 'text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              <FaProjectDiagram size={11} /> Diagram
            </button>
            <button
              type="button"
              onClick={() => setViewMode('code')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'code'
                  ? 'bg-secondary-500/20 text-secondary-400 border border-secondary-500/10'
                  : 'text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              <FaCode size={11} /> Raw Code
            </button>
          </div>
        ) : (
          <span className="text-xs font-bold text-slate-400 tracking-wide flex items-center gap-1.5">
            {formatLanguage(language)}
          </span>
        )}

        {/* Right Side Actions */}
        <div className="flex items-center gap-2.5">
          {/* Download button */}
          <button
            type="button"
            onClick={handleDownload}
            title="Download snippet"
            className="text-slate-500 hover:text-slate-300 p-1.5 rounded hover:bg-white/5 transition-all duration-200"
          >
            <FaDownload size={12} />
          </button>
          {/* Copy button */}
          <button
            type="button"
            onClick={handleCopy}
            title="Copy code"
            className="text-slate-500 hover:text-slate-300 p-1.5 rounded hover:bg-white/5 transition-all duration-200 flex items-center justify-center"
          >
            {copied ? (
              <FaCheck size={12} className="text-emerald-400" />
            ) : (
              <FaRegCopy size={12} />
            )}
          </button>
        </div>
      </div>

      {/* Code Body viewport */}
      <div className="w-full">
        {isMermaid && viewMode === 'diagram' ? (
          <div className="p-4 bg-[#0a0a0c]">
            <MermaidRenderer chart={codeString} />
          </div>
        ) : (
          <pre className="p-5 overflow-x-auto m-0 bg-[#121214] text-slate-300 leading-relaxed max-w-full font-mono text-sm select-text">
            <code
              className={`language-${language || 'markup'} bg-transparent p-0 block font-mono`}
              dangerouslySetInnerHTML={{ __html: getHighlightedHtml() }}
            />
          </pre>
        )}
      </div>
    </div>
  );
}
