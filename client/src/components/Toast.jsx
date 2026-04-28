import { useEffect, useRef, useState } from 'react';

let toastFn = null;

export function showToast(message, type = 'success') {
  if (toastFn) toastFn(message, type);
}

export default function Toast() {
  const [toast, setToast] = useState(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    toastFn = (message, type) => {
      setToast({ message, type });
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        setToast(null);
        timeoutRef.current = null;
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
    <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl
      shadow-lg text-white text-sm font-medium max-w-sm animate-fade-in
      ${toast.type === 'success' ? 'bg-primary-600' : 'bg-red-500'}`}>
      {toast.message}
    </div>
  );
}
