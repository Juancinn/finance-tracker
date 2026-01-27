import React from 'react';
import './DateFilter.css';

export const DateFilter = ({ activeFilter, onFilterChange }) => {
  return (
    <div className="filter-container">
      <button 
        className={`filter-pill ${activeFilter === 'all' ? 'active' : ''}`}
        onClick={() => onFilterChange('all')}
      >
        All Time
      </button>

      <button 
        className={`filter-pill ${activeFilter === 'paycheck' ? 'active' : ''}`}
        onClick={() => onFilterChange('paycheck')}
      >
        Last Paycheck
      </button>

      <button 
        className={`filter-pill ${activeFilter === '30days' ? 'active' : ''}`}
        onClick={() => onFilterChange('30days')}
      >
        Last 30 Days
      </button>

      <button 
        className={`filter-pill ${activeFilter === 'custom' ? 'active' : ''}`}
        onClick={() => onFilterChange('custom')}
      >
        Custom...
      </button>
    </div>
  );
};