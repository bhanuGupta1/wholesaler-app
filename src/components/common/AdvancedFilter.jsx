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
