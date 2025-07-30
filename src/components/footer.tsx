import React from 'react';
import { GitHubIcon } from './icons/github-icon';

export function Footer() {
  return (
    <footer className="w-full py-4 border-t border-border/40 bg-background/80 flex justify-center items-center">
      <span className="text-sm text-muted-foreground">
        Design  & Developed by Sumanth with  <span role="img" aria-label="love">❤️</span>
      </span>
      <a
        href="https://github.com/sumanth639/"
        target="_blank"
        rel="noopener noreferrer"
        className="ml-2 inline-flex items-center underline hover:text-primary text-sm text-muted-foreground"
      >
        <GitHubIcon className="w-5 h-5 mr-1 inline" />
      
      </a>
    </footer>
  );
}