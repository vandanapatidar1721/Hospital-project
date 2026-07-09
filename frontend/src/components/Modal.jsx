import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  if (!isOpen) return null;

  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-2 sm:p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className={`relative bg-white rounded-xl shadow-xl w-full ${sizes[size]} max-h-[calc(100dvh-1rem)] sm:max-h-[calc(100dvh-2rem)] overflow-hidden flex flex-col`}>
        <button
          type="button"
          onClick={onClose}
          className="absolute top-2.5 right-2.5 sm:top-4 sm:right-4 z-50 h-9 w-9 sm:h-10 sm:w-10 shrink-0 inline-flex items-center justify-center rounded-full border border-gray-300 bg-white text-gray-900 shadow-lg ring-1 ring-black/5 hover:bg-gray-100"
          aria-label="Close modal"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        <div className="shrink-0 bg-white flex items-start justify-between gap-2 p-3 pr-14 sm:p-6 sm:pr-16 border-b border-gray-200">
          <h2 className="text-sm sm:text-xl font-semibold text-gray-900 min-w-0 truncate pt-1">{title}</h2>
        </div>
        <div className="overflow-y-auto p-2.5 sm:p-6 text-xs sm:text-sm">{children}</div>
      </div>
    </div>
  );
}
