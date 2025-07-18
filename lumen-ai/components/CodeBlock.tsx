
import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import coy from 'react-syntax-highlighter/dist/esm/styles/prism/coy';
import { CopyIcon } from './icons/CopyIcon.tsx';
import { CheckIcon } from './icons/CheckIcon.tsx';

interface CodeBlockProps {
  language: string;
  children: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ language, children }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    if (isCopied) return;
    navigator.clipboard.writeText(children).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }).catch(err => {
      console.error('Failed to copy code: ', err);
    });
  };

  return (
    <div className="bg-base-300/50 border-2 border-neutral rounded-[0.625rem] overflow-hidden">
      <div className="flex justify-between items-center px-4 py-2 bg-base-200/50">
        <span className="text-sm font-semibold text-base-content/70">{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-sm font-semibold text-neutral-content hover:text-base-content disabled:cursor-default transition-colors"
          disabled={isCopied}
        >
          {isCopied ? (
            <>
              <CheckIcon className="w-4 h-4 text-primary" />
              Copied!
            </>
          ) : (
            <>
              <CopyIcon className="w-4 h-4" />
              Copy code
            </>
          )}
        </button>
      </div>
      <div className="text-sm">
        <SyntaxHighlighter
          language={language}
          style={coy}
          customStyle={{
            margin: 0,
            padding: '1rem',
            backgroundColor: 'transparent',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
          }}
          codeTagProps={{
            style: {
              fontFamily: 'monospace',
              fontWeight: 500
            }
          }}
        >
          {children}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};