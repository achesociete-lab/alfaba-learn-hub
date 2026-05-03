import { useEffect } from 'react';

declare global {
  interface Window {
    gtag?: (command: string, ...args: any[]) => void;
  }
}

export function useAnalytics() {
  const trackEvent = (eventName: string, eventParams?: Record<string, any>) => {
    if (window.gtag) {
      window.gtag('event', eventName, eventParams);
    }
  };

  const trackConversion = (plan: string, value: number) => {
    trackEvent('purchase', {
      value,
      currency: 'EUR',
      items: [{ item_id: plan, item_name: plan, quantity: 1 }],
    });
  };

  const trackLessonCompletion = (lessonId: number, level: string) => {
    trackEvent('lesson_complete', { lesson_id: lessonId, level });
  };

  const trackSignup = (provider: string) => {
    trackEvent('sign_up', { method: provider });
  };

  return { trackEvent, trackConversion, trackLessonCompletion, trackSignup };
}
