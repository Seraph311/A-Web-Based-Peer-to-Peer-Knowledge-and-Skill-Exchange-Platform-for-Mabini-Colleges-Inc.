import { useEffect, useRef, useState } from 'react';

let toastFn = null;

export function showToast(message, type = 'success') {
  if (toastFn) toastFn(message, type);
}

function SuccessIcon() {
  return (
    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" className="animate-draw-check" />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

export default function Toast() {
  const [toast, setToast] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    toastFn = (message, type) => {
      setToast({ message, type });
      setIsVisible(false);
      setTimeout(() => setIsVisible(true), 10);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => {
          setToast(null);
          timeoutRef.current = null;
        }, 300);
      }, 3500);
    };
    return () => {
      toastFn = null;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  if (!toast) return null;

  return (
    <div className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl
      shadow-xl text-white text-sm font-medium max-w-sm flex items-center gap-3
      transition-all duration-300 ease-out-quart
      ${toast.type === 'success' ? 'bg-gradient-to-r from-primary-500 to-primary-600' : 'bg-gradient-to-r from-red-500 to-red-600'}
      ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
      <div className={`w-7 h-7 rounded-full flex items-center justify-center
        ${toast.type === 'success' ? 'bg-white/20' : 'bg-white/20'}`}>
        {toast.type === 'success' ? <SuccessIcon /> : <ErrorIcon />}
      </div>
      {toast.message}
    </div>
  );
}
