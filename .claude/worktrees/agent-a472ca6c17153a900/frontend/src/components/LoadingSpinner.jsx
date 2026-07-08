import { Inbox } from 'lucide-react';

export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="relative h-12 w-12">
        <div className="absolute inset-0 rounded-full border-4 border-primary-100" />
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-primary-600 border-r-primary-300" />
      </div>
    </div>
  );
}

export function EmptyState({ message = 'No records found' }) {
  return (
    <div className="card text-center py-14 text-gray-500">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-primary-50 text-primary-500">
        <Inbox className="h-7 w-7" />
      </div>
      <p className="font-medium">{message}</p>
    </div>
  );
}
