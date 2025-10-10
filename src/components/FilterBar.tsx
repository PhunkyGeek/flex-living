import { ChangeEvent } from 'react';

interface FilterBarProps {
  search: string;
  channel: string;
  type: string;
  minRating: number;
  sortBy: string;
  category: string;
  channels: string[];
  types: string[];
  categories: string[];
  onFilterChange: (name: string, value: any) => void;
}

/**
 * FilterBar provides a set of controls for narrowing down the reviews shown on
 * the dashboard.  It allows searching by listing name, filtering by channel
 * and review type, setting a minimum rating and toggling the approved
 * state.  The parent component is responsible for applying the filters.
 */
export default function FilterBar({
  search,
  channel,
  type,
  minRating,
  sortBy,
  category,
  channels,
  types,
  categories,
  onFilterChange,
}: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-4 p-4 bg-white shadow rounded-md">
      <input
        type="text"
        placeholder="Search listings..."
        value={search}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onFilterChange('search', e.target.value)}
        className="flex-grow border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
      />
      <select
        value={channel}
        onChange={(e) => onFilterChange('channel', e.target.value)}
        className="border border-gray-300 rounded-md px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
      >
        <option value="">All Channels</option>
        {channels.map((opt) => (
          <option key={opt} value={opt}>
            {opt.charAt(0).toUpperCase() + opt.slice(1)}
          </option>
        ))}
      </select>
      <select
        value={type}
        onChange={(e) => onFilterChange('type', e.target.value)}
        className="border border-gray-300 rounded-md px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
      >
        <option value="">All Types</option>
        {types.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <select
        value={category}
        onChange={(e) => onFilterChange('category', e.target.value)}
        className="border border-gray-300 rounded-md px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
      >
        <option value="">All Categories</option>
        {categories.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <select
        value={minRating}
        onChange={(e) => onFilterChange('minRating', Number(e.target.value))}
        className="border border-gray-300 rounded-md px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
      >
        <option value={0}>Min Rating</option>
        {[5, 4, 3, 2, 1].map((r) => (
          <option key={r} value={r}>
            {r}+
          </option>
        ))}
      </select>
      <select
        value={sortBy}
        onChange={(e) => onFilterChange('sortBy', e.target.value)}
        className="border border-gray-300 rounded-md px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
      >
        <option value="relevance">Sort: Relevance</option>
        <option value="rating_desc">Rating (high → low)</option>
        <option value="rating_asc">Rating (low → high)</option>
        <option value="newest">Newest reviews</option>
        <option value="oldest">Oldest reviews</option>
      </select>
      {/* <div className="ml-auto text-sm text-gray-500">Filter / Sort</div> */}
    </div>
  );
}