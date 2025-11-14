
import { marked } from 'marked';
import DOMPurify from 'dompurify';

// Configure marked to use highlight.js
marked.setOptions({
  highlight: function(code, lang) {
    if (typeof (window as any).hljs !== 'undefined') {
      const language = (window as any).hljs.getLanguage(lang) ? lang : 'plaintext';
      return (window as any).hljs.highlight(code, { language }).value;
    }
    return code;
  },
  langPrefix: 'hljs language-',
  breaks: true, // Convert GFM breaks into <br>
  gfm: true, // Enable GFM tables
});

export const parseAndSanitizeMarkdown = (markdown: string): string => {
  const rawHtml = marked.parse(markdown);
  return DOMPurify.sanitize(rawHtml as string);
};
