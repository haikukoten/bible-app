'use client';

import { useEffect } from 'react';

export default function CapiFormTracker() {
  useEffect(() => {
    const handleSubmit = (e: SubmitEvent) => {
      // Check if the form is an Audienceful form
      const target = e.target as HTMLElement;
      if (target && target.classList) {
        const isAudienceful = Array.from(target.classList).some((cls) =>
          cls.startsWith('audienceful-form')
        );

        if (isAudienceful) {
          // Trigger the Conversions API 'SubmitApplication' event
          fetch('/api/capi', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              eventName: 'SubmitApplication',
              eventSourceUrl: window.location.href,
              actionSource: 'website',
            }),
          }).catch((err) => console.error('Failed to send CAPI event', err));
        }
      }
    };

    // Attach to document to catch dynamically injected forms (event delegation)
    // Use capture phase to ensure we intercept it even if another script calls stopPropagation
    document.addEventListener('submit', handleSubmit, true);

    return () => {
      document.removeEventListener('submit', handleSubmit, true);
    };
  }, []);

  return null; // This component doesn't render anything visible
}
