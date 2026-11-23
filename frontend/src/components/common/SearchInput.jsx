import { Search } from 'lucide-react';

export default function SearchInput({ placeholder = 'Cari...', value, onChange }) {
  return (
    <div className="relative w-full">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <Search className="w-4 h-4 text-muted" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2.5 bg-white rounded border border-line text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
      />
    </div>
  );
}
