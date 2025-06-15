import React, { useState, useEffect } from 'react';
import { Filter, X, Search, Calendar, DollarSign, Tag, ChevronDown, ChevronUp } from 'lucide-react';

const AdvancedFilter = ({
  filters,
  onFilterChange,
  onClearFilters,
  searchTerm,
  onSearchChange,
  darkMode = false,
  filterConfig = [],
  showSearch = true,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  useEffect(() => {
    const count = Object.values(filters).filter(value => value && value !== '').length + 
                 (searchTerm ? 1 : 0);
    setActiveFiltersCount(count);
  }, [filters, searchTerm]);

  const handleFilterChange = (filterName, value) => {
    onFilterChange({
      ...filters,
      [filterName]: value
    });
  };

  const clearAllFilters = () => {
    onClearFilters();
    onSearchChange && onSearchChange('');
  };

    const renderFilterField = (config) => {
    const baseInputClass = `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
      darkMode 
        ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' 
        : 'bg-white border-gray-300'
    }`;

    const labelClass = `block text-sm font-medium mb-2 ${
      darkMode ? 'text-gray-300' : 'text-gray-700'
    }`;

    switch (config.type) {
      case 'select':
        return (
          <div key={config.name}>
            <label className={labelClass}>
              {config.label}
            </label>
            <select
              value={filters[config.name] || ''}
              onChange={(e) => handleFilterChange(config.name, e.target.value)}
              className={baseInputClass}
            >
              <option value="">{config.placeholder || `All ${config.label}`}</option>
              {config.options.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        );

      case 'date':
        return (
          <div key={config.name}>
            <label className={labelClass}>
              {config.label}
            </label>
            <input
              type="date"
              value={filters[config.name] || ''}
              onChange={(e) => handleFilterChange(config.name, e.target.value)}
              className={baseInputClass}
            />
          </div>
        );