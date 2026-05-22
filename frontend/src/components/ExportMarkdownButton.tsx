import { useState } from 'react';
import { backlogToMarkdown } from '../utils/markdown';
import type { BacklogResult } from '../domain/types';

function download(filename: string, text: string) {
  const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

type CopyState = 'idle' | 'success' | 'error';

export function ExportMarkdownButton(props: { result: BacklogResult }) {
  const [copyState, setCopyState] = useState<CopyState>('idle');

  async function handleCopy() {
    const md = backlogToMarkdown(props.result);
    try {
      await navigator.clipboard.writeText(md);
      setCopyState('success');
    } catch {
      // Fallback para contextos sem permissão de clipboard (HTTP, iframes, etc.)
      try {
        const ta = document.createElement('textarea');
        ta.value = md;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        setCopyState('success');
      } catch {
        setCopyState('error');
      }
    } finally {
      setTimeout(() => setCopyState('idle'), 2500);
    }
  }

  function handleDownload() {
    const md = backlogToMarkdown(props.result);
    const date = new Date().toISOString().slice(0, 10);
    download(`mvp-estimator-${date}.md`, md);
  }

  return (
    <div className="row">
      <button
        className={`btn ${copyState === 'success' ? 'success' : copyState === 'error' ? 'danger-btn' : ''}`}
        onClick={handleCopy}
        type="button"
        aria-label="Copiar backlog em Markdown"
      >
        {copyState === 'success' ? '✓ Copiado!' : copyState === 'error' ? '✗ Falha ao copiar' : '📋 Copiar Markdown'}
      </button>
      <button
        className="btn"
        onClick={handleDownload}
        type="button"
        aria-label="Baixar backlog como arquivo .md"
      >
        ⬇ Baixar .md
      </button>
    </div>
  );
}
