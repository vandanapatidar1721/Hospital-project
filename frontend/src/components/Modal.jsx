export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  if (!isOpen) return null;

  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-2 sm:p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className={`relative bg-white rounded-xl shadow-xl w-full ${sizes[size]} max-h-[calc(100vh-1rem)] sm:max-h-[90vh] overflow-y-auto mt-2 sm:mt-0`}>
        <div className="flex items-center justify-between gap-3 p-4 sm:p-6 border-b border-gray-200">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 min-w-0 truncate">{title}</h2>
          <button onClick={onClose} className="min-h-11 min-w-11 inline-flex items-center justify-center text-gray-400 hover:text-gray-700 text-2xl leading-none rounded-lg hover:bg-gray-100">&times;</button>
        </div>
        <div className="p-4 sm:p-6">{children}</div>
      </div>
    </div>
  );
}
