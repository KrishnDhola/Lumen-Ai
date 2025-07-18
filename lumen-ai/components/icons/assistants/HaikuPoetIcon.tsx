
import React from 'react';

export const HaikuPoetIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 22V8" />
    <path d="M22 10a5 5 0 0 0-10 0" />
    <path d="M2 10a5 5 0 0 1 10 0" />
    <path d="m17 9 1.34 2.66" />
    <path d="m7 9-1.34 2.66" />
    <path d="m12 2-1.5 2.5" />
    <path d="M12 14a3 3 0 0 0-3 3" />
  </svg>
);
