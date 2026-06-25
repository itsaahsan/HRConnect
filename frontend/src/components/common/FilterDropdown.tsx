import React from 'react';
import { ChevronDown } from 'lucide-react';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
  label?: string;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({ value, onChange, options, label }) => {
  return (
    <div className="relative">
      {label && (
        <label className="block text-sm font-medium text-gray-400 mb-1">{label}</label>
      )}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="input-field appearance-none pr-10 cursor-pointer"
        >
          <option value="">All</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );
};

export default FilterDropdown;
