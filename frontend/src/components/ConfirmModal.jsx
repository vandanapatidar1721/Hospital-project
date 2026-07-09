import { AlertTriangle, Loader2, Trash2 } from 'lucide-react';
import Modal from './Modal';

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmText = 'Delete',
  loading = false,
  icon = 'delete',
}) {
  const Icon = icon === 'warning' ? AlertTriangle : Trash2;

  return (
    <Modal isOpen={isOpen} onClose={() => !loading && onClose()} title={title} size="sm">
      <div className="space-y-4 text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
          <Icon className="w-6 h-6" />
        </div>
        <p className="text-sm text-gray-500">{message}</p>
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="btn-secondary gap-1.5 px-3 py-1.5 text-xs"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="btn-danger gap-1.5 px-3 py-1.5 text-xs"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Icon className="w-3.5 h-3.5" />}
            {loading ? 'Please wait...' : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
