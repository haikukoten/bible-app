'use client';

import { useEffect } from 'react';

export default function CapiViewTracker() {
  useEffect(() => {
    // Trigger the Conversions API 'ViewContent' event
    fetch('/api/capi', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        eventName: 'ViewContent',
        eventSourceUrl: window.location.href,
        actionSource: 'website',
      }),
    }).catch((err) => console.error('Failed to send CAPI ViewContent event', err));
  }, []);

  return null; // This component doesn't render anything visible
}
