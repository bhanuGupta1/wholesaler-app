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