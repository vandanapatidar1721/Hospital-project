import { Search } from 'lucide-react';

export default function SearchBar({ value, onChange, placeholder = 'Search...', className = '' }) {
  return (
    <div className={`relative group ${className}`}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input-field pr-9 w-full sm:w-80 shadow-sm"
      />
      <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-400 group-focus-within:text-primary-600 transition-colors" />
    </div>
  );
}
