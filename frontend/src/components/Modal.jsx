import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, size = 'md', placement = 'center', titleClassName = 'text-sm sm:text-base font-semibold text-gray-900' }) {
  if (!isOpen) return null;

  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  const placements = {
    center: 'items-center p-2 sm:p-4',
    top: 'items-start p-2 sm:p-4',
  };

  return (
    <div className={`fixed inset-0 z-[70] flex justify-center ${placements[placement] || placements.center}`}>
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className={`relative bg-white rounded-xl shadow-xl w-[calc(100vw-1rem)] sm:w-full ${sizes[size]} max-h-[calc(100dvh-1rem)] sm:max-h-[calc(100dvh-2rem)] overflow-hidden flex flex-col`}>
        <div className="shrink-0 bg-white flex items-center justify-between gap-2 px-3 py-1.5 sm:px-4 sm:py-2 border-b border-gray-200">
          <h2 className={`${titleClassName} min-w-0 truncate`}>{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 shrink-0 inline-flex items-center justify-center rounded-full border border-gray-300 bg-white text-gray-900 shadow-md ring-1 ring-white hover:bg-gray-100"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-y-auto px-2.5 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm">{children}</div>
      </div>
    </div>
  );
}
