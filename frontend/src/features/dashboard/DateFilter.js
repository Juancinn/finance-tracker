import React from 'react';
import './DateFilter.css';

export const DateFilter = ({ activeFilter, onFilterChange, dateRange }) => {
  
  // Helper to format dates for the "Active Range" display
  const formatDate = (dateStr) => {
    if (!dateStr) return "Present";
    const date = new Date(dateStr + "T00:00:00"); // Append time to fix timezone offset
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getRangeLabel = () => {
    if (activeFilter === 'all') return "All History";
    const start = formatDate(dateRange.start);
    const end = dateRange.end ? formatDate(dateRange.end) : "Present";
    return `${start} — ${end}`;
  };

  return (
    <div className="filter-wrapper">
      <div className="filter-container">
        <button 
          className={`filter-pill ${activeFilter === 'all' ? 'active' : ''}`}
          onClick={() => onFilterChange('all')}
        >
          All Time
        </button>

        <button 
          className={`filter-pill ${activeFilter === 'month' ? 'active' : ''}`}
          onClick={() => onFilterChange('month')}
        >
          This Month
        </button>

        <button 
          className={`filter-pill ${activeFilter === 'paycheck' ? 'active' : ''}`}
          onClick={() => onFilterChange('paycheck')}
        >
          Paycheck
        </button>

        <button 
          className={`filter-pill ${activeFilter === '30days' ? 'active' : ''}`}
          onClick={() => onFilterChange('30days')}
        >
          30 Days
        </button>

        <button 
          className={`filter-pill ${activeFilter === 'custom' ? 'active' : ''}`}
          onClick={() => onFilterChange('custom')}
        >
          Custom
        </button>
      </div>

      {activeFilter !== 'all' && (
        <div className="filter-range-display">
          Showing: <strong>{getRangeLabel()}</strong>
        </div>
      )}
    </div>
  );
};