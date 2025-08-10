export const markdownToHtml = (text: string) => {
  let html = text
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^\s*[\*-]\s(.*)/gm, '<ul><li>$1</li></ul>')
    .replace(/<\/ul>\n<ul>/g, '\n')
    .replace(/^\s*\d+\.\s(.*)/gm, '<ol><li>$1</li></ol>')
    .replace(/<\/ol>\n<ol>/g, '\n');

  html = html
    .split('\n\n')
    .map((p) =>
      p.trim().startsWith('<') && p.trim().endsWith('>') ? p : `<p>${p}</p>`
    )
    .join('');

  return html;
};
