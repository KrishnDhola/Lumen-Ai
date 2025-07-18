import React, { useState } from 'react';
import { CopyIcon } from './icons/CopyIcon.tsx';
import { CheckIcon } from './icons/CheckIcon.tsx';

// A reusable copy button component
const CopyButton: React.FC<{ textToCopy: string }> = ({ textToCopy }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    if (isCopied) return;
    navigator.clipboard.writeText(textToCopy).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  };

  return (
    <button
      onClick={handleCopy}
      disabled={isCopied}
      className="btn btn-sm bg-base-200 border-2 border-neutral h-auto min-h-0 py-1 px-2.5 text-xs"
    >
      {isCopied ? (
        <>
          <CheckIcon className="w-4 h-4 text-primary" />
          Copied
        </>
      ) : (
        <>
          <CopyIcon className="w-4 h-4" />
          Copy
        </>
      )}
    </button>
  );
};

interface SeoPackProps {
  content: string;
}

const parseSeoContent = (content: string) => {
    const sections: Record<string, string> = {};
    
    // Use regex to capture content between known headers
    const titleMatch = content.match(/^Title:([\s\S]*?)\nDescription:/);
    const descriptionMatch = content.match(/\nDescription:([\s\S]*?)\nTags \(Keywords\):/);
    const tagsMatch = content.match(/\nTags \(Keywords\):([\s\S]*?)\nVideo Category:/);
    const categoryMatch = content.match(/\nVideo Category:([\s\S]*?)\nThumbnail Prompt \(for AI\):/);
    const thumbnailPromptMatch = content.match(/\nThumbnail Prompt \(for AI\):([\s\S]*)$/);

    if (titleMatch) sections['Title'] = titleMatch[1].trim();
    if (descriptionMatch) sections['Description'] = descriptionMatch[1].trim();
    if (tagsMatch) sections['Tags (Keywords)'] = tagsMatch[1].trim();
    if (categoryMatch) sections['Video Category'] = categoryMatch[1].trim();
    if (thumbnailPromptMatch) sections['Thumbnail Prompt (for AI)'] = thumbnailPromptMatch[1].trim();
    
    return sections;
};


export const SeoPack: React.FC<SeoPackProps> = ({ content }) => {
    const seoData = parseSeoContent(content);

    const renderSection = (title: string, value: string, showCopy: boolean) => (
        <div key={title}>
            <div className="flex justify-between items-center mb-2">
                <h4 className="text-lg font-bold font-serif text-base-content">{title}</h4>
                {showCopy && <CopyButton textToCopy={value} />}
            </div>
            <div className="p-3 bg-base-200/60 border-2 border-neutral/50 rounded-md">
                <p className="text-base-content/90 font-medium whitespace-pre-wrap">{value}</p>
            </div>
        </div>
    );

    return (
        <div className="p-4 rounded-[0.625rem] border-2 bg-base-100 text-base-content border-neutral font-medium max-w-2xl w-full flex flex-col gap-4">
            <h3 className="text-xl font-bold font-serif text-center text-primary-focus">YouTube SEO Pack</h3>
            {seoData['Title'] && renderSection('Title', seoData['Title'], true)}
            {seoData['Description'] && renderSection('Description', seoData['Description'], true)}
            {seoData['Tags (Keywords)'] && renderSection('Tags (Keywords)', seoData['Tags (Keywords)'], true)}
            {seoData['Video Category'] && renderSection('Video Category', seoData['Video Category'], false)}
            {seoData['Thumbnail Prompt (for AI)'] && renderSection('Thumbnail Prompt', seoData['Thumbnail Prompt (for AI)'], true)}
        </div>
    );
};