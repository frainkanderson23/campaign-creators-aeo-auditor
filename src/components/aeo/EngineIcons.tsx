'use client';

export function OpenAIIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.2 8.57c.5-1.6.2-3.4-.9-4.7a5.4 5.4 0 0 0-5.8-2.1A5.4 5.4 0 0 0 11.4 0C9.6 0 7.9.9 6.9 2.4a5.4 5.4 0 0 0-3.6 2.6 5.4 5.4 0 0 0 .7 6.3 5.4 5.4 0 0 0 .9 4.7 5.4 5.4 0 0 0 5.8 2.1A5.4 5.4 0 0 0 14.8 24c1.8 0 3.5-.9 4.5-2.4a5.4 5.4 0 0 0 3.6-2.6 5.4 5.4 0 0 0-.7-6.3v-.1zM14.8 22.3a4 4 0 0 1-2.6-.9l.1-.1 4.3-2.5c.2-.1.4-.4.4-.6v-6.1l1.8 1v6.2a4 4 0 0 1-4 4zM4 18.1a4 4 0 0 1-.5-2.7v-.2l4.3 2.5c.2.1.5.1.7 0l5.3-3v2.1l-4.4 2.5A4 4 0 0 1 4 18.1zM2.6 7.9a4 4 0 0 1 2.1-1.8v5.3c0 .3.1.5.4.6l5.3 3-1.8 1L4.2 13.6A4 4 0 0 1 2.6 8v-.1zm16.1 3.7-5.3-3L15.2 7.6l4.4 2.5a4 4 0 0 1 1.5 5.5 4 4 0 0 1-1.5 1.5V12c0-.2-.1-.5-.4-.6l-.5.2zm1.8-2.8-.1.1-4.3-2.5c-.2-.1-.5-.1-.7 0l-5.3 3V7.3L14.5 4.8a4 4 0 0 1 6 4zm-11.3 3.8L7.4 11.6v-2.1l1.8 1 1.8 1v2.1zm-1-4.5L12 5.6l3.8 2.2v4.4L12 14.4l-3.8-2.2z" fill="currentColor"/>
    </svg>
  );
}

export function PerplexityIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 1L4 5v6l8 4 8-4V5l-8-4zM4 13v6l8 4 8-4v-6l-8 4-8-4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
      <path d="M12 1v10M4 5l8 4 8-4M4 13l8 4 8-4" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  );
}

export function GoogleAIIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L9 9l-7 3 7 3 3 7 3-7 7-3-7-3-3-7z" fill="currentColor"/>
      <path d="M5 2L4 5l-3 1 3 1 1 3 1-3 3-1-3-1-1-3z" fill="currentColor" opacity="0.6"/>
    </svg>
  );
}

export function ClaudeIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2c.3 0 .5.3.5.5L13 9l5-4.5c.3-.2.6 0 .7.3l.1.2-4.5 5 6.5.5c.3 0 .5.3.4.6l-.1.2-6.5.5 4.5 5c.2.3 0 .6-.3.7l-.2.1-5-4.5-.5 6.5c0 .3-.3.5-.6.4l-.2-.1-.5-6.5-5 4.5c-.3.2-.6 0-.7-.3l-.1-.2 4.5-5-6.5-.5c-.3 0-.5-.3-.4-.6l.1-.2 6.5-.5L6.3 5.8c-.2-.3 0-.6.3-.7l.2-.1 5 4.5.5-6.5c0-.3.2-.5.5-.5h.2z" fill="currentColor"/>
    </svg>
  );
}
