import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  if (!isOpen) return null;

  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-2 sm:p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className={`relative bg-white rounded-xl shadow-xl w-full ${sizes[size]} max-h-[calc(100dvh-1rem)] sm:max-h-[calc(100dvh-2rem)] overflow-hidden flex flex-col`}>
        <div className="shrink-0 bg-white flex items-center justify-between gap-3 px-3 py-2 sm:px-6 sm:py-3 border-b border-gray-200">
          <h2 className="text-sm sm:text-xl font-semibold text-gray-900 min-w-0 truncate">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="fixed top-3 right-3 z-[90] h-10 w-10 sm:static sm:h-10 sm:w-10 shrink-0 inline-flex items-center justify-center rounded-full border border-gray-300 bg-white text-gray-900 shadow-xl ring-2 ring-white hover:bg-gray-100"
            aria-label="Close modal"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
        <div className="overflow-y-auto px-2.5 py-2 sm:px-6 sm:py-4 text-xs sm:text-sm">{children}</div>
      </div>
    </div>
  );
}
