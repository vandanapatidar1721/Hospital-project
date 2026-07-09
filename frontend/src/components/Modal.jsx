import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  if (!isOpen) return null;

  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

  return (
    <div className="fixed inset-0 z-[70] flex items-start sm:items-center justify-center p-1.5 sm:p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className={`relative bg-white rounded-xl shadow-xl w-full ${sizes[size]} max-h-[calc(100dvh-0.75rem)] sm:max-h-[90vh] overflow-hidden mt-1 sm:mt-0 flex flex-col`}>
        <button
          type="button"
          onClick={onClose}
          className="absolute top-2 right-2 z-30 h-8 w-8 sm:h-10 sm:w-10 shrink-0 inline-flex items-center justify-center rounded-full border border-gray-300 bg-white text-gray-800 shadow-md hover:bg-gray-100 hover:text-gray-900"
          aria-label="Close modal"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        <div className="shrink-0 bg-white flex items-start justify-between gap-2 p-2.5 pr-12 sm:p-6 sm:pr-16 border-b border-gray-200">
          <h2 className="text-sm sm:text-xl font-semibold text-gray-900 min-w-0 truncate pt-1">{title}</h2>
        </div>
        <div className="overflow-y-auto p-2.5 sm:p-6 text-xs sm:text-sm">{children}</div>
      </div>
    </div>
  );
}
