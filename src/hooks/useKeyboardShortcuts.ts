import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function useKeyboardShortcuts() {
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't trigger when typing in inputs
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === '/' && !e.ctrlKey) {
        e.preventDefault();
        // Focus sidebar search
        const search = document.querySelector('input[placeholder="Search menu..."]') as HTMLInputElement;
        if (search) search.focus();
      }
      if (e.altKey) {
        switch (e.key) {
          case 'j': e.preventDefault(); navigate('/admin/erp/job-cards'); break;
          case 'c': e.preventDefault(); navigate('/admin/erp/crm'); break;
          case 'b': e.preventDefault(); navigate('/admin/erp/billing'); break;
          case 'i': e.preventDefault(); navigate('/admin/inventory'); break;
          case 'd': e.preventDefault(); navigate('/admin/erp'); break;
          case 'l': e.preventDefault(); navigate('/admin/erp/live'); break;
        }
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [navigate]);
}
