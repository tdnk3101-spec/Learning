'use client';

import React from 'react';

interface MarkdownContentProps {
  content: string;
  className?: string;
}

export default function MarkdownContent({ content, className = '' }: MarkdownContentProps) {
  // Parse markdown blocks
  const lines = content.split('\n');
  const blocks: React.ReactNode[] = [];

  let inTable = false;
  let tableRows: string[][] = [];
  let tableHeaders: string[] = [];

  const flushTable = (key: number) => {
    if (tableHeaders.length > 0 || tableRows.length > 0) {
      blocks.push(
        <div key={`table-${key}`} className="my-3 overflow-x-auto rounded-xl border border-slate-200 shadow-2xs">
          <table className="w-full text-left text-xs border-collapse">
            {tableHeaders.length > 0 && (
              <thead>
                <tr className="bg-slate-100/90 border-b border-slate-200">
                  {tableHeaders.map((th, idx) => (
                    <th key={idx} className="p-2.5 font-bold text-slate-800 text-[11px]">
                      {renderFormattedText(th.trim())}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {tableRows.map((row, rowIdx) => (
                <tr
                  key={rowIdx}
                  className={`border-b border-slate-100 last:border-0 ${
                    rowIdx % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'
                  }`}
                >
                  {row.map((cell, cellIdx) => (
                    <td key={cellIdx} className="p-2.5 text-slate-700 text-[11px] align-top">
                      {renderFormattedText(cell.trim())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableHeaders = [];
      tableRows = [];
      inTable = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check if line is a table line
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      const cells = line
        .trim()
        .slice(1, -1)
        .split('|');

      // Check if it's separator line |---|---|
      const isSeparator = cells.every((c) => /^[\s-:]+$/.test(c));

      if (isSeparator) {
        continue;
      }

      if (!inTable) {
        inTable = true;
        tableHeaders = cells;
      } else {
        tableRows.push(cells);
      }
      continue;
    } else if (inTable) {
      flushTable(i);
    }

    // Empty lines
    if (!line.trim()) {
      blocks.push(<div key={`empty-${i}`} className="h-2" />);
      continue;
    }

    // Headers
    if (line.startsWith('### ')) {
      blocks.push(
        <h3 key={`h3-${i}`} className="text-xs font-extrabold text-slate-900 mt-3 mb-1.5 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
          <span>{renderFormattedText(line.replace('### ', ''))}</span>
        </h3>
      );
      continue;
    }

    if (line.startsWith('## ')) {
      blocks.push(
        <h2 key={`h2-${i}`} className="text-sm font-black text-slate-900 mt-4 mb-2 pb-1 border-b border-slate-200">
          {renderFormattedText(line.replace('## ', ''))}
        </h2>
      );
      continue;
    }

    if (line.startsWith('# ')) {
      blocks.push(
        <h1 key={`h1-${i}`} className="text-base font-black text-slate-900 mt-4 mb-2">
          {renderFormattedText(line.replace('# ', ''))}
        </h1>
      );
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      const quoteText = line.replace('> ', '');
      blocks.push(
        <div
          key={`quote-${i}`}
          className="my-2.5 p-3 rounded-xl bg-amber-50/90 border-l-4 border-amber-500 text-amber-950 text-[11px] leading-relaxed"
        >
          {renderFormattedText(quoteText)}
        </div>
      );
      continue;
    }

    // Bullet List (- or *)
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      const bulletText = line.trim().replace(/^[-*]\s+/, '');
      blocks.push(
        <div key={`bullet-${i}`} className="flex items-start gap-2 ml-1 my-1 text-slate-700">
          <span className="text-emerald-600 font-bold mt-0.5">•</span>
          <span className="flex-1 leading-relaxed text-xs">{renderFormattedText(bulletText)}</span>
        </div>
      );
      continue;
    }

    // Numbered List (1., 2.)
    if (/^\d+\.\s/.test(line.trim())) {
      const numMatch = line.trim().match(/^(\d+)\.\s+(.*)/);
      if (numMatch) {
        blocks.push(
          <div key={`num-${i}`} className="flex items-start gap-2 ml-1 my-1 text-slate-700">
            <span className="font-mono text-[11px] font-bold text-emerald-700 bg-emerald-50 px-1 rounded">
              {numMatch[1]}
            </span>
            <span className="flex-1 leading-relaxed text-xs">{renderFormattedText(numMatch[2])}</span>
          </div>
        );
        continue;
      }
    }

    // Standard paragraph
    blocks.push(
      <p key={`p-${i}`} className="leading-relaxed text-xs text-slate-800 my-1">
        {renderFormattedText(line)}
      </p>
    );
  }

  if (inTable) {
    flushTable(lines.length);
  }

  return <div className={`space-y-0.5 ${className}`}>{blocks}</div>;
}

// Helper to format bold, code, and links within text
function renderFormattedText(text: string): React.ReactNode {
  if (!text) return null;

  // Split by bold (**text**) and code (`code`)
  const parts = text.split(/(\*\*.*?\*\*|`.*?`|\[.*?\]\(.*?\))/g);

  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={idx} className="font-bold text-slate-950">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={idx} className="font-mono text-[10px] bg-slate-200/70 text-slate-800 px-1 py-0.5 rounded">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}
