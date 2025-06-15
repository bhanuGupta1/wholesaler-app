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

        case 'dateRange': return ( <div key={config.name}> <label className={labelClass}> {config.label} </label> <select value={filters[config.name] || ''} onChange={(e) => handleFilterChange(config.name, e.target.value)} className={baseInputClass} > <option value="">All Time</option> <option value="today">Today</option> <option value="yesterday">Yesterday</option> <option value="week">This Week</option> <option value="month">This Month</option> <option value="quarter">This Quarter</option> <option value="year">This Year</option> </select> </div> ); case 'number': return ( <div key={config.name}> <label className={labelClass}> {config.label} </label> <input type="number" min={config.min || 0} step={config.step || 1} value={filters[config.name] || ''} onChange={(e) => handleFilterChange(config.name, e.target.value)} placeholder={config.placeholder} className={baseInputClass} /> </div> ); case 'range': return ( <div key={config.name}> <label className={labelClass}> {config.label} </label> <div className="flex space-x-2"> <input type="number" min={config.min || 0} step={config.step || 1} value={filters[`${config.name}Min`] || ''} onChange={(e) => handleFilterChange(`${config.name}Min`, e.target.value)} placeholder={config.placeholders?.[0] || 'Min'} className={baseInputClass} /> <input type="number" min={config.min || 0} step={config.step || 1} value={filters[`${config.name}Max`] || ''} onChange={(e) => handleFilterChange(`${config.name}Max`, e.target.value)} placeholder={config.placeholders?.[1] || 'Max'} className={baseInputClass} /> </div> </div> ); case 'text': return ( <div key={config.name}> <label className={labelClass}> {config.label} </label> <input type="text" value={filters[config.name] || ''} onChange={(e) => handleFilterChange(config.name, e.target.value)} placeholder={config.placeholder} className={baseInputClass} /> </div> ); case 'multiselect': return ( <div key={config.name}> <label className={labelClass}> {config.label} </label> <div className="space-y-2 max-h-32 overflow-y-auto"> {config.options.map(option => ( <label key={option.value} className="flex items-center"> <input type="checkbox" checked={(filters[config.name] || []).includes(option.value)} onChange={(e) => { const currentValues = filters[config.name] || []; const newValues = e.target.checked ? [...currentValues, option.value] : currentValues.filter(v => v !== option.value); handleFilterChange(config.name, newValues); }} className="mr-2" /> <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}> {option.label} </span> </label> ))} </div> </div> ); 
        default: 
        return null;
     } };
      return (
    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm ${className}`}>
      <div className="p-4">
        {/* Search Bar */}
        {showSearch && (
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                className={`block w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300'
                }`}
              />
            </div>
          </div>
        )}

        {/* Filter Toggle and Actions */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`flex items-center px-4 py-2 border rounded-lg transition-colors ${
              isExpanded
                ? 'bg-indigo-600 text-white border-indigo-600'
                : darkMode
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
            {activeFiltersCount > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {activeFiltersCount}
              </span>
            )}
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 ml-2" />
            ) : (
              <ChevronDown className="w-4 h-4 ml-2" />
            )}
          </button>

          {activeFiltersCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="flex items-center px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 mr-1" />
              Clear All
            </button>
          )}
        </div>

        {/* Filter Fields */}
        {isExpanded && filterConfig.length > 0 && (
          <div className={`p-4 border rounded-lg space-y-4 ${
            darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'
          }`}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filterConfig.map(renderFilterField)}
            </div>
          </div>
        )}

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <div className="mt-4">
            <div className="flex flex-wrap gap-2">
              {searchTerm && (
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                  darkMode ? 'bg-indigo-900/30 text-indigo-400' : 'bg-indigo-100 text-indigo-800'
                }`}>
                  Search: "{searchTerm}"
                  <button
                    onClick={() => onSearchChange && onSearchChange('')}
                    className="ml-2 text-indigo-600 hover:text-indigo-800"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              
              {Object.entries(filters).map(([key, value]) => {
                if (!value || value === '' || (Array.isArray(value) && value.length === 0)) return null;
                
                const config = filterConfig.find(f => f.name === key || f.name === key.replace(/Min|Max$/, ''));
                const label = config?.label || key;
                
                return (
                  <span
                    key={key}
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                      darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {label}: {Array.isArray(value) ? value.join(', ') : value}
                    <button
                      onClick={() => handleFilterChange(key, Array.isArray(value) ? [] : '')}
                      className={`ml-2 ${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

