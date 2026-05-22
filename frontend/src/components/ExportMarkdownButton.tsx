import { backlogToMarkdown } from '../utils/markdown';
import type { BacklogResult } from '../domain/types';

async function copyToClipboard(text: string) {
  await navigator.clipboard.writeText(text);
}

function download(filename: string, text: string) {
  const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function ExportMarkdownButton(props: { result: BacklogResult }) {
  return (
    <div className="row">
      <button
        className="btn"
        onClick={async () => {
          const md = backlogToMarkdown(props.result);
          await copyToClipboard(md);
        }}
        type="button"
      >
        Copiar Markdown
      </button>
      <button
        className="btn"
        onClick={() => {
          const md = backlogToMarkdown(props.result);
          const date = new Date().toISOString().slice(0, 10);
          download(`mvp-estimator-${date}.md`, md);
        }}
        type="button"
      >
        Baixar .md
      </button>
    </div>
  );
}

