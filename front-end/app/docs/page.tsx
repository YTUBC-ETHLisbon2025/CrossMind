"use client";
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';

export default function DocsPage() {
  const [content, setContent] = useState('');

  useEffect(() => {
    fetch('/documentation.md')
      .then(res => res.text())
      .then(text => setContent(text));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
       <div className="prose prose-black max-w-none">
      <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  );
} 