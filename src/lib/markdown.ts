export const markdownToHtml = (text: string) => {
  let html = text;

  // 1. TABLE HANDLING (keep your existing working logic)
  html = html.replace(
    /((?:\|.*\|\r?\n)+)/g,
    (match) => {
      const rows = match.trim().split(/\r?\n/);
      if (rows.length < 2 || !rows[1].includes('---')) return match;

      const headers = rows[0]
        .split('|')
        .filter(cell => cell.trim() !== '')
        .map(cell => `<th>${cell.trim()}</th>`)
        .join('');

      const bodyRows = rows.slice(2).map(row => {
        const cells = row
          .split('|')
          .filter((_, i, arr) => i !== 0 && i !== arr.length - 1)
          .map(cell => `<td>${cell ? cell.trim() : ''}</td>`)
          .join('');
        return `<tr>${cells}</tr>`;
      }).join('');

      return `
        <div class="overflow-x-auto my-4 rounded-lg border">
          <table class="w-full text-sm text-left">
            <thead class="bg-muted/50 uppercase text-xs font-semibold">
              <tr>${headers}</tr>
            </thead>
            <tbody class="divide-y divide-border">
              ${bodyRows}
            </tbody>
          </table>
        </div>
      `;
    }
  );

  // 2. HEADINGS
  html = html
    .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mb-2">$1</h1>')
    .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mb-2 mt-4">$1</h2>')
    .replace(/^### (.*$)/gim, '<h3 class="text-lg font-medium mb-1 mt-3">$1</h3>');

  // 3. BOLD & ITALIC
  html = html
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>');

  // ⛔ 4. REMOVE YOUR OLD LIST LOGIC (ReactMarkdown handles lists perfectly)
  // (We do NOT touch list syntax here.)

  // 5. FIX PARAGRAPH LOGIC — do NOT wrap lists or HTML blocks
  html = html
    .split('\n\n')
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return '';

      // Do NOT wrap bullet lists
      if (
        trimmed.startsWith('* ') ||
        trimmed.startsWith('- ') ||
        trimmed.match(/^\d+\./)
      ) {
        return trimmed;
      }

      // Do NOT wrap generated HTML
      if (trimmed.startsWith('<')) return trimmed;

      return `<p class="mb-2 leading-relaxed">${trimmed}</p>`;
    })
    .join('\n');

  return html;
};
