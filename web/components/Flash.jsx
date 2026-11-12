'use client';

import { useEffect } from 'react';

const ICONS = { success: '✓', error: '!', info: 'i' };

export default function Flash({ flash, onClear }) {
  useEffect(() => {
    if (!flash) return undefined;
    const timer = window.setTimeout(() => onClear?.(), 6000);
    return () => window.clearTimeout(timer);
  }, [flash, onClear]);

  if (!flash) return null;

  const type = ['success', 'error', 'info'].includes(flash.type) ? flash.type : 'info';

  return (
    <div className={`flash flash--${type}`} role="status">
      <span aria-hidden="true">{ICONS[type]}</span>
      <span>{flash.message}</span>
    </div>
  );
}
