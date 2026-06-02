import React from 'react';

export const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
};

export const extractHeadingText = (children) => {
  return React.Children.toArray(children)
    .map((child) => {
      if (typeof child === 'string') return child;
      if (child && child.props && child.props.children) {
        return extractHeadingText(child.props.children);
      }
      return '';
    })
    .join('');
};

export const renderHeading = (level, className) => ({ node, children, ...props }) => {
  const id = slugify(extractHeadingText(children));
  return React.createElement(`h${level}`, { id, className, ...props }, children);
};

export const safeCssEscape = (value) => {
  if (typeof CSS !== 'undefined' && CSS.escape) {
    return CSS.escape(value);
  }
  return value.replace(/[^a-zA-Z0-9_-]/g, '-');
};

export const extractMarkdownHeadings = (text) => {
  const items = [];
  const seenIds = {};
  const lines = (text || '').split(/\r?\n/);
  let inFencedCode = false;
  let fenceMarker = '';
  let previousLine = '';

  const pushHeading = (level, rawText) => {
    const textValue = rawText.replace(/#+\s*$/, '').trim();
    if (!textValue) return;

    let id = slugify(textValue.replace(/<[^>]+>/g, ''));
    if (!id) return;

    if (seenIds[id]) {
      seenIds[id] += 1;
      id = `${id}-${seenIds[id]}`;
    } else {
      seenIds[id] = 1;
    }

    items.push({ level, text: textValue, id });
  };

  for (const line of lines) {
    const fencedMatch = line.match(/^([`~]{3,})(.*)$/);
    if (fencedMatch) {
      const markerChar = fencedMatch[1][0];
      if (!inFencedCode) {
        inFencedCode = true;
        fenceMarker = markerChar;
      } else if (markerChar === fenceMarker) {
        inFencedCode = false;
        fenceMarker = '';
      }
      previousLine = '';
      continue;
    }

    if (inFencedCode || /^[ \t]{4,}/.test(line)) {
      previousLine = '';
      continue;
    }

    const atxMatch = line.match(/^ {0,3}(#{1,6})\s+(.*)$/);
    if (atxMatch) {
      pushHeading(atxMatch[1].length, atxMatch[2]);
      previousLine = '';
      continue;
    }

    const setextMatch = line.match(/^[ \t]*(=+|-+)[ \t]*$/);
    if (setextMatch && previousLine.trim()) {
      pushHeading(setextMatch[1].startsWith('=') ? 1 : 2, previousLine);
      previousLine = '';
      continue;
    }

    previousLine = line;
  }

  return items;
};
